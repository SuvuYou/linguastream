import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { meili } from "@/lib/initializations/meilisearch";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import { NextRequest } from "next/server";
import { Index } from "meilisearch";
import { SubtitleSearchDocument } from "@/lib/db-helpers/search";
import { NextURL } from "next/dist/server/web/next-url";
import { parseSearchParamsSafe } from "@/helpers/params-schema";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/helpers/params-schema", () => ({
  parseSearchParamsSafe: vi.fn(),
  SEARCH_PARAMS_SCHEMA: {},
}));

vi.mock("@/lib/initializations/meilisearch", () => ({
  meili: {
    index: vi.fn(),
  },
  SUBTITLE_INDEX: "subtitles",
}));

function mockRequest(params: { query: string; src?: string; trans?: string }) {
  const searchParams = new URLSearchParams(params);

  return new NextRequest(
    new NextURL(`http://test.local/api?${searchParams.toString()}`),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/search", () => {
  it("returns 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const res = await GET(mockRequest({ query: "", src: "", trans: "" }));

    expect(res.status).toBe(401);
  });

  it("returns empty results if query is empty", async () => {
    mockGetCurrentUser.base();
    vi.mocked(parseSearchParamsSafe).mockReturnValue({
      q: "",
      src: "",
      trans: "",
    });

    const res = await GET(mockRequest({ query: "", src: "", trans: "" }));
    const body = await res.json();

    expect(body).toEqual({ results: [] });
    expect(meili.index).not.toHaveBeenCalled();
  });

  it("calls meili with base filter", async () => {
    mockGetCurrentUser.base();
    vi.mocked(parseSearchParamsSafe).mockReturnValue({
      q: "hello",
    });

    const searchMock = vi.fn().mockResolvedValue({
      hits: [{ id: 1 }],
    });

    vi.mocked(meili.index).mockReturnValue({
      search: searchMock,
    } as unknown as Index<SubtitleSearchDocument>);

    const res = await GET(mockRequest({ query: "hello" }));

    const body = await res.json();

    expect(res.status).toBe(200);

    expect(searchMock).toHaveBeenCalledWith("hello", {
      limit: 30,
      filter: ['(is_global = true OR owner_user_id = "id")'],
      attributesToHighlight: ["text"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    });

    expect(body.results).toEqual([{ id: 1 }]);
  });

  it("adds source and translation filters", async () => {
    mockGetCurrentUser.base();

    vi.mocked(parseSearchParamsSafe).mockReturnValue({
      q: "hello",
      src: "en",
      trans: "de",
    });

    const searchMock = vi.fn().mockResolvedValue({ hits: [] });

    vi.mocked(meili.index).mockReturnValue({
      search: searchMock,
    } as unknown as Index<SubtitleSearchDocument>);

    await GET(mockRequest({ query: "hello", src: "en", trans: "de" }));

    expect(searchMock).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        filter: [
          '(is_global = true OR owner_user_id = "id")',
          'source_language = "en"',
          'translation_language = "de"',
        ],
      }),
    );
  });

  it("handles invalid params safely", async () => {
    mockGetCurrentUser.base();

    vi.mocked(parseSearchParamsSafe).mockReturnValue({
      q: "hello",
      src: "en",
      trans: "de",
    });

    const res = await GET(
      mockRequest({ query: "hello", src: "en", trans: "" }),
    );
    const body = await res.json();

    expect(body).toEqual({ results: [] });
  });
});
