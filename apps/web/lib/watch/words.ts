import type { WordStatus } from "@linguastream/contracts";

export const STATUS_CYCLE: readonly WordStatus[] = ["unknown", "learning", "known", "ignored"];

export const STATUS_LABELS: Record<WordStatus, string> = {
  unknown: "Unknown",
  learning: "Learning",
  known: "Known",
  ignored: "Ignore",
};

export const WORTH_LEARNING_RANK = 5000;

export type WordStatuses = ReadonlyMap<string, WordStatus>;

export interface WordTarget {
  index: number;
  i: number;
  lemma: string;
}

export function nextStatus(status: WordStatus): WordStatus {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length]!;
}

export function statusOf(statuses: WordStatuses | undefined, lemma: string | null): WordStatus | null {
  if (!lemma || !statuses) return null;
  return statuses.get(lemma) ?? "unknown";
}

export function isWorthLearning(rank: number | null, status: WordStatus): boolean {
  return rank !== null && rank <= WORTH_LEARNING_RANK && (status === "unknown" || status === "learning");
}

const EDGES = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u;

export function splitToken(text: string): { before: string; core: string; after: string } {
  const [, before = "", core = "", after = ""] = EDGES.exec(text) ?? [];
  return core ? { before, core, after } : { before: "", core: text, after: "" };
}

