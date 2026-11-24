export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
] as const;

export const SUPPORTED_LANGUAGES = new Set(LANGUAGES.map((l) => l.code));

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const UNKNOWN_SOURCE_LANGUAGE = "unknown";

export const YOUTUBE_CONTENT_TYPE = "youtube";
export const UPLOAD_CONTENT_TYPE = "upload";

export const PAGE_SIZE = 20;

export const JOB_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const AUTO_DETECT = "auto";
