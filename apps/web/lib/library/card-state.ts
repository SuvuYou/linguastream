import {
  PROCESSING_STEPS,
  type LibraryVideo,
  type ProcessingErrorCode,
  type ProcessingEvent,
  type ProcessingStep,
} from "@linguastream/contracts";
import { FAILURE_MESSAGES, RETRYABLE, STAGES } from "@/lib/processing/stages";

export type CardState =
  | { kind: "ready" }
  | { kind: "waiting" }
  | { kind: "preparing"; stage: string; percent: number }
  | { kind: "failed"; message: string; retryable: boolean };

function preparing(step: ProcessingStep, index: number, count: number) {
  const stage =
    STAGES.find((s) => (s.steps as readonly ProcessingStep[]).includes(step)) ??
    STAGES[0];
  return {
    kind: "preparing" as const,
    stage: stage.label === "Ready" ? "Finishing" : stage.label,
    percent: Math.round((index / count) * 100),
  };
}

function failed(code: ProcessingErrorCode) {
  return {
    kind: "failed" as const,
    message: FAILURE_MESSAGES[code],
    retryable: RETRYABLE[code],
  };
}

export function cardState(
  video: LibraryVideo,
  event?: ProcessingEvent,
): CardState {
  if (event) {
    switch (event.type) {
      case "queued":
        return { kind: "waiting" };
      case "step":
        return preparing(event.step, event.step_index, event.step_count);
      case "ready":
        return { kind: "ready" };
      case "failed":
        return failed(event.error_code);
    }
  }
  const track = video.track;
  if (!track || track.status === "pending") return { kind: "waiting" };
  if (track.status === "ready") return { kind: "ready" };
  if (track.status === "failed") return failed(track.error_code ?? "internal");
  const index = Math.min(track.progress, PROCESSING_STEPS.length - 1);
  return preparing(PROCESSING_STEPS[index]!, index, PROCESSING_STEPS.length);
}
