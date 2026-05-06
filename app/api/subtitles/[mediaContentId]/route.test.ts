import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "./route";
import { getSubtitles, ingestSubtitles } from "@/lib/db-helpers/subtitles";
import { parseSearchParamsSafe } from "@/helpers/params-schema";
import { NextRequest } from "next/server";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import { Whisper } from "next/font/google";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db-helpers/subtitles", () => ({
  getSubtitles: vi.fn(),
  ingestSubtitles: vi.fn(),
}));

vi.mock("@/helpers/params-schema", async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...(original as []),
    parseSearchParamsSafe: vi.fn(),
    FETCH_SUBTITLES_API_PARAMS_SCHEMA: {},
  };
});

const ingestDataMock = {
  sourceLang: "en",
  acquisitionMethod: "whisperx",
  sourceFile: "file",
  videoFilePath: "path",
  translateLangs: ["de"],
  translateMethod: "libretranslate",
  removeLangs: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("/api/subtitles/[mediaContentId]", () => {
  it("GET -> returns 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost?lang=en");
    const res = await GET(req, {
      params: Promise.resolve({ mediaContentId: "m1" }),
    });

    expect(res.status).toBe(401);
    expect(getSubtitles).not.toHaveBeenCalled();
  });

  it("GET -> returns 400 if lang missing", async () => {
    mockGetCurrentUser.base();
    vi.mocked(parseSearchParamsSafe).mockReturnValue(null);

    const req = new NextRequest("http://localhost");
    const res = await GET(req, {
      params: Promise.resolve({ mediaContentId: "m1" }),
    });

    expect(res.status).toBe(400);
    expect(getSubtitles).not.toHaveBeenCalled();
  });

  it("GET -> calls getSubtitles and returns result", async () => {
    mockGetCurrentUser.base();

    vi.mocked(parseSearchParamsSafe).mockReturnValue({
      lang: "en",
    });

    vi.mocked(getSubtitles).mockResolvedValue({
      status: 200,
      data: {
        language: "en",
        lines: [{ index: 1, text: "hello", start_ms: 10, end_ms: 20 }],
      },
    });

    const req = new NextRequest("http://localhost?lang=en");
    const res = await GET(req, {
      params: Promise.resolve({ mediaContentId: "m1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.language).toBe("en");
    expect(body.lines.length).toBe(1);

    expect(getSubtitles).toHaveBeenCalledWith({
      user: expect.objectContaining({ id: "id" }),
      mediaContentId: "m1",
      language: "en",
    });
  });

  it("PUT -> returns 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(ingestDataMock),
    });

    const res = await PUT(req, {
      params: Promise.resolve({ mediaContentId: "m1" }),
    });

    expect(res.status).toBe(401);
  });

  it("PUT -> returns 400 if invalid body", async () => {
    mockGetCurrentUser.base();
    vi.mocked(ingestSubtitles).mockResolvedValue({
      status: 200,
      data: { ok: true },
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ ...ingestDataMock, acquisitionMethod: "invalid" }),
    });

    const res = await PUT(req, {
      params: Promise.resolve({ mediaContentId: "m1" }),
    });

    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual(expect.objectContaining({ error: "Invalid request" }));
  });

  it("PUT -> returns 200 if valid body", async () => {
    mockGetCurrentUser.base();
    vi.mocked(ingestSubtitles).mockResolvedValue({
      status: 200,
      data: { ok: true },
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(ingestDataMock),
    });

    const res = await PUT(req, {
      params: Promise.resolve({ mediaContentId: "m1" }),
    });

    expect(res.status).toBe(200);
  });
});
