import type { ProcessingStep } from "@linguastream/contracts";
import { gunzipSync } from "node:zlib";
import type { ProcessingRepository } from "../processing.repository";
import { parseJson3 } from "./parse-json3";

export interface StepContext {
  trackId: string;
  repository: ProcessingRepository;
}

export type StepHandler = (context: StepContext) => Promise<void>;

export const STEP_HANDLERS: Partial<Record<ProcessingStep, StepHandler>> = {
  parse: async ({ trackId, repository }) => {
    const raw = gunzipSync(await repository.rawJson3(trackId)).toString("utf8");
    await repository.replaceLines(trackId, parseJson3(raw));
  },
};
