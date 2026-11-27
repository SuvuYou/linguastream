import type { Change } from "../../processing/normalise/align";

export const PUNCTUATION_INSTRUCTION = `You get automatically generated German subtitles without reliable punctuation.
Add punctuation (. , ? ! : ; – „ “) and fix capitalisation.
Strict rules:
- Don't change any word: no spelling fixes, no numbers written as digits, no abbreviations expanded.
- Don't add or drop any word, not even filler words such as "äh" or "halt".
- Keep the word order exactly as it is.
- Return only the text, without any explanation.`;

function describeChange(change: Change): string {
  switch (change.kind) {
    case "changed":
      return `"${change.captured}" → "${change.returned}"`;
    case "dropped":
      return `"${change.captured}" dropped`;
    case "added":
      return `"${change.returned}" added`;
  }
}

export function punctuationRetryNote(changes: Change[]): string {
  const shown = changes.slice(0, 5).map(describeChange).join(", ");
  return `Careful: your last answer changed words (${shown}). This time, don't change a single word.`;
}

export function punctuationMessage(words: string[], note?: string): string {
  return (note ? `${note}\n\n` : "") + words.join(" ");
}
