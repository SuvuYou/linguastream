import { z } from "zod";
import { defineRoute } from "./route.js";

export const WordDefinition = z.object({
  definition: z.string(),
  translation: z.string(),
  context_sentence: z.string(),
});

export type WordDefinition = z.infer<typeof WordDefinition>;

export const getWordDefinitionRoute = defineRoute({
  method: "GET",
  path: "/api/definition",
  query: z.object({
    word: z.string().min(1).max(100),
    lang: z.string().min(2).max(10),
    context: z.string().min(1).max(1000),
  }),
  response: WordDefinition,
});
