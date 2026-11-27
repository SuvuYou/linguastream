import { Injectable } from "@nestjs/common";
import type { DictionaryEntry, DictionarySense, WordForm } from "@linguastream/contracts";
import { db } from "@linguastream/db";
import type { AiWord, EntrySummary } from "./word-pack";

export const DICTIONARY_LANGUAGE = "de";

const VERB_POS = ["verb"];

const FORMS_LIMIT = 300;

interface Sense {
  gloss?: string;
  glosses?: string[];
  tags?: string[];
  example?: string | null;
  example_en?: string | null;
}

const fullSense = (sense: Sense): DictionarySense => ({
  gloss: sense.gloss ?? "",
  glosses: sense.glosses ?? (sense.gloss ? [sense.gloss] : []),
  tags: sense.tags ?? [],
  example: sense.example ?? null,
  example_en: sense.example_en ?? null,
});

export interface GlossKey {
  word: string;
  pos: string;
  gloss: string;
}

@Injectable()
export class DictionaryRepository {
  private imported = new Set<string>();

  async isImported(language: string): Promise<boolean> {
    if (this.imported.has(language)) return true;
    const found = await db.dictionaryEntry.findFirst({ where: { language }, select: { id: true } });
    if (found) this.imported.add(language);
    return !!found;
  }

  async canBeVerb(language: string, form: string): Promise<boolean> {
    const found = await db.dictionaryForm.findFirst({
      where: { language, formLower: form.toLowerCase(), pos: { in: VERB_POS } },
      select: { id: true },
    });
    return !!found;
  }

  async entries(language: string, lemmas: string[]): Promise<Map<string, EntrySummary[]>> {
    const lower = [...new Set(lemmas.map((l) => l.toLowerCase()))];
    const rows = await db.dictionaryEntry.findMany({
      where: { language, wordLower: { in: lower } },
      select: { word: true, wordLower: true, pos: true, gender: true, plural: true, flags: true, senses: true, senseCount: true },
    });
    const byLower = new Map<string, EntrySummary[]>();
    for (const row of rows) {
      const first = (row.senses as Sense[] | null)?.[0];
      const summary: EntrySummary = {
        word: row.word,
        pos: row.pos,
        gender: row.gender,
        plural: row.plural,
        flags: row.flags,
        senseCount: row.senseCount,
        firstGloss: first?.gloss ?? null,
        firstExample: first?.example ?? null,
      };
      byLower.set(row.wordLower, [...(byLower.get(row.wordLower) ?? []), summary]);
    }
    return byLower;
  }

  async fullEntries(language: string, lemma: string): Promise<DictionaryEntry[]> {
    const rows = await db.dictionaryEntry.findMany({
      where: { language, wordLower: lemma.toLowerCase() },
      orderBy: [{ senseCount: "desc" }, { id: "asc" }],
      select: { word: true, pos: true, gender: true, plural: true, flags: true, senses: true },
    });
    return rows.map((row) => ({ ...row, senses: ((row.senses as Sense[] | null) ?? []).map(fullSense) }));
  }

  async forms(language: string, lemma: string): Promise<WordForm[]> {
    const rows = await db.dictionaryForm.findMany({
      where: { language, lemma },
      orderBy: { id: "asc" },
      select: { form: true, pos: true, tags: true },
      take: FORMS_LIMIT,
    });
    const seen = new Set<string>();
    return rows.filter((row) => {
      const key = `${row.pos}|${row.form}|${row.tags.join(",")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async ranks(language: string, lemmas: string[]): Promise<Map<string, number>> {
    const rows = await db.lemmaFrequency.findMany({
      where: { language, word: { in: lemmas } },
      select: { word: true, rank: true },
    });
    return new Map(rows.map((r) => [r.word, r.rank]));
  }

  async glossTranslations(language: string, target: string, keys: GlossKey[]): Promise<Map<string, string>> {
    if (keys.length === 0) return new Map();
    const rows = await db.glossTranslation.findMany({
      where: {
        language,
        targetLanguage: target,
        word: { in: [...new Set(keys.map((k) => k.word))] },
      },
      select: { word: true, pos: true, gloss: true, text: true },
    });
    return new Map(rows.map((r) => [glossKey(r), r.text]));
  }

  async saveGlossTranslations(language: string, target: string, items: (GlossKey & { text: string })[]) {
    if (items.length === 0) return;
    await db.glossTranslation.createMany({
      data: items.map((item) => ({ language, targetLanguage: target, ...item })),
      skipDuplicates: true,
    });
  }

  async aiWords(language: string, target: string, lemmas: string[]): Promise<Map<string, AiWord>> {
    const rows = await db.aiWordEntry.findMany({
      where: { language, targetLanguage: target, lemma: { in: lemmas } },
      select: { lemma: true, pos: true, gender: true, gloss: true, parts: true },
    });
    return new Map(rows.map(({ lemma, ...word }) => [lemma, word]));
  }

  async saveAiWords(language: string, target: string, words: (AiWord & { lemma: string })[]) {
    if (words.length === 0) return;
    await db.aiWordEntry.createMany({
      data: words.map((word) => ({ language, targetLanguage: target, ...word })),
      skipDuplicates: true,
    });
  }
}

export function glossKey(key: GlossKey): string {
  return JSON.stringify([key.word, key.pos, key.gloss]);
}
