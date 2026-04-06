export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
