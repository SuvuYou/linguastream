import { Injectable } from "@nestjs/common";
import {
  LIBRARY_PAGE_SIZE,
  ProcessingErrorCode,
  TranslationErrorCode,
  type LibraryPage,
  type Line,
  type ProcessingStatus,
  type VideoDetail,
  type VideoTranslation,
} from "@linguastream/contracts";
import { db } from "@linguastream/db";

export interface VideoView {
  detail: VideoDetail;
  trackId: string | null;
  translationId: string | null;
}

const baseLanguage = (code: string) => code.toLowerCase().split("-")[0];

export function translationState(
  track: {
    status: ProcessingStatus;
    language: string;
    lineCount: number;
    translations: { status: ProcessingStatus; errorCode: string | null; progress: number }[];
  } | null,
  nativeLanguage: string,
): VideoTranslation {
  if (!track || track.status !== "ready") return null;
  if (baseLanguage(track.language) === baseLanguage(nativeLanguage)) return null;
  const translation = track.translations[0];
  if (!translation) return { language: nativeLanguage, status: "none", error_code: null, progress: null };
  return {
    language: nativeLanguage,
    status: translation.status,
    error_code:
      translation.status === "failed" ? (TranslationErrorCode.safeParse(translation.errorCode).data ?? "internal") : null,
    progress: translation.status === "ready" ? null : { done: translation.progress, total: track.lineCount },
  };
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
    const owner = await db.user.findUnique({ where: { id: userId }, select: { nativeLanguage: true } });
    const nativeLanguage = owner?.nativeLanguage ?? "";
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
            select: {
              id: true,
              status: true,
              progress: true,
              errorCode: true,
              language: true,
              _count: { select: { lines: true } },
              translations: {
                where: { language: nativeLanguage },
                select: { status: true, errorCode: true, progress: true },
              },
            },
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
          translation: translationState(track && { ...track, lineCount: track._count.lines }, nativeLanguage),
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
            translations: { select: { id: true, language: true, status: true, errorCode: true, progress: true } },
          },
        },
      },
    });
    if (!video) return null;

    const track = video.tracks.find((t) => t.status === "ready") ?? video.tracks[0] ?? null;
    const native = track?.translations.filter((t) => t.language === video.user.nativeLanguage) ?? [];
    const translation = native.find((t) => t.status === "ready") ?? null;

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
        translation: translationState(
          track && { ...track, lineCount: track._count.lines, translations: native },
          video.user.nativeLanguage,
        ),
      },
    };
  }

  async markTranslationPending(trackId: string, language: string): Promise<void> {
    await db.trackTranslation.upsert({
      where: { trackId_language: { trackId, language } },
      create: { trackId, language, status: "pending" },
      update: { status: "pending", errorCode: null },
    });
  }

  async deleteVideo(userId: string, videoId: string): Promise<boolean> {
    const { count } = await db.video.deleteMany({ where: { id: videoId, userId } });
    return count > 0;
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
