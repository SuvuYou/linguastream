import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  youtubeTrackId,
  type ApiError,
  type CaptureLookup,
  type RequestBody,
  type RequestQuery,
  type createCaptureRoute,
  type lookupCaptureRoute,
} from "@linguastream/contracts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { ProcessingService } from "../processing/processing.service";
import { UsageService } from "../usage/usage.service";
import { CapturesRepository, type StoredTrack } from "./captures.repository";

export const PROCESSING_VERSION = 1;

const UNAVAILABLE_FOR_LEGAL_REASONS = 451;

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function transcriptCharacters(raw: string): number {
  const events = (JSON.parse(raw) as { events?: { segs?: { utf8?: unknown }[] }[] }).events ?? [];
  let characters = 0;
  for (const event of events) {
    for (const seg of event.segs ?? []) if (typeof seg.utf8 === "string") characters += seg.utf8.trim().length;
  }
  return characters;
}

export function isJson3(raw: string): boolean {
  try {
    return Array.isArray((JSON.parse(raw) as { events?: unknown })?.events);
  } catch {
    return false;
  }
}

@Injectable()
export class CapturesService {
  constructor(
    @Inject(CapturesRepository) private readonly captures: CapturesRepository,
    @Inject(ProcessingService) private readonly processing: ProcessingService,
    @Inject(UsageService) private readonly usage: UsageService,
  ) {}

  async lookup(userId: string, query: RequestQuery<typeof lookupCaptureRoute>): Promise<CaptureLookup> {
    if (await this.captures.isBlocked(query.youtube_video_id)) return { status: "blocked" };

    const track = await this.captures.findTrack({
      userId,
      youtubeVideoId: query.youtube_video_id,
      youtubeTrackId: query.youtube_track_id,
      contentHash: query.hash,
      processingVersion: PROCESSING_VERSION,
    });
    return track ? { status: "exists", video_id: track.videoId } : { status: "new" };
  }

  async create(
    userId: string,
    { video, track }: RequestBody<typeof createCaptureRoute>,
  ): Promise<{ track: StoredTrack; created: boolean }> {
    if (await this.captures.isBlocked(video.youtube_video_id)) {
      throw new HttpException(
        { error: "This video can't be added to LinguaStream" } satisfies ApiError,
        UNAVAILABLE_FOR_LEGAL_REASONS,
      );
    }
    if (video.playable_in_embed === false) {
      throw new UnprocessableEntityException({ error: "This video doesn't allow embedding" } satisfies ApiError);
    }
    if (!isJson3(track.raw_json3)) {
      throw new BadRequestException({ error: "Invalid request: track.raw_json3 is not a json3 caption file" } satisfies ApiError);
    }

    const key = {
      userId,
      youtubeVideoId: video.youtube_video_id,
      youtubeTrackId: youtubeTrackId(track.language, track.kind),
      contentHash: sha256(track.raw_json3),
      processingVersion: PROCESSING_VERSION,
    };
    const existing = await this.captures.findTrack(key);
    if (existing) return { track: existing, created: false };

    const refund = await this.usage.reserveTransfer(userId, transcriptCharacters(track.raw_json3));
    let result: { track: StoredTrack; created: boolean };
    try {
      result = await this.captures.create({
        ...key,
        title: video.title,
        channelName: video.channel_name,
        durationMs: video.duration_ms,
        language: track.language,
        isAutoCaptions: track.kind === "asr",
        rawJson3: gzipSync(track.raw_json3),
      });
    } catch (err) {
      await refund();
      throw err;
    }
    if (!result.created) await refund();
    else await this.processing.enqueue(result.track.trackId);
    return result;
  }
}
