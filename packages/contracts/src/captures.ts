import { z } from "zod";
import { defineRoute } from "./route.js";

export const EXTENSION_VERSION_HEADER = "x-extension-version";

export const MAX_TRACK_CHARS = 5 * 1024 * 1024;

export const TrackKind = z.enum(["asr", "manual"]);

export type TrackKind = z.infer<typeof TrackKind>;

export function youtubeTrackId(language: string, kind: TrackKind): string {
  return `${kind === "asr" ? "a" : ""}.${language}`;
}

export const CaptureLookup = z.discriminatedUnion("status", [
  z.object({ status: z.literal("new") }),
  z.object({ status: z.literal("exists"), video_id: z.string() }),
  z.object({ status: z.literal("blocked") }),
]);

export type CaptureLookup = z.infer<typeof CaptureLookup>;

export const lookupCaptureRoute = defineRoute({
  method: "GET",
  path: "/api/captures/lookup",
  query: z.object({
    youtube_video_id: z.string().min(1).max(20),
    youtube_track_id: z.string().min(2).max(30),
    hash: z.string().regex(/^[0-9a-f]{64}$/),
  }),
  response: CaptureLookup,
});

export const CaptureCreated = z.object({
  video_id: z.string(),
  track_id: z.string(),
  status: z.enum(["pending", "processing", "ready", "failed"]),
});

export type CaptureCreated = z.infer<typeof CaptureCreated>;

export const createCaptureRoute = defineRoute({
  method: "POST",
  path: "/api/captures",
  body: z.object({
    video: z.object({
      youtube_video_id: z.string().min(1).max(20),
      title: z.string().min(1).max(300),
      channel_name: z.string().max(200).optional(),
      duration_ms: z.number().int().min(0).max(24 * 60 * 60 * 1000).optional(),
      playable_in_embed: z.boolean().optional(),
    }),
    track: z.object({
      language: z.string().min(2).max(20),
      kind: TrackKind,
      raw_json3: z.string().min(1).max(MAX_TRACK_CHARS),
    }),
  }),
  response: CaptureCreated,
});
