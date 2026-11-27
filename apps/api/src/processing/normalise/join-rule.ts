import { splitToken, type Edit } from "./align";

export interface VerbLexicon {
  canBeVerb(form: string): Promise<boolean>;
}

const ABBREVIATIONS = new Set([
  "z.b.", "bzw.", "ca.", "usw.", "etc.", "d.h.", "u.a.", "o.ä.", "v.a.", "dr.", "nr.", "vs.", "evtl.", "ggf.",
  "inkl.", "mio.", "mrd.", "std.", "min.", "max.", "jh.", "str.", "bspw.", "sog.", "zb.", "mr.", "mrs.",
]);

export function joinCandidates(words: string[]): number[] {
  const out: number[] = [];
  for (let k = 0; k + 1 < words.length; k++) {
    const word = words[k]!;
    const next = words[k + 1]!;
    if (!/[^.]\.$/.test(word)) continue;
    if (ABBREVIATIONS.has(word.toLowerCase())) continue;
    if (/^\d+\.$/.test(word)) continue;
    if (/^[a-zA-Z]\.$/.test(word)) continue;
    if (!/^\p{Ll}/u.test(next)) continue;
    if (/^\p{Ll}\p{Lu}/u.test(next)) continue;
    out.push(k);
  }
  return out;
}

export async function joinEdits(words: string[], lexicon: VerbLexicon | null): Promise<Edit[]> {
  if (!lexicon) return [];
  const edits: Edit[] = [];
  for (const k of joinCandidates(words)) {
    const next = words[k + 1]!.replace(/[^\p{L}]/gu, "");
    if (await lexicon.canBeVerb(next)) continue;
    edits.push({ i: k, after: splitToken(words[k]!).after.slice(0, -1), join: true });
  }
  return edits;
}
