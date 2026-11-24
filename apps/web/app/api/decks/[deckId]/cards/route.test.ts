import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/initializations/db";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import { getJellyfinStreamUrl } from "@/lib/db-helpers/jellyfin";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db-helpers/jellyfin", () => ({
  getJellyfinStreamUrl: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    deck: {
      findFirst: vi.fn(),
    },
    card: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    mediaContent: {
      findMany: vi.fn(),
    },
  },
}));

function mockParams(deckId = "deck-1") {
  return {
    params: Promise.resolve({ deckId }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/decks/[deckId]/cards", () => {
  it("GET -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("GET -> 404 if deck not found", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findFirst).mockResolvedValue(null);

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({ error: "Deck not found" });
  });

  it("GET -> returns paginated cards", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findFirst).mockResolvedValue({
      id: "deck-1",
    } as never);

    vi.mocked(db.card.findMany).mockResolvedValue([
      {
        id: "card-1",
        media_content_id: "mediaId",
        word: "hello",
        word_profile: null,
      },
    ] as never);

    vi.mocked(db.card.count).mockResolvedValue(1);

    vi.mocked(db.mediaContent.findMany).mockResolvedValue([
      {
        id: "mediaId",
        jellyfin_id: "jf-1",
      },
    ] as never);

    vi.mocked(getJellyfinStreamUrl).mockReturnValue(
      "https://example.com/stream",
    );

    const req = new NextRequest("http://localhost?limit=10&page=0");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      cards: [
        {
          id: "card-1",
          media_content_id: "mediaId",
          word: "hello",
          word_profile: null,
          videoId: null,
          streamUrl: "https://example.com/stream",
        },
      ],
      total: 1,
      pageCount: 1,
      page: 0,
      limit: 10,
    });
  });

  it("GET -> returns null streamUrl when media has no jellyfin id", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findFirst).mockResolvedValue({
      id: "deck-1",
    } as never);

    vi.mocked(db.card.findMany).mockResolvedValue([
      {
        id: "card-1",
        media_content_id: "mediaId",
        word_profile: null,
      },
    ] as never);

    vi.mocked(db.card.count).mockResolvedValue(1);

    vi.mocked(db.mediaContent.findMany).mockResolvedValue([
      {
        id: "mediaId",
        jellyfin_id: null,
      },
    ] as never);

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(body.cards[0].streamUrl).toBeNull();

    expect(getJellyfinStreamUrl).not.toHaveBeenCalled();
  });

  it("GET -> filters by language and search query", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findFirst).mockResolvedValue({
      id: "deck-1",
    } as never);

    vi.mocked(db.card.findMany).mockResolvedValue([] as never);
    vi.mocked(db.card.count).mockResolvedValue(0);
    vi.mocked(db.mediaContent.findMany).mockResolvedValue([] as never);

    const req = new NextRequest("http://localhost?lang=de&q=haus");

    await GET(req, mockParams());

    expect(db.card.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deck_id: "deck-1",
          user_id: "user-1",
          source_language: "de",
          word: {
            contains: "haus",
            mode: "insensitive",
          },
        },
      }),
    );

    expect(db.card.count).toHaveBeenCalledWith({
      where: {
        deck_id: "deck-1",
        user_id: "user-1",
        source_language: "de",
        word: {
          contains: "haus",
          mode: "insensitive",
        },
      },
    });
  });

  it("GET -> uses default pagination", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findFirst).mockResolvedValue({
      id: "deck-1",
    } as never);

    vi.mocked(db.card.findMany).mockResolvedValue([] as never);
    vi.mocked(db.card.count).mockResolvedValue(0);
    vi.mocked(db.mediaContent.findMany).mockResolvedValue([] as never);

    const req = new NextRequest("http://localhost");

    await GET(req, mockParams());

    expect(db.card.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
        skip: 0,
      }),
    );
  });

  it("GET -> uses custom pagination", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findFirst).mockResolvedValue({
      id: "deck-1",
    } as never);

    vi.mocked(db.card.findMany).mockResolvedValue([] as never);
    vi.mocked(db.card.count).mockResolvedValue(0);
    vi.mocked(db.mediaContent.findMany).mockResolvedValue([] as never);

    const req = new NextRequest("http://localhost?page=2&limit=25");

    await GET(req, mockParams());

    expect(db.card.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 25,
        skip: 50,
      }),
    );
  });
});
