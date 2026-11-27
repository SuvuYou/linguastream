import { punctuationMessage, punctuationRetryNote } from "../../ai/prompts/punctuation";
import { deriveEdits, type Edit } from "./align";

export const CHUNK_WORDS = 1_000;
export const OVERLAP_WORDS = 30;

export type Punctuator = (text: string) => Promise<string>;

export interface PunctuationReport {
  status: "done" | "partial" | "skipped_cap";
  chunks: number;
  rejected: number;
  failed: number;
  salvagedEdits: number;
}

export async function punctuateWords(
  words: string[],
  punctuate: Punctuator,
  canSpend: () => Promise<boolean>,
): Promise<{ edits: Edit[]; report: PunctuationReport }> {
  const edits: Edit[] = [];
  const report: PunctuationReport = {
    status: "done",
    chunks: 0,
    rejected: 0,
    failed: 0,
    salvagedEdits: 0,
  };

  for (let start = 0; start < words.length; start += CHUNK_WORDS) {
    if (!(await canSpend())) {
      report.status = report.chunks === 0 ? "skipped_cap" : "partial";
      break;
    }
    report.chunks++;
    const end = Math.min(words.length, start + CHUNK_WORDS);
    const from = Math.max(0, start - OVERLAP_WORDS);
    const slice = words.slice(
      from,
      Math.min(words.length, end + OVERLAP_WORDS),
    );
    const keep = (list: Edit[]) =>
      list
        .map((e) => ({ ...e, i: e.i + from }))
        .filter((e) => e.i >= start && e.i < end);

    let note: string | undefined;
    let salvaged: Edit[] = [];
    let accepted = false;
    let answered = false;
    for (let attempt = 0; attempt < 2 && !accepted; attempt++) {
      let text: string;
      try {
        text = await punctuate(punctuationMessage(slice, note));
      } catch {
        continue;
      }
      answered = true;
      const result = deriveEdits(slice, text);
      if (result.ok) {
        edits.push(...keep(result.edits));
        accepted = true;
      } else {
        salvaged = keep(result.salvaged);
        note = punctuationRetryNote(result.changes);
      }
    }
    if (!accepted) {
      if (answered) {
        report.rejected++;
        report.salvagedEdits += salvaged.length;
        edits.push(...salvaged);
      } else report.failed++;
      report.status = "partial";
    }
  }
  return { edits, report };
}
