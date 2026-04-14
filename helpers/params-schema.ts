import { z } from "zod";
import { LANGUAGES } from "./const";
import type { LanguageCode } from "./const";

const LanguageCodeSchema = z.enum(
  LANGUAGES.map((l) => l.code) as [LanguageCode, ...LanguageCode[]],
);

export const PUBLIC_LIBRARY_PARAMS_SCHEMA = z.object({
  q: z.string().optional(),

  src: LanguageCodeSchema.optional(),
  sub: LanguageCodeSchema.optional(),

  page: z
    .string()
    .transform((v) => Number(v))
    .refine((n) => !isNaN(n) && n >= 0, { message: "Invalid page" })
    .optional()
    .default(0),

  unreg: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .default(false),
});

export const USE_LIBRARY_HOOK_PARAMS_SCHEMA = z.object({
  q: z.string().optional(),

  page: z
    .string()
    .transform((v) => Number(v))
    .refine((n) => !isNaN(n) && n >= 0, { message: "Invalid page" })
    .optional()
    .default(0),

  unreg: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .default(false),
});

export const FETCH_LIBRARY_API_PARAMS_SCHEMA = z.object({
  q: z.string().optional(),

  selectedSrc: LanguageCodeSchema.optional(),
  selectedSub: LanguageCodeSchema.optional(),

  page: z
    .string()
    .transform((v) => Number(v))
    .refine((n) => !isNaN(n) && n >= 0, { message: "Invalid page" })
    .optional()
    .default(0),

  unreg: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .default(false),
});

export const FETCH_LANGUAGES_API_PARAMS_SCHEMA = z.object({
  src: LanguageCodeSchema.optional(),
  sub: LanguageCodeSchema.optional(),
});

export function parseSearchParams<T extends z.ZodTypeAny>(
  schema: T,
  params: URLSearchParams | Record<string, string | string[] | undefined>,
) {
  const obj =
    params instanceof URLSearchParams
      ? Object.fromEntries(params.entries())
      : params;

  return schema.parse(obj);
}

export function parseSearchParamsSafe<T extends z.ZodTypeAny>(
  schema: T,
  params: URLSearchParams | Record<string, string | string[] | undefined>,
) {
  const obj =
    params instanceof URLSearchParams
      ? Object.fromEntries(params.entries())
      : params;

  try {
    return schema.parse(obj);
  } catch {
    return null;
  }
}
