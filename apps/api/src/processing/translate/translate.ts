export const CHUNK_LINES = 40;
export const CONTEXT_LINES = 3;
export const CONCURRENCY = 3;

export interface TranslationRequest {
  lines: string[];
  before: string[];
  after: string[];
  sourceLanguage: string;
  targetLanguage: string;
  wrongAnswer?: { received: number | null };
}

export interface TranslationAnswer {
  translations: string[];
  costMicroUsd: number;
}

export type Translator = (request: TranslationRequest) => Promise<TranslationAnswer>;

export class TranslationAnswerError extends Error {
  constructor(
    readonly expected: number,
    readonly received: number | null,
  ) {
    super(`Expected ${expected} translations, got ${received ?? "no list"}`);
    this.name = "TranslationAnswerError";
  }
}

export interface SourceLine {
  lineId: string;
  index: number;
  text: string;
  translated: boolean;
}

export interface TranslatedLine {
  lineId: string;
  text: string;
}

export interface TranslationReport {
  status: "ready" | "failed";
  errorCode: "internal" | "spend_cap" | null;
  translatedLines: number;
  chunks: number;
  calls: number;
  costMicroUsd: number;
}

export interface TranslateDeps {
  translate: Translator;
  canSpend: () => Promise<boolean>;
  save: (lines: TranslatedLine[]) => Promise<void>;
  sourceLanguage: string;
  targetLanguage: string;
  chunkLines?: number;
  concurrency?: number;
}

class SpendCapReached extends Error {}

function pendingRuns(lines: SourceLine[], size: number): [number, number][] {
  const runs: [number, number][] = [];
  let start = -1;
  for (let i = 0; i <= lines.length; i++) {
    const pending = i < lines.length && !lines[i]!.translated;
    if (pending && start === -1) start = i;
    if ((!pending || i - start === size) && start !== -1) {
      runs.push([start, i]);
      start = pending ? i : -1;
    }
  }
  return runs;
}

export async function translateLines(lines: SourceLine[], deps: TranslateDeps): Promise<TranslationReport> {
  const report: TranslationReport = {
    status: "ready",
    errorCode: null,
    translatedLines: lines.filter((l) => l.translated).length,
    chunks: 0,
    calls: 0,
    costMicroUsd: 0,
  };
  const queue = pendingRuns(lines, deps.chunkLines ?? CHUNK_LINES);
  report.chunks = queue.length;

  const ask = async (from: number, to: number, wrongAnswer?: { received: number | null }) => {
    if (!(await deps.canSpend())) throw new SpendCapReached();
    report.calls++;
    const answer = await deps.translate({
      lines: lines.slice(from, to).map((l) => l.text),
      before: lines.slice(Math.max(0, from - CONTEXT_LINES), from).map((l) => l.text),
      after: lines.slice(to, to + CONTEXT_LINES).map((l) => l.text),
      sourceLanguage: deps.sourceLanguage,
      targetLanguage: deps.targetLanguage,
      ...(wrongAnswer && { wrongAnswer }),
    });
    report.costMicroUsd += answer.costMicroUsd;
    if (answer.translations.length !== to - from)
      throw new TranslationAnswerError(to - from, answer.translations.length);
    return answer.translations;
  };

  const translateRange = async (from: number, to: number): Promise<void> => {
    let translations: string[];
    try {
      translations = await ask(from, to);
    } catch (err) {
      if (err instanceof SpendCapReached) throw err;
      const wrongAnswer = err instanceof TranslationAnswerError ? { received: err.received } : undefined;
      try {
        translations = await ask(from, to, wrongAnswer);
      } catch (again) {
        if (again instanceof TranslationAnswerError && to - from > 1) {
          const middle = from + Math.ceil((to - from) / 2);
          await translateRange(from, middle);
          await translateRange(middle, to);
          return;
        }
        throw again;
      }
    }
    await deps.save(translations.map((text, i) => ({ lineId: lines[from + i]!.lineId, text: text.trim() })));
    report.translatedLines += to - from;
  };

  let failure: unknown = null;
  const worker = async () => {
    while (failure === null) {
      const next = queue.shift();
      if (!next) return;
      try {
        await translateRange(next[0], next[1]);
      } catch (err) {
        failure ??= err;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(deps.concurrency ?? CONCURRENCY, queue.length) }, worker));

  if (failure !== null) {
    report.status = "failed";
    report.errorCode = failure instanceof SpendCapReached ? "spend_cap" : "internal";
  }
  return report;
}
