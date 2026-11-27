import { Injectable } from "@nestjs/common";
import { db } from "@linguastream/db";
import { firstLineWithLemma } from "./dictionary.sql";

export interface PackTarget {
  videoId: string;
  language: string;
  nativeLanguage: string;
}

@Injectable()
export class WordPackRepository {
  async videoForUser(userId: string, videoId: string): Promise<PackTarget | null> {
    const video = await db.video.findFirst({
      where: { id: videoId, userId },
      select: { id: true, language: true, user: { select: { nativeLanguage: true } } },
    });
    return video && { videoId: video.id, language: video.language, nativeLanguage: video.user.nativeLanguage };
  }

  async trackTarget(trackId: string): Promise<PackTarget | null> {
    const track = await db.track.findUnique({
      where: { id: trackId },
      select: { videoId: true, language: true, video: { select: { user: { select: { nativeLanguage: true } } } } },
    });
    return track && { videoId: track.videoId, language: track.language, nativeLanguage: track.video.user.nativeLanguage };
  }

  async lemmaCounts(videoId: string): Promise<{ lemma: string; count: number }[]> {
    return db.videoLemmaCount.findMany({
      where: { videoId },
      orderBy: [{ count: "desc" }, { lemma: "asc" }],
      select: { lemma: true, count: true },
    });
  }

  async examples(trackId: string, lemmas: string[]): Promise<Map<string, string>> {
    if (lemmas.length === 0) return new Map();
    const rows = await db.$queryRaw<{ lemma: string; text: string }[]>(firstLineWithLemma(trackId, lemmas));
    return new Map(rows.map((r) => [r.lemma, r.text]));
  }
}
