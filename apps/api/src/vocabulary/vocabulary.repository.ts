import { Injectable } from "@nestjs/common";
import type { SetWordStatus, WordStatus } from "@linguastream/contracts";
import { db } from "@linguastream/db";

@Injectable()
export class VocabularyRepository {
  async statuses(userId: string, language: string, lemmas: string[]): Promise<Map<string, WordStatus>> {
    if (lemmas.length === 0) return new Map();
    const rows = await db.vocabularyWord.findMany({
      where: { userId, language, lemma: { in: lemmas } },
      select: { lemma: true, status: true },
    });
    return new Map(rows.map((r) => [r.lemma, r.status]));
  }

  async status(userId: string, language: string, lemma: string): Promise<WordStatus> {
    const row = await db.vocabularyWord.findUnique({
      where: { userId_language_lemma: { userId, language, lemma } },
      select: { status: true },
    });
    return row?.status ?? "unknown";
  }

  async setStatus(userId: string, { language, lemma, status }: SetWordStatus): Promise<void> {
    await db.vocabularyWord.upsert({
      where: { userId_language_lemma: { userId, language, lemma } },
      create: { userId, language, lemma, status, statusSource: "manual" },
      update: { status, statusSource: "manual" },
    });
  }
}
