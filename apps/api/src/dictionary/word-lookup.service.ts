import { Inject, Injectable } from "@nestjs/common";
import type { DictionaryEntry, WordLookup } from "@linguastream/contracts";
import { vocabularyLemma } from "../processing/index/lemma-counts";
import { VocabularyRepository } from "../vocabulary/vocabulary.repository";
import { DictionaryRepository, glossKey } from "./dictionary.repository";
import { glossKeyOf, packWord, pickEntry, type EntrySummary } from "./word-pack";
import { WordLookupRepository } from "./word-lookup.repository";

export interface LookupRequest {
  userId: string;
  videoId: string;
  index: number;
  i: number;
}

const summaryOf = (entry: DictionaryEntry): EntrySummary => ({
  word: entry.word,
  pos: entry.pos,
  gender: entry.gender,
  plural: entry.plural,
  flags: entry.flags,
  senseCount: entry.senses.length,
  firstGloss: entry.senses[0]?.gloss || null,
  firstExample: entry.senses[0]?.example ?? null,
});

@Injectable()
export class WordLookupService {
  constructor(
    @Inject(WordLookupRepository) private readonly lookups: WordLookupRepository,
    @Inject(DictionaryRepository) private readonly dictionary: DictionaryRepository,
    @Inject(VocabularyRepository) private readonly vocabulary: VocabularyRepository,
  ) {}

  async lookup({ userId, videoId, index, i }: LookupRequest): Promise<WordLookup | null> {
    const line = await this.lookups.line(userId, videoId, index);
    const word = line?.words.find((w) => w.i === i);
    if (!line || !word) return null;
    const { language, nativeLanguage } = line;
    const lemma = vocabularyLemma(word);
    const base = {
      video_id: videoId,
      line_index: index,
      line: { text: line.text, translation: line.translation },
      word: { i, text: word.text, pos: word.pos ?? null, morph: word.morph ?? null },
      language,
      native_language: nativeLanguage,
    };
    if (!lemma) {
      return {
        ...base,
        lemma: null,
        status: "unknown",
        rank: null,
        gloss: null,
        gloss_language: null,
        entries: [],
        forms: [],
        ai: null,
      };
    }

    const [found, forms, status, ranks] = await Promise.all([
      this.dictionary.fullEntries(language, lemma),
      this.dictionary.forms(language, lemma),
      this.vocabulary.status(userId, language, lemma),
      this.dictionary.ranks(language, [lemma]),
    ]);
    const entries = [...found.filter((e) => e.word === lemma), ...found.filter((e) => e.word !== lemma)];
    const entry = pickEntry(lemma, entries.map(summaryOf));
    const [translations, aiWords] = await Promise.all([
      entry && nativeLanguage !== "en"
        ? this.dictionary.glossTranslations(language, nativeLanguage, [glossKeyOf(entry)])
        : new Map<string, string>(),
      entry ? new Map() : this.dictionary.aiWords(language, nativeLanguage, [lemma]),
    ]);
    const ai = aiWords.get(lemma) ?? null;
    const packed = packWord(
      {
        lemma,
        count: 1,
        entry,
        translation: entry ? (translations.get(glossKey(glossKeyOf(entry))) ?? null) : null,
        ai,
        rank: ranks.get(lemma) ?? null,
        status,
      },
      nativeLanguage,
    );
    return {
      ...base,
      lemma,
      status,
      rank: packed.rank,
      gloss: packed.gloss,
      gloss_language: packed.gloss_language,
      entries,
      forms,
      ai,
    };
  }
}
