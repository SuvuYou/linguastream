export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "German" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const UNKNOWN_SOURCE_LANGUAGE = "unknown";

export const JELLYFIN_CONTENT_TYPE = "jellyfin";
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

export const SUBTITLE_ACQUISITION_METHOD = [
  { type: "upload", label: "Upload" },
  { type: "whisperx", label: "WhisperX" },
] as const;

export type SubtitleAcquisitionMethod =
  (typeof SUBTITLE_ACQUISITION_METHOD)[number]["type"];

export const AUTO_DETECT = "auto";
