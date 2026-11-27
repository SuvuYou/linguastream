import { HAS_LETTER, NO_LEMMA_POS, type StoredLine, type StoredWord } from "../analyse/analyse";

export interface LemmaCount {
  lemma: string;
  count: number;
}

export function vocabularyLemma(word: StoredWord): string | null {
  const { lemma, pos } = word;
  if (!lemma || !pos || NO_LEMMA_POS.has(pos) || pos === "PROPN" || !HAS_LETTER.test(lemma)) return null;
  return lemma;
}

export function isCountedWord(word: StoredWord): word is StoredWord & { lemma: string } {
  return vocabularyLemma(word) !== null && word.particle_of === undefined;
}

export function countLemmas(lines: StoredLine[]): LemmaCount[] {
  const counts = new Map<string, number>();
  for (const line of lines) {
    for (const word of line.words) {
      if (isCountedWord(word)) counts.set(word.lemma, (counts.get(word.lemma) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([lemma, count]) => ({ lemma, count }))
    .sort((a, b) => b.count - a.count || a.lemma.localeCompare(b.lemma));
}
