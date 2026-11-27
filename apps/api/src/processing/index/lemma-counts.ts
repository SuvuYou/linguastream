import { HAS_LETTER, NO_LEMMA_POS, type StoredLine, type StoredWord } from "../analyse/analyse";

export interface LemmaCount {
  lemma: string;
  count: number;
}

export function isCountedWord(word: StoredWord): word is StoredWord & { lemma: string } {
  return (
    !!word.lemma &&
    !!word.pos &&
    !NO_LEMMA_POS.has(word.pos) &&
    word.pos !== "PROPN" &&
    word.particle_of === undefined &&
    HAS_LETTER.test(word.lemma)
  );
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
