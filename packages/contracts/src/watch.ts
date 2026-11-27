import { z } from "zod";
import { defineRoute } from "./route.js";

export const MAX_LINE_WINDOW_MS = 10 * 60 * 1000;

export const ProcessingStatus = z.enum([
  "pending",
  "processing",
  "ready",
  "failed",
]);

export type ProcessingStatus = z.infer<typeof ProcessingStatus>;

export const TranslationStatus = z.enum([
  "none",
  "pending",
  "processing",
  "ready",
  "failed",
]);

export type TranslationStatus = z.infer<typeof TranslationStatus>;

export const VideoTranslation = z
  .object({ language: z.string(), status: TranslationStatus })
  .nullable();

export type VideoTranslation = z.infer<typeof VideoTranslation>;

export const VideoDetail = z.object({
  id: z.string(),
  youtube_video_id: z.string(),
  title: z.string(),
  channel_name: z.string().nullable(),
  duration_ms: z.number().int().nonnegative().nullable(),
  language: z.string(),
  track: z
    .object({
      id: z.string(),
      language: z.string(),
      is_auto_captions: z.boolean(),
      status: ProcessingStatus,
      line_count: z.number().int().nonnegative(),
    })
    .nullable(),
  translation_language: z.string().nullable(),
  translation: VideoTranslation,
});

export type VideoDetail = z.infer<typeof VideoDetail>;

export const getVideoRoute = defineRoute({
  method: "GET",
  path: "/api/videos/:videoId",
  params: z.object({ videoId: z.uuid() }),
  response: VideoDetail,
});

export const TranslationRequested = z.object({
  video_id: z.uuid(),
  translation: z.object({ language: z.string(), status: z.literal("pending") }),
});

export type TranslationRequested = z.infer<typeof TranslationRequested>;

export const translateVideoRoute = defineRoute({
  method: "POST",
  path: "/api/videos/:videoId/translation",
  params: z.object({ videoId: z.uuid() }),
  response: TranslationRequested,
});

export const VideoDeleted = z.object({
  video_id: z.uuid(),
  deleted: z.literal(true),
});

export type VideoDeleted = z.infer<typeof VideoDeleted>;

export const deleteVideoRoute = defineRoute({
  method: "DELETE",
  path: "/api/videos/:videoId",
  params: z.object({ videoId: z.uuid() }),
  response: VideoDeleted,
});

export const Line = z.object({
  index: z.number().int().nonnegative(),
  start_ms: z.number().int().nonnegative(),
  end_ms: z.number().int().nonnegative(),
  text: z.string(),
  translation: z.string().nullable(),
});

export type Line = z.infer<typeof Line>;

export const LineWindow = z.object({
  from_ms: z.number().int().nonnegative(),
  to_ms: z.number().int().nonnegative(),
  lines: z.array(Line),
});

export type LineWindow = z.infer<typeof LineWindow>;

export const getLineWindowRoute = defineRoute({
  method: "GET",
  path: "/api/videos/:videoId/lines",
  params: z.object({ videoId: z.uuid() }),
  query: z
    .object({
      from_ms: z.coerce.number().int().nonnegative(),
      to_ms: z.coerce.number().int().positive(),
    })
    .refine(
      (q) => q.to_ms > q.from_ms && q.to_ms - q.from_ms <= MAX_LINE_WINDOW_MS,
      {
        message: `to_ms must be after from_ms and at most ${MAX_LINE_WINDOW_MS} ms later`,
      },
    ),
  response: LineWindow,
});
