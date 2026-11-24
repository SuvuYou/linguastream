import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSubtitles, ingestSubtitles } from "@/lib/db-helpers/subtitles";
import { db } from "@/lib/initializations/db";
import { spawnIngest } from "@/lib/scripts/spawn-ingest";
import { mockDbMediaContent } from "@/helpers/tests/mocks/db.mediaContent";
import { JOB_STATUS } from "@/helpers/const";
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

vi.mock("@/lib/scripts/spawn-ingest", () => ({
  spawnIngest: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockedDb = vi.mocked(db, true);
const mockedSpawn = vi.mocked(spawnIngest);

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

  it("blocks deepl for non-admins", async () => {
    const res = await ingestSubtitles({
      user: { id: "u1", is_admin: false },
      mediaContentId: "m1",
      data: {
        translateMethod: "deepl",
        acquisitionMethod: "whisperx",
        sourceLang: "",
        translateLangs: [],
        translateFiles: {},
        removeLangs: [],
        videoFilePath: "",
      },
    });

    expect(res.status).toBe(403);
  });

  it("returns 404 if media not found", async () => {
    mockDbMediaContent.findUnique.empty();

    const res = await ingestSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      data: {
        acquisitionMethod: "whisperx",
        sourceLang: "",
        translateLangs: [],
        translateFiles: {},
        removeLangs: [],
        videoFilePath: "",
      },
    });

    expect(res.status).toBe(404);
  });

  it("returns 409 if job is running", async () => {
    mockDbMediaContent.findUnique.override({
      user_id: "u1",
      job_status: JOB_STATUS.RUNNING,
    });

    const res = await ingestSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      data: {
        acquisitionMethod: "upload",
        sourceFile: "x",
        sourceLang: "",
        translateLangs: [],
        translateFiles: {},
        removeLangs: [],
        videoFilePath: "",
      },
    });

    expect(res.status).toBe(409);
  });

  it("validates upload requirements", async () => {
    mockDbMediaContent.findUnique.override({ user_id: "u1" });

    const res = await ingestSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      data: {
        acquisitionMethod: "upload",
        sourceLang: "",
        translateLangs: [],
        translateFiles: {},
        removeLangs: [],
        videoFilePath: "",
        // missing sourceFile
      },
    });

    expect(res.status).toBe(400);
  });

  it("starts ingest job successfully", async () => {
    mockedSpawn.mockReturnValue({ logFile: "/log.txt" });

    mockDbMediaContent.findUnique.override({ user_id: "u1" });
    mockDbMediaContent.update.override({ id: "m1", user_id: "u1" });

    mockDbSubtitleTrack.findMany.empty();
    mockedDb.$transaction.mockResolvedValue(undefined);

    const res = await ingestSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      data: {
        acquisitionMethod: "upload",
        sourceFile: "file.srt",
        sourceLang: "",
        translateLangs: [],
        translateFiles: {},
        removeLangs: [],
        videoFilePath: "",
      },
    });

    expect(res.status).toBe(200);
    expect(mockedSpawn).toHaveBeenCalled();
    expect(mockedDb.mediaContent.update).toHaveBeenCalled();
  });

  it("handles spawn failure", async () => {
    mockDbMediaContent.update.override({ id: "m1", user_id: "u1" });
    mockedSpawn.mockImplementation(() => {
      throw new Error("boom");
    });

    const res = await ingestSubtitles({
      user: { id: "u1" },
      mediaContentId: "m1",
      data: {
        acquisitionMethod: "upload",
        sourceFile: "file.srt",
        sourceLang: "",
        translateLangs: [],
        translateFiles: {},
        removeLangs: [],
        videoFilePath: "",
      },
    });

    expect(res.status).toBe(500);
    expect(mockedDb.mediaContent.update).toHaveBeenCalled();
  });
});
