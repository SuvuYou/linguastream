import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getSubtitles } from "@/lib/db-helpers/subtitles";
import { parseSearchParamsSafe } from "@/helpers/params-schema";
import { NextRequest } from "next/server";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db-helpers/subtitles", () => ({
  getSubtitles: vi.fn(),
}));

vi.mock("@/helpers/params-schema", async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...(original as []),
    parseSearchParamsSafe: vi.fn(),
    FETCH_SUBTITLES_API_PARAMS_SCHEMA: {},
  };
});

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
});
