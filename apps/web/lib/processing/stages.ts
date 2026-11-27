import type {
  ProcessingErrorCode,
  ProcessingEvent,
  ProcessingStep,
  TranslationErrorCode,
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

export type StageState = "done" | "current" | "todo" | "failed";

const stageOf = (step: ProcessingStep) =>
  STAGES.findIndex((stage) =>
    (stage.steps as readonly ProcessingStep[]).includes(step),
  );

export function stageStates(event: ProcessingEvent): StageState[] {
  if (event.type === "ready") return STAGES.map(() => "done");
  if (event.type === "translation_failed") {
    const failed = stageOf("translate");
    return STAGES.map((_, i) =>
      i < failed ? "done" : i === failed ? "failed" : "todo",
    );
  }
  if (event.type !== "step") return STAGES.map(() => "todo");
  const current = stageOf(event.step);
  return STAGES.map((_, i) =>
    i < current ? "done" : i === current ? "current" : "todo",
  );
}

export const TRANSLATION_RETRYABLE: Record<TranslationErrorCode, boolean> = {
  provider_unavailable: true,
  invalid_answer: true,
  internal: true,
  spend_cap: false,
};

export const TRANSLATION_FAILURE_MESSAGES: Record<TranslationErrorCode, string> =
  {
    provider_unavailable:
      "The translation service (Gemini) didn't answer. Try again in a few minutes.",
    invalid_answer:
      "The translation service gave answers we couldn't use. Try again.",
    spend_cap:
      "This month's AI budget is used up. Translation works again next month.",
    internal: "Something went wrong on our side. Try again.",
  };

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

export const TRANSLATION_FAILURE_SHORT: Record<TranslationErrorCode, string> = {
  provider_unavailable: "Gemini didn't answer",
  invalid_answer: "unusable answers from Gemini",
  spend_cap: "monthly AI budget used up",
  internal: "server error",
};
