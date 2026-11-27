import { Injectable } from "@nestjs/common";
import type { ProcessingErrorCode } from "@linguastream/contracts";
import { db } from "@linguastream/db";
import type { AnalysedLine, StoredLine, StoredWord } from "./analyse/analyse";
import type { NormalisedLine, Normalisation } from "./normalise/normalise";
import type { LemmaCount } from "./index/lemma-counts";
import {
  insertLemmaCounts,
  updateLineTextsAndWords,
  updateLineWordsAndLemmas,
  upsertLineTranslations,
} from "./processing.sql";
import type { ParsedLine } from "./steps/parse-json3";
import type { SourceLine, TranslatedLine, TranslationReport } from "./translate/translate";

export interface OpenTranslation {
  track: TrackSummary;
  done: number;
  total: number;
}

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
      db.$executeRaw(updateLineTextsAndWords(trackId, indexes, texts, words)),
      db.track.update({ where: { id: trackId }, data: { normalisation: normalisation as unknown as object } }),
    ]);
  }

  async lineWords(trackId: string): Promise<StoredLine[]> {
    const lines = await db.line.findMany({
      where: { trackId },
      orderBy: { index: "asc" },
      select: { index: true, words: true },
    });
    return lines.map((line) => ({ index: line.index, words: (line.words as unknown as StoredWord[]) ?? [] }));
  }

  async saveAnalysis(trackId: string, lines: AnalysedLine[]): Promise<void> {
    const indexes = lines.map((line) => line.index);
    const words = lines.map((line) => JSON.stringify(line.words));
    const lemmas = lines.map((line) => JSON.stringify(line.lemmas));
    await db.$executeRaw(updateLineWordsAndLemmas(trackId, indexes, words, lemmas));
  }

  async translationTarget(trackId: string): Promise<{ sourceLanguage: string; targetLanguage: string } | null> {
    const track = await db.track.findUnique({
      where: { id: trackId },
      select: { language: true, video: { select: { user: { select: { nativeLanguage: true } } } } },
    });
    return track && { sourceLanguage: track.language, targetLanguage: track.video.user.nativeLanguage };
  }

  async startTranslation(trackId: string, language: string): Promise<string> {
    const translation = await db.trackTranslation.upsert({
      where: { trackId_language: { trackId, language } },
      create: { trackId, language, status: "processing" },
      update: { status: "processing", errorCode: null },
      select: { id: true },
    });
    return translation.id;
  }

  async translationLines(trackId: string, translationId: string): Promise<SourceLine[]> {
    const lines = await db.line.findMany({
      where: { trackId },
      orderBy: { index: "asc" },
      select: { id: true, index: true, text: true, translations: { where: { translationId }, select: { lineId: true } } },
    });
    return lines.map((line) => ({
      lineId: line.id,
      index: line.index,
      text: line.text,
      translated: line.translations.length > 0,
    }));
  }

  async saveLineTranslations(translationId: string, lines: TranslatedLine[]): Promise<void> {
    if (lines.length === 0) return;
    const ids = lines.map((line) => line.lineId);
    const texts = lines.map((line) => line.text);
    await db.$executeRaw(upsertLineTranslations(translationId, ids, texts));
  }

  async finishTranslation(translationId: string, report: TranslationReport): Promise<void> {
    await db.trackTranslation.update({
      where: { id: translationId },
      data: { status: report.status, errorCode: report.errorCode, progress: report.translatedLines },
    });
  }

  async pendingTranslationTrackIds(): Promise<string[]> {
    const translations = await db.trackTranslation.findMany({
      where: { status: { in: ["pending", "processing"] }, track: { status: "ready" } },
      select: { trackId: true },
      distinct: ["trackId"],
    });
    return translations.map((translation) => translation.trackId);
  }

  async failOpenTranslations(trackId: string): Promise<void> {
    await db.trackTranslation.updateMany({
      where: { trackId, status: { in: ["pending", "processing"] } },
      data: { status: "failed", errorCode: "internal" },
    });
  }

  async saveTranslationProgress(translationId: string, done: number): Promise<void> {
    await db.trackTranslation.update({ where: { id: translationId }, data: { progress: done } });
  }

  async openTranslations(userId: string): Promise<OpenTranslation[]> {
    const translations = await db.trackTranslation.findMany({
      where: { status: { in: ["pending", "processing"] }, track: { status: "ready", video: { userId } } },
      select: {
        progress: true,
        track: { select: { ...summarySelect, _count: { select: { lines: true } } } },
      },
    });
    return translations.map(({ progress, track }) => ({
      track: toSummary(track),
      done: progress,
      total: track._count.lines,
    }));
  }

  async replaceLemmaCounts(trackId: string, counts: LemmaCount[]): Promise<void> {
    const { videoId } = await db.track.findUniqueOrThrow({ where: { id: trackId }, select: { videoId: true } });
    await db.$transaction([
      db.videoLemmaCount.deleteMany({ where: { videoId } }),
      db.$executeRaw(
        insertLemmaCounts(
          videoId,
          counts.map((c) => c.lemma),
          counts.map((c) => c.count),
        ),
      ),
    ]);
  }

  async readyTracksWithoutLemmaCounts(): Promise<string[]> {
    const tracks = await db.track.findMany({
      where: { status: "ready", video: { lemmaCounts: { none: {} } } },
      orderBy: { createdAt: "desc" },
      select: { id: true, videoId: true },
    });
    const newest = new Map<string, string>();
    for (const track of tracks) if (!newest.has(track.videoId)) newest.set(track.videoId, track.id);
    return [...newest.values()];
  }
}
