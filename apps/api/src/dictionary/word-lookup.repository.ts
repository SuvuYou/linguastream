import { Injectable } from "@nestjs/common";
import { db } from "@linguastream/db";
import type { StoredWord } from "../processing/analyse/analyse";

export interface LookupLine {
  language: string;
  nativeLanguage: string;
  text: string;
  translation: string | null;
  words: StoredWord[];
}

@Injectable()
export class WordLookupRepository {
  async line(userId: string, videoId: string, index: number): Promise<LookupLine | null> {
    const track = await db.track.findFirst({
      where: { videoId, status: "ready", video: { userId } },
      orderBy: { createdAt: "desc" },
      select: {
        language: true,
        video: { select: { user: { select: { nativeLanguage: true } } } },
        lines: {
          where: { index },
          select: {
            text: true,
            words: true,
            translations: {
              where: { translation: { status: "ready" } },
              select: { text: true, translation: { select: { language: true } } },
            },
          },
        },
      },
    });
    const line = track?.lines[0];
    if (!track || !line) return null;
    const nativeLanguage = track.video.user.nativeLanguage;
    return {
      language: track.language,
      nativeLanguage,
      text: line.text,
      translation: line.translations.find((t) => t.translation.language === nativeLanguage)?.text ?? null,
      words: (line.words as unknown as StoredWord[] | null) ?? [],
    };
  }
}
