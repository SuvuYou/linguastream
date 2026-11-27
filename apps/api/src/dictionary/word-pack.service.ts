import { Inject, Injectable, Logger } from "@nestjs/common";
import type { PackWord, WordPack } from "@linguastream/contracts";
import { describeError } from "../processing/processing-error";
import type { SpendLimiter } from "../usage/spend-limiter";
import { VocabularyRepository } from "../vocabulary/vocabulary.repository";
import { DictionaryRepository, glossKey } from "./dictionary.repository";
import { WORD_AI, type WordAi } from "./word-ai";
import { glossKeyOf, packWord, pickEntry, type EntrySummary } from "./word-pack";
import { WordPackRepository, type PackTarget } from "./word-pack.repository";

export const GLOSS_BATCH = 80;
export const MISSING_BATCH = 60;
export const MAX_MISSING_PER_VIDEO = 300;

export interface PrepareReport {
  translated: number;
  described: number;
  calls: number;
  skipped: "not_imported" | "spend_cap" | null;
  failures: number;
}

type Spend = Pick<SpendLimiter, "canSpend">;

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

@Injectable()
export class WordPackService {
  private readonly logger = new Logger("WordPack");

  constructor(
    @Inject(DictionaryRepository) private readonly dictionary: DictionaryRepository,
    @Inject(WordPackRepository) private readonly packs: WordPackRepository,
    @Inject(WORD_AI) private readonly ai: WordAi,
    @Inject(VocabularyRepository) private readonly vocabulary: Pick<VocabularyRepository, "statuses">,
  ) {}

  async build(userId: string, videoId: string): Promise<WordPack | null> {
    const target = await this.packs.videoForUser(userId, videoId);
    if (!target) return null;
    const counts = await this.packs.lemmaCounts(videoId);
    const lemmas = counts.map((c) => c.lemma);
    const { entries, missing } = await this.lookup(target, lemmas);
    const [ranks, translations, aiWords, statuses] = await Promise.all([
      this.dictionary.ranks(target.language, lemmas),
      this.dictionary.glossTranslations(target.language, target.nativeLanguage, [...entries.values()].map(glossKeyOf)),
      this.dictionary.aiWords(target.language, target.nativeLanguage, missing),
      this.vocabulary.statuses(userId, target.language, lemmas),
    ]);
    const words: PackWord[] = counts.map(({ lemma, count }) => {
      const entry = entries.get(lemma) ?? null;
      return packWord(
        {
          lemma,
          count,
          entry,
          translation: entry ? (translations.get(glossKey(glossKeyOf(entry))) ?? null) : null,
          ai: aiWords.get(lemma) ?? null,
          rank: ranks.get(lemma) ?? null,
          status: statuses.get(lemma) ?? "unknown",
        },
        target.nativeLanguage,
      );
    });
    return { video_id: videoId, language: target.language, native_language: target.nativeLanguage, words };
  }

  async prepare(trackId: string, spend: Spend): Promise<PrepareReport> {
    const report: PrepareReport = { translated: 0, described: 0, calls: 0, skipped: null, failures: 0 };
    const target = await this.packs.trackTarget(trackId);
    if (!target) return report;
    if (!(await this.dictionary.isImported(target.language))) {
      report.skipped = "not_imported";
      return report;
    }
    const lemmas = (await this.packs.lemmaCounts(target.videoId)).map((c) => c.lemma);
    const { entries, missing } = await this.lookup(target, lemmas);

    const ask = async <T>(call: () => Promise<T>): Promise<T | null> => {
      if (!(await spend.canSpend())) {
        report.skipped = "spend_cap";
        return null;
      }
      report.calls++;
      try {
        return await call();
      } catch (err) {
        report.failures++;
        this.logger.warn(`Track ${trackId}: word data call failed: ${describeError(err)}`);
        return null;
      }
    };

    const known = await this.dictionary.aiWords(target.language, target.nativeLanguage, missing);
    const toDescribe = missing.filter((l) => !known.has(l)).slice(0, MAX_MISSING_PER_VIDEO);
    const examples = await this.packs.examples(trackId, toDescribe);
    for (const batch of chunks(toDescribe, MISSING_BATCH)) {
      if (report.skipped) break;
      const answers = await ask(() =>
        this.ai.describeMissing(
          batch.map((word) => ({ word, example: examples.get(word) ?? null })),
          target.language,
          target.nativeLanguage,
        ),
      );
      if (!answers) continue;
      const words = batch.flatMap((lemma, i) => {
        const answer = answers.get(i);
        return answer ? [{ lemma, ...answer }] : [];
      });
      await this.dictionary.saveAiWords(target.language, target.nativeLanguage, words);
      report.described += words.length;
    }

    if (target.nativeLanguage !== "en") {
      const keys = [...new Map([...entries.values()].map((e) => [glossKey(glossKeyOf(e)), e])).values()].filter(
        (e) => e.firstGloss,
      );
      const have = await this.dictionary.glossTranslations(target.language, target.nativeLanguage, keys.map(glossKeyOf));
      const todo = keys.filter((e) => !have.has(glossKey(glossKeyOf(e))));
      for (const batch of chunks(todo, GLOSS_BATCH)) {
        if (report.skipped) break;
        const answers = await ask(() =>
          this.ai.translateGlosses(
            batch.map((e) => ({ word: e.word, pos: e.pos, gloss: glossKeyOf(e).gloss, example: e.firstExample })),
            target.language,
            target.nativeLanguage,
          ),
        );
        if (!answers) continue;
        const items = batch.flatMap((e, i) => {
          const text = answers.get(i);
          return text ? [{ ...glossKeyOf(e), text }] : [];
        });
        await this.dictionary.saveGlossTranslations(target.language, target.nativeLanguage, items);
        report.translated += items.length;
      }
    }
    return report;
  }

  private async lookup(target: PackTarget, lemmas: string[]) {
    const byLower = await this.dictionary.entries(target.language, lemmas);
    const entries = new Map<string, EntrySummary>();
    const missing: string[] = [];
    for (const lemma of lemmas) {
      const entry = pickEntry(lemma, byLower.get(lemma.toLowerCase()) ?? []);
      if (entry) entries.set(lemma, entry);
      else missing.push(lemma);
    }
    return { entries, missing };
  }
}
