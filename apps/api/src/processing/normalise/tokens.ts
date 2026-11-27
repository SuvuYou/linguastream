import type { Cue } from "../steps/parse-json3";

export interface Token {
  text: string;
  startMs: number;
  line: number;
  tag: boolean;
}

const TAG = /^\[.*\]$/;

export function tokensOf(cues: Cue[]): Token[] {
  const tokens: Token[] = [];
  cues.forEach((cue, line) => {
    const pieces: { text: string; startMs: number }[] = [];
    let open = false;
    for (const seg of cue.segs) {
      const words = seg.text.split(/\s+/).filter(Boolean);
      if (open && /^\S/.test(seg.text) && words.length > 0)
        pieces[pieces.length - 1]!.text += words.shift();
      for (const text of words) pieces.push({ text, startMs: seg.startMs });
      if (seg.text.length > 0) open = pieces.length > 0 && /\S$/.test(seg.text);
    }
    for (let k = 0; k < pieces.length; k++) {
      const piece = pieces[k]!;
      if (piece.text.startsWith("[") && !piece.text.includes("]")) {
        const end = pieces.findIndex(
          (p, m) => m > k && m < k + 8 && p.text.includes("]"),
        );
        if (end !== -1) {
          const text = pieces
            .slice(k, end + 1)
            .map((p) => p.text)
            .join(" ");
          tokens.push({ text, startMs: piece.startMs, line, tag: true });
          k = end;
          continue;
        }
      }
      tokens.push({
        text: piece.text,
        startMs: piece.startMs,
        line,
        tag: TAG.test(piece.text),
      });
    }
  });
  return tokens;
}

const SENTENCE_END = /[.!?…]["»«“”)]*$/;

export function looksPunctuated(words: string[]): boolean {
  if (words.length === 0) return true;
  const ends = words.filter((word) => SENTENCE_END.test(word)).length;
  return ends / words.length >= 0.02;
}

export function endsSentence(word: string): boolean {
  return SENTENCE_END.test(word);
}
