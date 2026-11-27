import { z } from "zod";
import { defineRoute } from "./route.js";

export const PROCESSING_STEPS = [
  "parse",
  "normalise",
  "analyse",
  "translate",
  "index",
] as const;

export const ProcessingStep = z.enum(PROCESSING_STEPS);

export type ProcessingStep = z.infer<typeof ProcessingStep>;

export const PROCESSING_ERROR_CODES = [
  "invalid_track",
  "empty_track",
  "internal",
] as const;

export const ProcessingErrorCode = z.enum(PROCESSING_ERROR_CODES);

export type ProcessingErrorCode = z.infer<typeof ProcessingErrorCode>;

const eventBase = {
  track_id: z.uuid(),
  video_id: z.uuid(),
  title: z.string(),
};

export const ProcessingEvent = z.discriminatedUnion("type", [
  z.object({ type: z.literal("queued"), ...eventBase }),
  z.object({
    type: z.literal("step"),
    ...eventBase,
    step: ProcessingStep,
    step_index: z.int().min(0),
    step_count: z.int().min(1),
  }),
  z.object({ type: z.literal("ready"), ...eventBase }),
  z.object({
    type: z.literal("failed"),
    ...eventBase,
    error_code: ProcessingErrorCode,
  }),
]);

export type ProcessingEvent = z.infer<typeof ProcessingEvent>;

export const PROCESSING_EVENT_NAME = "processing";

export const processingEventsRoute = defineRoute({
  method: "GET",
  path: "/api/processing/events",
  response: ProcessingEvent,
});

export const RetriedTrack = z.object({
  track_id: z.uuid(),
  status: z.literal("pending"),
});

export type RetriedTrack = z.infer<typeof RetriedTrack>;

export const retryTrackRoute = defineRoute({
  method: "POST",
  path: "/api/tracks/:trackId/retry",
  params: z.object({ trackId: z.uuid() }),
  response: RetriedTrack,
});
