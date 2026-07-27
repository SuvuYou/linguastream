import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, DELETE } from "./route";
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
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    studySessionCard: {
      findMany: vi.fn(),
    },
    studySession: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const validBody = {
  deck_id: "550e8400-e29b-41d4-a716-446655440000",
  media_content_id: "550e8400-e29b-41d4-a716-446655440001",
  source_language: "en",
  translation_language: "de",
  word: "hello",
  word_translation: "hallo",
  context_text: "hello world",
  context_translation: "hallo welt",
  contextual_definition: "greeting",
  start_ms: 0,
  end_ms: 1000,
  word_profile_id: "550e8400-e29b-41d4-a716-446655440002",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/cards", () => {
  it("POST -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("POST -> 400 if body is invalid", async () => {
    mockGetCurrentUser.base();

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("POST -> 404 if deck does not exist", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({ error: "Deck not found" });
  });

  it("POST -> 404 if deck belongs to another user", async () => {
    mockGetCurrentUser.override({ id: "user-1" });

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      user_id: "user-2",
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it("POST -> 409 if card already exists", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      user_id: "id",
    });

    vi.mocked(db.card.findFirst).mockResolvedValue({
      id: "existing-card",
    } as never);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body).toEqual({
      error: "Word already in this deck",
    });
  });

  it("POST -> creates card", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      user_id: "id",
    });

    vi.mocked(db.card.findFirst).mockResolvedValue(null);

    vi.mocked(db.card.create).mockResolvedValue({
      id: "card-id",
    } as never);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ id: "card-id" });

    expect(db.card.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user_id: "id",
        deck_id: validBody.deck_id,
        media_content_id: validBody.media_content_id,
        source_language: validBody.source_language,
        translation_language: validBody.translation_language,
        word: validBody.word,
        word_translation: validBody.word_translation,
        context_text: validBody.context_text,
        context_translation: validBody.context_translation,
        contextual_definition: validBody.contextual_definition,
        start_ms: validBody.start_ms,
        end_ms: validBody.end_ms,
        word_profile_id: validBody.word_profile_id,
        next_review: expect.any(Date),
      }),
    });
  });
});

describe("DELETE /api/cards", () => {
  it("DELETE -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({ cardIds: [] }),
    });

    const res = await DELETE(req);

    expect(res.status).toBe(401);
  });

  it("DELETE -> 400 if body is invalid", async () => {
    mockGetCurrentUser.base();

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({ cardIds: [] }),
    });

    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  it("DELETE -> 404 if no owned cards found", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.card.findMany).mockResolvedValue([]);

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({
        cardIds: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: "No matching cards found",
    });
  });

  it("DELETE -> deletes cards and affected study sessions", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.card.findMany).mockResolvedValue([
      { id: "card-1" },
      { id: "card-2" },
    ]);

    vi.mocked(db.$transaction).mockImplementation(async (cb: any) =>
      cb({
        studySessionCard: {
          findMany: vi
            .fn()
            .mockResolvedValue([
              { session_id: "session-1" },
              { session_id: "session-2" },
            ]),
        },
        studySession: {
          deleteMany: vi.fn(),
        },
        card: {
          deleteMany: vi.fn(),
        },
      }),
    );

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({
        cardIds: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      deletedCount: 2,
    });

    expect(db.$transaction).toHaveBeenCalledTimes(1);
  });

  it("DELETE -> deletes cards when no study sessions are affected", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.card.findMany).mockResolvedValue([{ id: "card-1" }]);

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
    };

    vi.mocked(db.$transaction).mockImplementation(async (cb: any) => cb(tx));

    const req = new NextRequest("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({
        cardIds: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    });

    await DELETE(req);

    expect(tx.studySession.deleteMany).not.toHaveBeenCalled();
    expect(tx.card.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["card-1"] } },
    });
  });
});
