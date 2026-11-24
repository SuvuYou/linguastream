import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { db } from "@/lib/initializations/db";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    deck: {
      findMany: vi.fn(),
    },
    card: {
      groupBy: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/decks", () => {
  it("GET -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost/api/decks");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("GET -> returns decks with computed stats", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findMany).mockResolvedValue([
      {
        id: "deck-1",
        name: "Default",
        is_default: true,
        created_at: new Date("2024-01-01"),
      },
      {
        id: "deck-2",
        name: "German",
        is_default: false,
        created_at: new Date("2024-01-02"),
      },
    ] as never);

    vi.mocked(db.card.groupBy)
      .mockResolvedValueOnce([
        {
          deck_id: "deck-1",
          _count: { _all: 10 },
        },
        {
          deck_id: "deck-2",
          _count: { _all: 5 },
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          deck_id: "deck-1",
          _count: { _all: 4 },
        },
        {
          deck_id: "deck-2",
          _count: { _all: 1 },
        },
      ] as never);

    const req = new NextRequest("http://localhost/api/decks");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      decks: [
        {
          id: "deck-1",
          name: "Default",
          is_default: true,
          created_at: new Date("2024-01-01").toISOString(),
          stats: {
            total: 10,
            due: 4,
            learned: 6,
            progress: 60,
          },
        },
        {
          id: "deck-2",
          name: "German",
          is_default: false,
          created_at: new Date("2024-01-02").toISOString(),
          stats: {
            total: 5,
            due: 1,
            learned: 4,
            progress: 80,
          },
        },
      ],
    });
  });

  it("GET -> returns zero stats for empty decks", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findMany).mockResolvedValue([
      {
        id: "deck-1",
        name: "Default",
        is_default: true,
        created_at: new Date(),
      },
    ] as never);

    vi.mocked(db.card.groupBy)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/decks");

    const res = await GET(req);
    const body = await res.json();

    expect(body.decks[0].stats).toEqual({
      total: 0,
      due: 0,
      learned: 0,
      progress: 0,
    });
  });

  it("GET -> filters cards by source language", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findMany).mockResolvedValue([] as never);

    vi.mocked(db.card.groupBy)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/decks?sourceLanguage=de");

    await GET(req);

    expect(db.card.groupBy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          source_language: "de",
        }),
      }),
    );

    expect(db.card.groupBy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          source_language: "de",
          next_review: expect.any(Object),
        }),
      }),
    );
  });

  it("GET -> does not filter by source language when omitted", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findMany).mockResolvedValue([] as never);

    vi.mocked(db.card.groupBy)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/decks");

    await GET(req);

    expect(db.card.groupBy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.not.objectContaining({
          source_language: expect.anything(),
        }),
      }),
    );
  });
});
