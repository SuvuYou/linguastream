import {
  PROCESSING_STEPS,
  TRANSLATION_ERROR_CODES,
  type ProcessingEvent,
} from "@linguastream/contracts";
import { describe, expect, it } from "vitest";
import {
  STAGES,
  TRANSLATION_FAILURE_MESSAGES,
  TRANSLATION_FAILURE_SHORT,
  TRANSLATION_RETRYABLE,
  stageStates,
} from "./stages";

const base = { track_id: "t", video_id: "v", title: "x" };
const step = (s: (typeof PROCESSING_STEPS)[number]): ProcessingEvent => ({
  type: "step",
  ...base,
  step: s,
  step_index: PROCESSING_STEPS.indexOf(s),
  step_count: PROCESSING_STEPS.length,
});

describe("stageStates", () => {
  it("covers every processing step with exactly one stage", () => {
    expect(STAGES.flatMap((s) => s.steps)).toEqual([...PROCESSING_STEPS]);
  });

  it("marks earlier stages done and the step's stage current", () => {
    expect(stageStates(step("parse"))).toEqual([
      "current",
      "todo",
      "todo",
      "todo",
    ]);
    expect(stageStates(step("normalise"))).toEqual([
      "current",
      "todo",
      "todo",
      "todo",
    ]);
    expect(stageStates(step("analyse"))).toEqual([
      "done",
      "current",
      "todo",
      "todo",
    ]);
    expect(stageStates(step("translate"))).toEqual([
      "done",
      "done",
      "current",
      "todo",
    ]);
    expect(stageStates(step("index"))).toEqual([
      "done",
      "done",
      "done",
      "current",
    ]);
  });

  it("has nothing done while queued and everything done when ready", () => {
    expect(stageStates({ type: "queued", ...base })).toEqual([
      "todo",
      "todo",
      "todo",
      "todo",
    ]);
    expect(stageStates({ type: "ready", ...base })).toEqual([
      "done",
      "done",
      "done",
      "done",
    ]);
  });

  it("marks the translating stage failed when only the translation failed", () => {
    expect(
      stageStates({ type: "translation_failed", ...base, error_code: "provider_unavailable" }),
    ).toEqual(["done", "done", "failed", "todo"]);
  });

  it("explains every translation error and retries all but the budget", () => {
    for (const code of TRANSLATION_ERROR_CODES) {
      expect(TRANSLATION_FAILURE_MESSAGES[code]).toBeTruthy();
      expect(TRANSLATION_FAILURE_SHORT[code]).toBeTruthy();
    }
    expect(Object.entries(TRANSLATION_RETRYABLE).filter(([, retry]) => !retry).map(([code]) => code)).toEqual([
      "spend_cap",
    ]);
  });
});
