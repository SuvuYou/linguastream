export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const UNKNOWN_SOURCE_LANGUAGE = "unknown";

export const JELLYFIN_CONTENT_TYPE = "jellyfin";
export const YOUTUBE_CONTENT_TYPE = "youtube";
export const UPLOAD_CONTENT_TYPE = "upload";
