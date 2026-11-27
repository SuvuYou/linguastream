import { z } from "zod";
import { ProcessingErrorCode } from "./processing.js";
import { defineRoute } from "./route.js";
import { ProcessingStatus } from "./watch.js";

export const LIBRARY_PAGE_SIZE = 24;

export const LIBRARY_SEARCH_MAX = 100;

export const LibraryVideo = z.object({
  id: z.uuid(),
  youtube_video_id: z.string(),
  title: z.string(),
  channel_name: z.string().nullable(),
  duration_ms: z.number().int().nonnegative().nullable(),
  added_at: z.iso.datetime({ offset: true }),
  track: z
    .object({
      id: z.uuid(),
      status: ProcessingStatus,
      progress: z.number().int().nonnegative(),
      error_code: ProcessingErrorCode.nullable(),
    })
    .nullable(),
});

export type LibraryVideo = z.infer<typeof LibraryVideo>;

export const LibraryPage = z.object({
  items: z.array(LibraryVideo),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type LibraryPage = z.infer<typeof LibraryPage>;

export const listVideosRoute = defineRoute({
  method: "GET",
  path: "/api/videos",
  query: z.object({
    page: z.coerce.number().int().nonnegative().default(0),
    q: z
      .string()
      .trim()
      .max(LIBRARY_SEARCH_MAX)
      .optional()
      .transform((q) => q || undefined),
  }),
  response: LibraryPage,
});
