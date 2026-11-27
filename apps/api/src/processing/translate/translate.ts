import type { TranslationErrorCode } from "@linguastream/contracts";
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

export class TranslationProviderError extends Error {
  constructor(
    readonly reason: string,
    readonly retryable: boolean,
  ) {
    super(`Translation provider failed (${reason})`);
    this.name = "TranslationProviderError";
  }
}


export interface ChunkFailure {
  fromLine: number;
  toLine: number;
  attempt: number;
  reason: string;
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
  errorCode: TranslationErrorCode | null;
  translatedLines: number;
  totalLines: number;
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
  retryDelayMs?: number;
  onProgress?: (done: number, total: number) => Promise<void> | void;
  onChunkFailure?: (failure: ChunkFailure) => void;
}

export const RETRY_DELAY_MS = 5_000;

class SpendCapReached extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function translationErrorCode(err: unknown): TranslationErrorCode {
  if (err instanceof SpendCapReached) return "spend_cap";
  if (err instanceof TranslationAnswerError) return "invalid_answer";
  if (err instanceof TranslationProviderError) return "provider_unavailable";
  return "internal";
}

function failureReason(err: unknown): string {
  if (err instanceof TranslationAnswerError) return `answer had ${err.received ?? "no"} of ${err.expected} lines`;
  if (err instanceof TranslationProviderError) return err.reason;
  return err instanceof Error ? err.name : typeof err;
}

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
    totalLines: lines.length,
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

  const failed = (from: number, to: number, attempt: number, err: unknown) =>
    deps.onChunkFailure?.({
      fromLine: lines[from]!.index,
      toLine: lines[to - 1]!.index,
      attempt,
      reason: failureReason(err),
    });

  const translateRange = async (from: number, to: number): Promise<void> => {
    let translations: string[];
    try {
      translations = await ask(from, to);
    } catch (err) {
      if (err instanceof SpendCapReached) throw err;
      failed(from, to, 1, err);
      if (err instanceof TranslationProviderError) {
        if (!err.retryable) throw err;
        await sleep(deps.retryDelayMs ?? RETRY_DELAY_MS);
      }
      const wrongAnswer = err instanceof TranslationAnswerError ? { received: err.received } : undefined;
      try {
        translations = await ask(from, to, wrongAnswer);
      } catch (again) {
        if (again instanceof SpendCapReached) throw again;
        failed(from, to, 2, again);
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
    await deps.onProgress?.(report.translatedLines, report.totalLines);
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
    report.errorCode = translationErrorCode(failure);
  }
  return report;
}
