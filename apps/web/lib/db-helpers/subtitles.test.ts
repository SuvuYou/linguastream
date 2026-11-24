import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSubtitles } from "@/lib/db-helpers/subtitles";
import { mockDbMediaContent } from "@/helpers/tests/mocks/db.mediaContent";
import { mockDbSubtitleTrack } from "@/helpers/tests/mocks/db.subtitleTrack";
import { mockDbSubtitleLine } from "@/helpers/tests/mocks/db.subtitleLine";

vi.mock("@/lib/initializations/db", () => ({
  db: {
    $transaction: vi.fn(),
    mediaContent: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subtitleTrack: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    subtitleLine: {
      findMany: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("subtitles lib", () => {
  it("returns 404 if media not found", async () => {
    mockDbMediaContent.findUnique.empty();

    const res = await getSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      language: "en",
    });

    expect(res.status).toBe(404);
  });

  it("returns 403 if not owner and not admin", async () => {
    mockDbMediaContent.findUnique.override({ user_id: "other" });

    const res = await getSubtitles({
      user: { id: "u1", is_admin: false },
      mediaContentId: "m1",
      language: "en",
    });

    expect(res.status).toBe(403);
  });

  it("returns 404 if track not found", async () => {
    mockDbMediaContent.findUnique.override({ user_id: "u1" });
    mockDbSubtitleTrack.findUnique.empty();

    const res = await getSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      language: "en",
    });

    expect(res.status).toBe(404);
  });

  it("returns subtitle lines", async () => {
    mockDbMediaContent.findUnique.override({ user_id: "u1" });
    mockDbSubtitleTrack.findUnique.base();
    mockDbSubtitleLine.findMany.base();

    const res = await getSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      language: "en",
    });

    expect(res.status).toBe(200);
    expect(res.data?.lines.length).toBe(2);
  });
});
