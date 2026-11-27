import { readCues } from "../steps/parse-json3";
import { applyEdit, mergeEdits, splitLongRuns, type Edit } from "./align";
import { joinEdits, type VerbLexicon } from "./join-rule";
import { punctuateWords, type PunctuationReport, type Punctuator } from "./punctuate";
import { endsSentence, looksPunctuated, tokensOf } from "./tokens";

export const NORMALISATION_VERSION = 1;
export const MAX_SENTENCE_WORDS = 40;

export interface LineWord {
  i: number;
  text: string;
  start_ms: number;
  sentence_end?: true;
}

export interface NormalisedLine {
  index: number;
  text: string;
  words: LineWord[];
}

export interface Normalisation {
  version: number;
  punctuated: boolean;
  punctuation: PunctuationReport | "not_needed";
  join_rule: "on" | "off";
  edits: Edit[];
  sentence_ends: number[];
}

export interface NormaliseDeps {
  punctuate: Punctuator;
  canSpend: () => Promise<boolean>;
  lexicon: VerbLexicon | null;
}

export async function normalise(raw: string, deps: NormaliseDeps): Promise<{ lines: NormalisedLine[]; normalisation: Normalisation }> {
  const cues = readCues(raw);
  const tokens = tokensOf(cues);
  const wordTokens = tokens.filter((t) => !t.tag);
  const words = wordTokens.map((t) => t.text);

  const punctuated = looksPunctuated(words);
  let edits: Edit[] = [];
  let punctuation: Normalisation["punctuation"] = "not_needed";
  if (!punctuated) {
    const result = await punctuateWords(words, deps.punctuate, deps.canSpend);
    edits = result.edits;
    punctuation = result.report;
  }

  const shownBeforeJoins = words.map((w, k) => applyEdit(w, edits.find((e) => e.i === k)));
  edits = mergeEdits(edits, await joinEdits(shownBeforeJoins, deps.lexicon));

  const byI = new Map(edits.map((e) => [e.i, e]));
  const shown = words.map((w, k) => applyEdit(w, byI.get(k)));
  const splits = splitLongRuns(
    shown,
    wordTokens.map((t) => t.startMs),
    (k) => endsSentence(shown[k]!),
    MAX_SENTENCE_WORDS,
  );
  edits = mergeEdits(edits, splits);

  const ends = new Set<number>();
  shown.forEach((word, k) => {
    if (endsSentence(word)) ends.add(k);
  });
  for (const split of splits) ends.add(split.i);

  const lines: NormalisedLine[] = cues.map((_, index) => ({ index, text: "", words: [] }));
  const texts: string[][] = cues.map(() => []);
  let w = 0;
  for (const token of tokens) {
    if (token.tag) {
      texts[token.line]!.push(token.text);
      continue;
    }
    const k = w++;
    texts[token.line]!.push(shown[k]!);
    lines[token.line]!.words.push({
      i: k,
      text: shown[k]!,
      start_ms: token.startMs,
      ...(ends.has(k) && { sentence_end: true as const }),
    });
  }
  lines.forEach((line, index) => (line.text = texts[index]!.join(" ")));

  return {
    lines,
    normalisation: {
      version: NORMALISATION_VERSION,
      punctuated,
      punctuation,
      join_rule: deps.lexicon ? "on" : "off",
      edits,
      sentence_ends: [...ends].sort((a, b) => a - b),
    },
  };
}
