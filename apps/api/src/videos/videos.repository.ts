import { Injectable } from "@nestjs/common";
import {
  LIBRARY_PAGE_SIZE,
  ProcessingErrorCode,
  type LibraryPage,
  type Line,
  type VideoDetail,
} from "@linguastream/contracts";
import { db } from "@linguastream/db";

export interface VideoView {
  detail: VideoDetail;
  trackId: string | null;
  translationId: string | null;
}

@Injectable()
export class VideosRepository {
  async listVideos(userId: string, page: number, search?: string): Promise<LibraryPage> {
    const where = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { channelName: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };
    const [total, videos] = await db.$transaction([
      db.video.count({ where }),
      db.video.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: page * LIBRARY_PAGE_SIZE,
        take: LIBRARY_PAGE_SIZE,
        select: {
          id: true,
          youtubeVideoId: true,
          title: true,
          channelName: true,
          durationMs: true,
          createdAt: true,
          tracks: {
            orderBy: { createdAt: "desc" },
            select: { id: true, status: true, progress: true, errorCode: true },
          },
        },
      }),
    ]);

    return {
      page,
      page_size: LIBRARY_PAGE_SIZE,
      total,
      items: videos.map((video) => {
        const track = video.tracks.find((t) => t.status === "ready") ?? video.tracks[0] ?? null;
        return {
          id: video.id,
          youtube_video_id: video.youtubeVideoId,
          title: video.title,
          channel_name: video.channelName,
          duration_ms: video.durationMs,
          added_at: video.createdAt.toISOString(),
          track: track && {
            id: track.id,
            status: track.status,
            progress: track.progress,
            error_code:
              track.status === "failed" ? (ProcessingErrorCode.safeParse(track.errorCode).data ?? "internal") : null,
          },
        };
      }),
    };
  }

  async findVideo(userId: string, videoId: string): Promise<VideoView | null> {
    const video = await db.video.findFirst({
      where: { id: videoId, userId },
      select: {
        id: true,
        youtubeVideoId: true,
        title: true,
        channelName: true,
        durationMs: true,
        language: true,
        user: { select: { nativeLanguage: true } },
        tracks: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            language: true,
            isAutoCaptions: true,
            status: true,
            _count: { select: { lines: true } },
          },
        },
      },
    });
    if (!video) return null;

    const track = video.tracks.find((t) => t.status === "ready") ?? video.tracks[0] ?? null;
    const translation = track
      ? await db.trackTranslation.findFirst({
          where: { trackId: track.id, language: video.user.nativeLanguage, status: "ready" },
          select: { id: true, language: true },
        })
      : null;

    return {
      trackId: track?.id ?? null,
      translationId: translation?.id ?? null,
      detail: {
        id: video.id,
        youtube_video_id: video.youtubeVideoId,
        title: video.title,
        channel_name: video.channelName,
        duration_ms: video.durationMs,
        language: video.language,
        track: track && {
          id: track.id,
          language: track.language,
          is_auto_captions: track.isAutoCaptions,
          status: track.status,
          line_count: track._count.lines,
        },
        translation_language: translation?.language ?? null,
      },
    };
  }

  async linesInWindow(trackId: string, translationId: string | null, fromMs: number, toMs: number): Promise<Line[]> {
    const lines = await db.line.findMany({
      where: { trackId, startMs: { gte: fromMs, lt: toMs } },
      orderBy: { index: "asc" },
      select: {
        index: true,
        startMs: true,
        endMs: true,
        text: true,
        translations: translationId ? { where: { translationId }, select: { text: true } } : false,
      },
    });
    return lines.map((line) => ({
      index: line.index,
      start_ms: line.startMs,
      end_ms: line.endMs,
      text: line.text,
      translation: line.translations?.[0]?.text ?? null,
    }));
  }
}
