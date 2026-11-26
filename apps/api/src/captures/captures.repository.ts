import { Injectable } from "@nestjs/common";
import { Prisma, db } from "@linguastream/db";

export interface TrackKey {
  userId: string;
  youtubeVideoId: string;
  youtubeTrackId: string;
  contentHash: string;
  processingVersion: number;
}

export interface NewCapture extends TrackKey {
  title: string;
  channelName?: string;
  durationMs?: number;
  language: string;
  isAutoCaptions: boolean;
  rawJson3: Uint8Array<ArrayBuffer>;
}

export interface StoredTrack {
  videoId: string;
  trackId: string;
  status: "pending" | "processing" | "ready" | "failed";
}

@Injectable()
export class CapturesRepository {
  async isBlocked(youtubeVideoId: string): Promise<boolean> {
    const row = await db.blockedVideo.findUnique({ where: { youtubeVideoId }, select: { youtubeVideoId: true } });
    return row !== null;
  }

  async findTrack(key: TrackKey): Promise<StoredTrack | null> {
    const track = await db.track.findFirst({
      where: {
        video: { userId: key.userId, youtubeVideoId: key.youtubeVideoId },
        youtubeTrackId: key.youtubeTrackId,
        contentHash: key.contentHash,
        processingVersion: key.processingVersion,
      },
      select: { id: true, videoId: true, status: true },
    });
    return track && { videoId: track.videoId, trackId: track.id, status: track.status };
  }

  async create(capture: NewCapture): Promise<{ track: StoredTrack; created: boolean }> {
    try {
      const track = await db.$transaction(async (tx) => {
        const video = await tx.video.upsert({
          where: { userId_youtubeVideoId: { userId: capture.userId, youtubeVideoId: capture.youtubeVideoId } },
          create: {
            userId: capture.userId,
            youtubeVideoId: capture.youtubeVideoId,
            title: capture.title,
            channelName: capture.channelName,
            durationMs: capture.durationMs,
            language: capture.language,
          },
          update: { title: capture.title, channelName: capture.channelName, durationMs: capture.durationMs },
          select: { id: true },
        });
        return tx.track.create({
          data: {
            videoId: video.id,
            youtubeTrackId: capture.youtubeTrackId,
            language: capture.language,
            isAutoCaptions: capture.isAutoCaptions,
            rawJson3: capture.rawJson3,
            contentHash: capture.contentHash,
            processingVersion: capture.processingVersion,
          },
          select: { id: true, videoId: true, status: true },
        });
      });
      return { track: { videoId: track.videoId, trackId: track.id, status: track.status }, created: true };
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") throw err;
      const existing = await this.findTrack(capture);
      if (!existing) throw err;
      return { track: existing, created: false };
    }
  }
}
