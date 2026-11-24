import { vi } from "vitest";
import type { SubtitleTrack } from "@prisma/client";
import { db } from "@/lib/initializations/db";

const createBaseSubtitleTrack = (): SubtitleTrack => ({
  id: "id",
  media_content_id: "mediaId",
  language: "en",
  is_source: true,
  created_at: new Date(),
});

const createBaseResponse = () => ({
  ...createBaseSubtitleTrack(),
});

export const mockDbSubtitleTrack = {
  findUnique: {
    base: () =>
      vi
        .mocked(db.subtitleTrack.findUnique)
        .mockResolvedValue(createBaseResponse()),
    empty: () => vi.mocked(db.subtitleTrack.findUnique).mockResolvedValue(null),
    override: (overrides: Partial<SubtitleTrack>) =>
      vi
        .mocked(db.subtitleTrack.findUnique)
        .mockResolvedValue({ ...createBaseResponse(), ...overrides }),
  },
  findMany: {
    base: () =>
      vi
        .mocked(db.subtitleTrack.findMany)
        .mockResolvedValue([createBaseResponse()]),
    empty: () => vi.mocked(db.subtitleTrack.findMany).mockResolvedValue([]),
    override: (overrides: Partial<SubtitleTrack>) =>
      vi
        .mocked(db.subtitleTrack.findMany)
        .mockResolvedValue([{ ...createBaseResponse(), ...overrides }]),
  },
};
