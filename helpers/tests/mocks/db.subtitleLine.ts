import { vi } from "vitest";
import type { SubtitleLine } from "@prisma/client";
import { db } from "@/lib/initializations/db";

const createBaseSubtitleLine = (): SubtitleLine => ({
  id: "id",
  media_content_id: "mediaId",
  subtitle_track_id: "trackId",
  index: 1,
  start_ms: 10,
  end_ms: 20,
  text: "subtitleText",
});

const createBaseResponse = () => ({
  ...createBaseSubtitleLine(),
});

const createBaseArrayResponse = () => [
  {
    ...createBaseSubtitleLine(),
    id: "id1",
    index: 1,
  },
  {
    ...createBaseSubtitleLine(),
    id: "id2",
    index: 2,
  },
];

export const mockDbSubtitleLine = {
  findUnique: {
    base: () =>
      vi
        .mocked(db.subtitleLine.findUnique)
        .mockResolvedValue(createBaseResponse()),
    empty: () => vi.mocked(db.subtitleLine.findUnique).mockResolvedValue(null),
    override: (overrides: Partial<SubtitleLine>) =>
      vi
        .mocked(db.subtitleLine.findUnique)
        .mockResolvedValue({ ...createBaseResponse(), ...overrides }),
  },
  findMany: {
    base: () =>
      vi
        .mocked(db.subtitleLine.findMany)
        .mockResolvedValue(createBaseArrayResponse()),
    empty: () => vi.mocked(db.subtitleLine.findMany).mockResolvedValue([]),
    override: (overrides: Partial<SubtitleLine>) =>
      vi
        .mocked(db.subtitleLine.findMany)
        .mockResolvedValue([{ ...createBaseResponse(), ...overrides }]),
  },
};
