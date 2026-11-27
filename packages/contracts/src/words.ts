import { z } from "zod";
import { defineRoute } from "./route.js";

export const WordStatus = z.enum(["unknown", "learning", "known", "ignored"]);

export type WordStatus = z.infer<typeof WordStatus>;

export const WordSource = z.enum(["dictionary", "ai"]);

export type WordSource = z.infer<typeof WordSource>;

export const PackWord = z.object({
  lemma: z.string(),
  count: z.number().int().positive(),
  pos: z.string().nullable(),
  gender: z.string().nullable(),
  plural: z.string().nullable(),
  flags: z.array(z.string()),
  gloss: z.string().nullable(),
  gloss_language: z.string().nullable(),
  source: WordSource.nullable(),
  rank: z.number().int().positive().nullable(),
  parts: z.array(z.string()),
  status: WordStatus,
});

export type PackWord = z.infer<typeof PackWord>;

export const WordPack = z.object({
  video_id: z.uuid(),
  language: z.string(),
  native_language: z.string(),
  words: z.array(PackWord),
});

export type WordPack = z.infer<typeof WordPack>;

export const getWordPackRoute = defineRoute({
  method: "GET",
  path: "/api/videos/:videoId/words",
  params: z.object({ videoId: z.uuid() }),
  response: WordPack,
});

export const DictionarySense = z.object({
  gloss: z.string(),
  glosses: z.array(z.string()),
  tags: z.array(z.string()),
  example: z.string().nullable(),
  example_en: z.string().nullable(),
});

export type DictionarySense = z.infer<typeof DictionarySense>;

export const DictionaryEntry = z.object({
  word: z.string(),
  pos: z.string(),
  gender: z.string().nullable(),
  plural: z.string().nullable(),
  flags: z.array(z.string()),
  senses: z.array(DictionarySense),
});

export type DictionaryEntry = z.infer<typeof DictionaryEntry>;

export const AiWordEntry = z.object({
  pos: z.string().nullable(),
  gender: z.string().nullable(),
  gloss: z.string().nullable(),
  parts: z.array(z.string()),
});

export type AiWordEntry = z.infer<typeof AiWordEntry>;

export const WordForm = z.object({
  form: z.string(),
  pos: z.string(),
  tags: z.array(z.string()),
});

export type WordForm = z.infer<typeof WordForm>;

export const WordLookup = z.object({
  video_id: z.uuid(),
  line_index: z.number().int().nonnegative(),
  line: z.object({ text: z.string(), translation: z.string().nullable() }),
  word: z.object({
    i: z.number().int().nonnegative(),
    text: z.string(),
    pos: z.string().nullable(),
    morph: z.string().nullable(),
  }),
  language: z.string(),
  native_language: z.string(),
  lemma: z.string().nullable(),
  status: WordStatus,
  rank: z.number().int().positive().nullable(),
  gloss: z.string().nullable(),
  gloss_language: z.string().nullable(),
  entries: z.array(DictionaryEntry),
  forms: z.array(WordForm),
  ai: AiWordEntry.nullable(),
});

export type WordLookup = z.infer<typeof WordLookup>;

export const lookupWordRoute = defineRoute({
  method: "GET",
  path: "/api/videos/:videoId/lines/:index/words/:i",
  params: z.object({
    videoId: z.uuid(),
    index: z.coerce.number().int().nonnegative(),
    i: z.coerce.number().int().nonnegative(),
  }),
  response: WordLookup,
});

export const WORD_LEMMA_MAX = 100;

export const SetWordStatus = z.object({
  language: z.string().min(2).max(16),
  lemma: z.string().trim().min(1).max(WORD_LEMMA_MAX),
  status: WordStatus,
});

export type SetWordStatus = z.infer<typeof SetWordStatus>;

export const setWordStatusRoute = defineRoute({
  method: "PUT",
  path: "/api/vocabulary/status",
  body: SetWordStatus,
  response: SetWordStatus,
});
