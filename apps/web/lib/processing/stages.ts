import type {
  ProcessingErrorCode,
  ProcessingEvent,
  ProcessingStep,
} from "@linguastream/contracts";

export const STAGES = [
  { label: "Sentences", steps: ["parse", "normalise"] },
  { label: "Words", steps: ["analyse"] },
  { label: "Translating", steps: ["translate"] },
  { label: "Ready", steps: ["index"] },
] as const satisfies readonly {
  label: string;
  steps: readonly ProcessingStep[];
}[];

export type StageState = "done" | "current" | "todo";

export function stageStates(event: ProcessingEvent): StageState[] {
  if (event.type === "ready") return STAGES.map(() => "done");
  if (event.type !== "step") return STAGES.map(() => "todo");
  const current = STAGES.findIndex((stage) =>
    (stage.steps as readonly ProcessingStep[]).includes(event.step),
  );
  return STAGES.map((_, i) =>
    i < current ? "done" : i === current ? "current" : "todo",
  );
}

export const RETRYABLE: Record<ProcessingErrorCode, boolean> = {
  internal: true,
  invalid_track: false,
  empty_track: false,
};

export const FAILURE_MESSAGES: Record<ProcessingErrorCode, string> = {
  internal: "Something went wrong on our side. Try again.",
  invalid_track:
    "The captions couldn't be read. Send the video again from YouTube.",
  empty_track: "These captions have no text.",
};
