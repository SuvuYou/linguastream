import { Injectable } from "@nestjs/common";
import type { ProcessingErrorCode } from "@linguastream/contracts";
import { db } from "@linguastream/db";
import type { NormalisedLine, Normalisation } from "./normalise/normalise";
import type { ParsedLine } from "./steps/parse-json3";

export interface TrackSummary {
  trackId: string;
  videoId: string;
  userId: string;
  title: string;
  status: "pending" | "processing" | "ready" | "failed";
  progress: number;
}

const summarySelect = {
  id: true,
  videoId: true,
  status: true,
  progress: true,
  video: { select: { userId: true, title: true } },
} as const;

function toSummary(track: {
  id: string;
  videoId: string;
  status: TrackSummary["status"];
  progress: number;
  video: { userId: string; title: string };
}): TrackSummary {
  return {
    trackId: track.id,
    videoId: track.videoId,
    userId: track.video.userId,
    title: track.video.title,
    status: track.status,
    progress: track.progress,
  };
}

@Injectable()
export class ProcessingRepository {
  async findTrack(trackId: string): Promise<TrackSummary | null> {
    const track = await db.track.findUnique({ where: { id: trackId }, select: summarySelect });
    return track && toSummary(track);
  }

  async findUserTrack(userId: string, trackId: string): Promise<TrackSummary | null> {
    const track = await db.track.findFirst({ where: { id: trackId, video: { userId } }, select: summarySelect });
    return track && toSummary(track);
  }

  async unfinishedTracks(userId: string): Promise<TrackSummary[]> {
    const tracks = await db.track.findMany({
      where: { status: { in: ["pending", "processing"] }, video: { userId } },
      select: summarySelect,
      orderBy: { createdAt: "asc" },
    });
    return tracks.map(toSummary);
  }

  async pendingTrackIds(): Promise<string[]> {
    const tracks = await db.track.findMany({ where: { status: "pending" }, select: { id: true } });
    return tracks.map((track) => track.id);
  }

  async rawJson3(trackId: string): Promise<Uint8Array> {
    const track = await db.track.findUniqueOrThrow({ where: { id: trackId }, select: { rawJson3: true } });
    return track.rawJson3;
  }

  async markProcessing(trackId: string): Promise<void> {
    await db.track.update({ where: { id: trackId }, data: { status: "processing", errorCode: null } });
  }

  async completeStep(trackId: string, progress: number): Promise<void> {
    await db.track.update({ where: { id: trackId }, data: { progress } });
  }

  async markReady(trackId: string): Promise<void> {
    await db.track.update({ where: { id: trackId }, data: { status: "ready", processedAt: new Date() } });
  }

  async markFailed(trackId: string, code: ProcessingErrorCode): Promise<void> {
    await db.track.update({ where: { id: trackId }, data: { status: "failed", errorCode: code } });
  }

  async markPendingAgain(trackId: string): Promise<void> {
    await db.track.update({ where: { id: trackId }, data: { status: "pending", errorCode: null } });
  }

  async replaceLines(trackId: string, lines: ParsedLine[]): Promise<void> {
    await db.$transaction([
      db.line.deleteMany({ where: { trackId } }),
      db.line.createMany({
        data: lines.map((line) => ({
          trackId,
          index: line.index,
          startMs: line.startMs,
          endMs: line.endMs,
          text: line.text,
          rawText: line.text,
          words: [],
        })),
      }),
    ]);
  }

  async saveNormalisation(trackId: string, lines: NormalisedLine[], normalisation: Normalisation): Promise<void> {
    const indexes = lines.map((line) => line.index);
    const texts = lines.map((line) => line.text);
    const words = lines.map((line) => JSON.stringify(line.words));
    await db.$transaction([
      db.$executeRaw`
        UPDATE lines SET text = v.text, words = v.words::jsonb
        FROM unnest(${indexes}::int[], ${texts}::text[], ${words}::text[]) AS v(idx, text, words)
        WHERE lines.track_id = ${trackId}::uuid AND lines.index = v.idx`,
      db.track.update({ where: { id: trackId }, data: { normalisation: normalisation as unknown as object } }),
    ]);
  }
}
