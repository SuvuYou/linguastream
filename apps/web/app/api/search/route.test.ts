import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "./route";
import { getCurrentUser } from "@/lib/firebase/session";
import { meili, SUBTITLE_INDEX } from "@/lib/initializations/meilisearch";
import { parseSearchParamsSafe } from "@/helpers/params-schema";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/meilisearch", () => ({
  SUBTITLE_INDEX: "subtitles",
  meili: {
    index: vi.fn(),
  },
}));

vi.mock("@/helpers/params-schema", () => ({
  SEARCH_PARAMS_SCHEMA: {},
  parseSearchParamsSafe: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedParseSearchParamsSafe = vi.mocked(parseSearchParamsSafe);

const search = vi.fn();
const index = vi.fn(() => ({
  search,
}));

function createRequest(url: string) {
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(meili.index).mockImplementation(index);

  mockedGetCurrentUser.mockResolvedValue({
    id: "user-1",
  } as Awaited<ReturnType<typeof getCurrentUser>>);

  mockedParseSearchParamsSafe.mockReturnValue({
    q: "hello",
    src: undefined,
    trans: undefined,
  } as never);

  search.mockResolvedValue({
    hits: [],
    page: 1,
    totalPages: 0,
    totalHits: 0,
    hitsPerPage: 30,
  });
});

describe("GET /api/search", () => {
  it("returns 401 when user is unauthorized", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = createRequest("http://localhost/api/search?q=hello");

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(401);

    expect(json).toEqual({
      error: "Unauthorized",
    });

    expect(meili.index).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
  });

  it("returns empty results when query is missing", async () => {
    mockedParseSearchParamsSafe.mockReturnValue({
      q: undefined,
      src: undefined,
      trans: undefined,
    } as never);

    const req = createRequest("http://localhost/api/search");

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      results: [],
      page: 1,
      totalPages: 0,
      totalHits: 0,
      hitsPerPage: 30,
    });

    expect(meili.index).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
  });

  it("returns empty results when query is empty", async () => {
    mockedParseSearchParamsSafe.mockReturnValue({
      q: "",
      src: undefined,
      trans: undefined,
    } as never);

    const req = createRequest("http://localhost/api/search?q=");

    const res = await GET(req);
    const json = await res.json();

    expect(json).toEqual({
      results: [],
      page: 1,
      totalPages: 0,
      totalHits: 0,
      hitsPerPage: 30,
    });

    expect(search).not.toHaveBeenCalled();
  });

  it("returns empty results when query contains only whitespace", async () => {
    mockedParseSearchParamsSafe.mockReturnValue({
      q: "   ",
      src: undefined,
      trans: undefined,
    } as never);

    const req = createRequest("http://localhost/api/search?q=%20%20%20");

    const res = await GET(req);
    const json = await res.json();

    expect(json).toEqual({
      results: [],
      page: 1,
      totalPages: 0,
      totalHits: 0,
      hitsPerPage: 30,
    });

    expect(search).not.toHaveBeenCalled();
  });

  it("searches subtitles using default pagination", async () => {
    const hits = [
      {
        id: "subtitle-1",
        text: "Hello world",
      },
    ];

    search.mockResolvedValue({
      hits,
      page: 1,
      totalPages: 2,
      totalHits: 35,
      hitsPerPage: 30,
    });

    const req = createRequest("http://localhost/api/search?q=hello");

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      results: hits,
      page: 1,
      totalPages: 2,
      totalHits: 35,
      hitsPerPage: 30,
    });

    expect(meili.index).toHaveBeenCalledWith(SUBTITLE_INDEX);

    expect(search).toHaveBeenCalledWith("hello", {
      page: 1,
      hitsPerPage: 30,
      filter: ['(is_global = true OR owner_user_id = "user-1")'],
      attributesToHighlight: ["text"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    });
  });

  it("passes custom page and limit to Meilisearch", async () => {
    search.mockResolvedValue({
      hits: [],
      page: 3,
      totalPages: 10,
      totalHits: 300,
      hitsPerPage: 20,
    });

    const req = createRequest(
      "http://localhost/api/search?q=hello&page=3&limit=20",
    );

    const res = await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        page: 3,
        hitsPerPage: 20,
      }),
    );
  });

  it("floors fractional page and limit values", async () => {
    const req = createRequest(
      "http://localhost/api/search?q=hello&page=3.9&limit=20.8",
    );

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        page: 3,
        hitsPerPage: 20,
      }),
    );
  });

  it("uses page 1 for zero page", async () => {
    const req = createRequest("http://localhost/api/search?q=hello&page=0");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        page: 1,
      }),
    );
  });

  it("uses page 1 for negative page", async () => {
    const req = createRequest("http://localhost/api/search?q=hello&page=-5");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        page: 1,
      }),
    );
  });

  it("uses page 1 for an invalid page", async () => {
    const req = createRequest("http://localhost/api/search?q=hello&page=abc");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        page: 1,
      }),
    );
  });

  it("uses default limit for an invalid limit", async () => {
    const req = createRequest("http://localhost/api/search?q=hello&limit=abc");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        hitsPerPage: 30,
      }),
    );
  });

  it("uses default limit for zero", async () => {
    const req = createRequest("http://localhost/api/search?q=hello&limit=0");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        hitsPerPage: 30,
      }),
    );
  });

  it("uses default limit for negative values", async () => {
    const req = createRequest("http://localhost/api/search?q=hello&limit=-10");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        hitsPerPage: 30,
      }),
    );
  });

  it("caps the limit at 100", async () => {
    const req = createRequest("http://localhost/api/search?q=hello&limit=500");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        hitsPerPage: 100,
      }),
    );
  });

  it("adds source language filter", async () => {
    mockedParseSearchParamsSafe.mockReturnValue({
      q: "hello",
      src: "en",
      trans: undefined,
    } as never);

    const req = createRequest("http://localhost/api/search?q=hello&src=en");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        filter: [
          '(is_global = true OR owner_user_id = "user-1")',
          'source_language = "en"',
        ],
      }),
    );
  });

  it("adds translation language filter", async () => {
    mockedParseSearchParamsSafe.mockReturnValue({
      q: "hello",
      src: undefined,
      trans: "de",
    } as never);

    const req = createRequest("http://localhost/api/search?q=hello&trans=de");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        filter: [
          '(is_global = true OR owner_user_id = "user-1")',
          'translation_language = "de"',
        ],
      }),
    );
  });

  it("adds both language filters", async () => {
    mockedParseSearchParamsSafe.mockReturnValue({
      q: "hello",
      src: "en",
      trans: "de",
    } as never);

    const req = createRequest(
      "http://localhost/api/search?q=hello&src=en&trans=de",
    );

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        filter: [
          '(is_global = true OR owner_user_id = "user-1")',
          'source_language = "en"',
          'translation_language = "de"',
        ],
      }),
    );
  });

  it("restricts results to global content or the current user's content", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-42",
    } as Awaited<ReturnType<typeof getCurrentUser>>);

    const req = createRequest("http://localhost/api/search?q=hello");

    await GET(req);

    expect(search).toHaveBeenCalledWith(
      "hello",
      expect.objectContaining({
        filter: ['(is_global = true OR owner_user_id = "user-42")'],
      }),
    );
  });

  it("returns paginated result metadata from Meilisearch", async () => {
    search.mockResolvedValue({
      hits: [
        {
          id: "1",
          text: "hello",
        },
      ],
      page: 2,
      totalPages: 5,
      totalHits: 143,
      hitsPerPage: 30,
    });

    const req = createRequest("http://localhost/api/search?q=hello&page=2");

    const res = await GET(req);
    const json = await res.json();

    expect(json).toEqual({
      results: [
        {
          id: "1",
          text: "hello",
        },
      ],
      page: 2,
      totalPages: 5,
      totalHits: 143,
      hitsPerPage: 30,
    });
  });

  it("handles a non-paginated Meilisearch result", async () => {
    search.mockResolvedValue({
      hits: [
        {
          id: "1",
          text: "hello",
        },
      ],
    });

    const req = createRequest(
      "http://localhost/api/search?q=hello&page=4&limit=50",
    );

    const res = await GET(req);
    const json = await res.json();

    expect(json).toEqual({
      results: [
        {
          id: "1",
          text: "hello",
        },
      ],
      page: 4,
      totalPages: 0,
      totalHits: 0,
      hitsPerPage: 50,
    });
  });
});
