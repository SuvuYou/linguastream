import type { NlpToken } from "./nlp-client";

export interface StoredWord {
  i: number;
  text: string;
  start_ms: number;
  sentence_end?: true;
  lemma?: string;
  pos?: string;
  tag?: string;
  morph?: string;
  dep?: string;
  head?: number;
  particle_of?: number;
}

export interface StoredLine {
  index: number;
  words: StoredWord[];
}

export interface AnalysedLine {
  index: number;
  words: StoredWord[];
  lemmas: string[];
}

interface SentenceWord {
  word: StoredWord;
  offset: number;
}

export interface Sentence {
  text: string;
  words: SentenceWord[];
}

export const NO_LEMMA_POS = new Set(["PUNCT", "SYM", "NUM", "SPACE", "X"]);
export const HAS_LETTER = /\p{L}/u;

export function sentencesOf(lines: StoredLine[]): Sentence[] {
  const sentences: Sentence[] = [];
  let current: SentenceWord[] = [];
  let length = 0;
  const flush = () => {
    if (current.length === 0) return;
    sentences.push({
      text: current.map((w) => w.word.text).join(" "),
      words: current,
    });
    current = [];
    length = 0;
  };
  for (const line of lines) {
    for (const word of line.words) {
      current.push({ word, offset: length });
      length += word.text.length + 1;
      if (word.sentence_end) flush();
    }
  }
  flush();
  return sentences;
}

function mainToken(tokens: NlpToken[]): NlpToken | undefined {
  return (
    tokens.find((t) => t.pos !== "PUNCT" && HAS_LETTER.test(t.text)) ??
    tokens.find((t) => t.pos !== "PUNCT")
  );
}

export function applyTokens(sentence: Sentence, tokens: NlpToken[]): void {
  const wordOfToken = tokens.map((token) => {
    let k = sentence.words.length - 1;
    while (k > 0 && sentence.words[k]!.offset > token.start) k--;
    return k;
  });
  const tokensOfWord = sentence.words.map(() => [] as number[]);
  wordOfToken.forEach((k, t) => tokensOfWord[k]!.push(t));

  const main = tokensOfWord.map((list) => {
    const token = mainToken(list.map((t) => tokens[t]!));
    return token ? tokens.indexOf(token) : -1;
  });

  sentence.words.forEach(({ word }, k) => {
    const t = main[k]!;
    if (t < 0) return;
    const token = tokens[t]!;
    word.lemma = token.lemma;
    word.pos = token.pos;
    word.tag = token.tag;
    word.morph = token.morph;
    word.dep = token.dep;
    word.head = sentence.words[wordOfToken[token.head] ?? k]!.word.i;
  });

  sentence.words.forEach(({ word }, k) => {
    const t = main[k]!;
    if (t < 0 || tokens[t]!.dep !== "svp") return;
    const verbWord = sentence.words[wordOfToken[tokens[t]!.head]!];
    if (!verbWord || verbWord.word === word || !verbWord.word.lemma) return;
    const particle = tokens[t]!.lemma.toLowerCase();
    const lemma = verbWord.word.lemma.startsWith(particle)
      ? verbWord.word.lemma
      : particle + verbWord.word.lemma;
    verbWord.word.lemma = lemma;
    word.lemma = lemma;
    word.particle_of = verbWord.word.i;
  });
}

export function lemmasOf(words: StoredWord[]): string[] {
  const lemmas = new Set<string>();
  for (const word of words) {
    if (
      !word.lemma ||
      !word.pos ||
      NO_LEMMA_POS.has(word.pos) ||
      !HAS_LETTER.test(word.lemma)
    )
      continue;
    lemmas.add(word.lemma);
  }
  return [...lemmas];
}

export async function analyseLines(
  lines: StoredLine[],
  analyse: (sentences: string[]) => Promise<NlpToken[][]>,
): Promise<AnalysedLine[]> {
  const sentences = sentencesOf(lines);
  const tokens =
    sentences.length > 0 ? await analyse(sentences.map((s) => s.text)) : [];
  sentences.forEach((sentence, k) => applyTokens(sentence, tokens[k] ?? []));
  return lines.map((line) => ({
    index: line.index,
    words: line.words,
    lemmas: lemmasOf(line.words),
  }));
}
