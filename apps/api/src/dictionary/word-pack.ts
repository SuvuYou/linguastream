import type { PackWord, WordStatus } from "@linguastream/contracts";
import type { GlossKey } from "./dictionary.repository";

export interface EntrySummary {
  word: string;
  pos: string;
  gender: string | null;
  plural: string | null;
  flags: string[];
  senseCount: number;
  firstGloss: string | null;
  firstExample: string | null;
}

export interface AiWord {
  pos: string | null;
  gender: string | null;
  gloss: string | null;
  parts: string[];
}

export function shortGloss(gloss: string): string {
  const withoutLabels = gloss.replace(/^(\([^)]*\)\s*)+/, "");
  const cut = withoutLabels.split(/;|\(/)[0]!.trim();
  return cut || gloss.trim();
}

export function pickEntry(lemma: string, entries: EntrySummary[]): EntrySummary | null {
  const best = (list: EntrySummary[]) =>
    list.reduce<EntrySummary | null>((top, e) => (!top || e.senseCount > top.senseCount ? e : top), null);
  return (
    best(entries.filter((e) => e.word === lemma)) ??
    best(entries.filter((e) => e.word.toLowerCase() === lemma.toLowerCase()))
  );
}

export function glossKeyOf(entry: EntrySummary): GlossKey {
  return { word: entry.word, pos: entry.pos, gloss: entry.firstGloss ? shortGloss(entry.firstGloss) : "" };
}

export interface PackInput {
  lemma: string;
  count: number;
  entry: EntrySummary | null;
  translation: string | null;
  ai: AiWord | null;
  rank: number | null;
  status: WordStatus;
}

export function packWord(input: PackInput, nativeLanguage: string): PackWord {
  const { lemma, count, entry, ai, rank, status } = input;
  if (entry) {
    const english = entry.firstGloss ? shortGloss(entry.firstGloss) : null;
    const translated = nativeLanguage !== "en" ? input.translation : null;
    return {
      lemma,
      count,
      pos: entry.pos,
      gender: entry.gender,
      plural: entry.plural,
      flags: entry.flags,
      gloss: translated ?? english,
      gloss_language: translated ? nativeLanguage : english ? "en" : null,
      source: "dictionary",
      rank,
      parts: [],
      status,
    };
  }
  return {
    lemma,
    count,
    pos: ai?.pos ?? null,
    gender: ai?.gender ?? null,
    plural: null,
    flags: [],
    gloss: ai?.gloss ?? null,
    gloss_language: ai?.gloss ? nativeLanguage : null,
    source: ai ? "ai" : null,
    rank,
    parts: ai?.parts ?? [],
    status,
  };
}
