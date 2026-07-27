import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, DELETE } from "./route";
import { db } from "@/lib/initializations/db";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    deck: {
      findUnique: vi.fn(),
    },
    card: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
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

describe("GET /api/decks/[deckId]", () => {
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

    vi.mocked(db.deck.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("GET -> 404 if deck belongs to another user", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      id: "deck-1",
      name: "Default",
      is_default: true,
      user_id: "user-2",
    } as never);

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("GET -> returns deck and available languages", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      id: "deck-1",
      name: "Default",
      is_default: true,
      user_id: "user-1",
    } as never);

    vi.mocked(db.card.findMany).mockResolvedValue([
      { source_language: "en" },
      { source_language: "de" },
    ] as never);

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      deck: {
        id: "deck-1",
        name: "Default",
        is_default: true,
        user_id: "user-1",
      },
      availableLanguages: ["en", "de"],
    });

    expect(db.card.findMany).toHaveBeenCalledWith({
      where: {
        deck_id: "deck-1",
        user_id: "user-1",
      },
      select: {
        source_language: true,
      },
      distinct: ["source_language"],
    });
  });
});

describe("DELETE /api/decks/[deckId]", () => {
  it("DELETE -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
    });

    const res = await DELETE(req, mockParams());

    expect(res.status).toBe(401);
  });

  it("DELETE -> 404 if deck not found", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
    });

    const res = await DELETE(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("DELETE -> 404 if deck belongs to another user", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      id: "deck-1",
      user_id: "user-2",
      is_default: false,
    } as never);

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
    });

    const res = await DELETE(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("DELETE -> clears default deck cards but keeps deck", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      id: "deck-1",
      user_id: "user-1",
      is_default: true,
    } as never);

    const tx = {
      studySessionCard: {
        findMany: vi.fn().mockResolvedValue([{ session_id: "session-1" }]),
      },
      studySession: {
        deleteMany: vi.fn(),
      },
      card: {
        deleteMany: vi.fn(),
      },
      deck: {
        delete: vi.fn(),
      },
    };

    vi.mocked(db.$transaction).mockImplementation(async (cb: any) => cb(tx));

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
    });

    const res = await DELETE(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });

    expect(tx.studySession.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["session-1"],
        },
      },
    });

    expect(tx.card.deleteMany).toHaveBeenCalledWith({
      where: {
        deck_id: "deck-1",
      },
    });

    expect(tx.deck.delete).not.toHaveBeenCalled();
  });

  it("DELETE -> deletes non-default deck", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      id: "deck-1",
      user_id: "user-1",
      is_default: false,
    } as never);

    const tx = {
      studySessionCard: {
        findMany: vi.fn().mockResolvedValue([{ session_id: "session-1" }]),
      },
      studySession: {
        deleteMany: vi.fn(),
      },
      card: {
        deleteMany: vi.fn(),
      },
      deck: {
        delete: vi.fn(),
      },
    };

    vi.mocked(db.$transaction).mockImplementation(async (cb: any) => cb(tx));

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
    });

    const res = await DELETE(req, mockParams());

    expect(res.status).toBe(200);

    expect(tx.card.deleteMany).toHaveBeenCalledWith({
      where: {
        deck_id: "deck-1",
      },
    });

    expect(tx.deck.delete).toHaveBeenCalledWith({
      where: {
        id: "deck-1",
      },
    });
  });

  it("DELETE -> skips study session deletion when none are affected", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      id: "deck-1",
      user_id: "user-1",
      is_default: false,
    } as never);

    const tx = {
      studySessionCard: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      studySession: {
        deleteMany: vi.fn(),
      },
      card: {
        deleteMany: vi.fn(),
      },
      deck: {
        delete: vi.fn(),
      },
    };

    vi.mocked(db.$transaction).mockImplementation(async (cb: any) => cb(tx));

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
    });

    await DELETE(req, mockParams());

    expect(tx.studySession.deleteMany).not.toHaveBeenCalled();

    expect(tx.card.deleteMany).toHaveBeenCalled();

    expect(tx.deck.delete).toHaveBeenCalled();
  });
});
