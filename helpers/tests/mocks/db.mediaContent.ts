import { vi } from "vitest";
import type { MediaContent } from "@prisma/client";
import { db } from "@/lib/initializations/db";
import { JELLYFIN_CONTENT_TYPE, JOB_STATUS } from "@/helpers/const";

const createBaseMediaContent = (): MediaContent => ({
  id: "mediaId",
  user_id: "userId",
  title: "title",
  type: JELLYFIN_CONTENT_TYPE,
  source_language: "en",
  source_subtitle_acquisition_method: "whisperx",
  jellyfin_id: "jellyfinId",
  file_path: "path/file",
  youtube_video_id: "ytId",
  job_status: JOB_STATUS.DONE,
  job_progress: 12,
  job_logs: "path/job",
  created_at: new Date(),
});

const createBaseResponse = () => ({
  ...createBaseMediaContent(),
});

const createBaseArrayResponse = () => [
  {
    ...createBaseMediaContent(),
  },
  {
    ...createBaseMediaContent(),
  },
];

type OverrideArgType = Partial<
  MediaContent & { subtitle_tracks: { language: string }[] }
>;

export const mockDbMediaContent = {
  findUnique: {
    base: () =>
      vi
        .mocked(db.mediaContent.findUnique)
        .mockResolvedValue(createBaseResponse()),
    empty: () => vi.mocked(db.mediaContent.findUnique).mockResolvedValue(null),
    override: (overrides: OverrideArgType) =>
      vi
        .mocked(db.mediaContent.findUnique)
        .mockResolvedValue({ ...createBaseResponse(), ...overrides }),
  },
  update: {
    base: () =>
      vi
        .mocked(db.mediaContent.findUnique)
        .mockResolvedValue(createBaseResponse()),
    empty: () => vi.mocked(db.mediaContent.findUnique).mockResolvedValue(null),
    override: (overrides: OverrideArgType) =>
      vi
        .mocked(db.mediaContent.findUnique)
        .mockResolvedValue({ ...createBaseResponse(), ...overrides }),
  },
  findMany: {
    base: () =>
      vi
        .mocked(db.mediaContent.findMany)
        .mockResolvedValue(createBaseArrayResponse()),
    empty: () => vi.mocked(db.mediaContent.findMany).mockResolvedValue([]),
    override: (overrides: OverrideArgType) =>
      vi
        .mocked(db.mediaContent.findMany)
        .mockResolvedValue([{ ...createBaseResponse(), ...overrides }]),
    once: (overrides: OverrideArgType) =>
      vi
        .mocked(db.mediaContent.findMany)
        .mockResolvedValueOnce([{ ...createBaseResponse(), ...overrides }])
        .mockResolvedValueOnce([]),
  },
};
