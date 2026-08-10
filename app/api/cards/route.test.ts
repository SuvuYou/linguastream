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

const validPostBody = {
  deck_id: "550e8400-e29b-41d4-a716-446655440000",
  media_content_id: "550e8400-e29b-41d4-a716-446655440001",
  source_language: "de",
  translation_language: "en",
  word: "Haus",
  lemma: "Haus",
  word_translation: "house",
  context_text: "Das Haus ist groß.",
  context_translation: "The house is big.",
  contextual_definition: "A building used as a home.",
  start_ms: 1000,
  end_ms: 2000,
};

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/cards", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function deleteRequest(body: unknown) {
  return new NextRequest("http://localhost/api/cards", {
    method: "DELETE",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(db.$transaction).mockImplementation(async (callback) => {
    return callback(db as never);
  });
});

describe("POST /api/cards", () => {
  it("POST -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = postRequest(validPostBody);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });

    expect(db.deck.findUnique).not.toHaveBeenCalled();
    expect(db.card.create).not.toHaveBeenCalled();
  });

  it("POST -> 400 if request body is invalid", async () => {
    mockGetCurrentUser.base();

    const req = postRequest({
      ...validPostBody,
      word: "",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);

    expect(body.error).toBe("Invalid request");
    expect(body.details).toBeDefined();

    expect(db.deck.findUnique).not.toHaveBeenCalled();
    expect(db.card.findFirst).not.toHaveBeenCalled();
    expect(db.card.create).not.toHaveBeenCalled();
  });

  it("POST -> 400 if required UUID is invalid", async () => {
    mockGetCurrentUser.base();

    const req = postRequest({
      ...validPostBody,
      deck_id: "not-a-uuid",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid request");

    expect(db.deck.findUnique).not.toHaveBeenCalled();
  });

  it("POST -> 404 if deck does not exist", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findUnique).mockResolvedValue(null);

    const req = postRequest(validPostBody);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: "Deck not found",
    });

    expect(db.deck.findUnique).toHaveBeenCalledWith({
      where: {
        id: validPostBody.deck_id,
      },
      select: {
        user_id: true,
      },
    });

    expect(db.card.findFirst).not.toHaveBeenCalled();
    expect(db.card.create).not.toHaveBeenCalled();
  });

  it("POST -> 404 if deck belongs to another user", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      user_id: "another-user",
    });

    const req = postRequest(validPostBody);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: "Deck not found",
    });

    expect(db.card.findFirst).not.toHaveBeenCalled();
    expect(db.card.create).not.toHaveBeenCalled();
  });

  it("POST -> 409 if word already exists in deck", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.deck.findUnique).mockResolvedValue({
      user_id: "id",
    });

    vi.mocked(db.card.findFirst).mockResolvedValue({
      id: "existing-card",
    } as never);

    const req = postRequest(validPostBody);

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body).toEqual({
      error: "Word already in this deck",
    });

    expect(db.card.findFirst).toHaveBeenCalledWith({
      where: {
        user_id: "id",
        deck_id: validPostBody.deck_id,
        word: validPostBody.word,
        source_language: validPostBody.source_language,
      },
    });

    expect(db.card.create).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/cards", () => {
  it("DELETE -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = deleteRequest({
      cardIds: ["550e8400-e29b-41d4-a716-446655440000"],
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });

    expect(db.card.findMany).not.toHaveBeenCalled();
  });

  it("DELETE -> 400 if request body is invalid", async () => {
    mockGetCurrentUser.base();

    const req = deleteRequest({
      cardIds: [],
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: "Invalid request",
    });

    expect(db.card.findMany).not.toHaveBeenCalled();
  });

  it("DELETE -> 400 if card id is not a UUID", async () => {
    mockGetCurrentUser.base();

    const req = deleteRequest({
      cardIds: ["not-a-uuid"],
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: "Invalid request",
    });

    expect(db.card.findMany).not.toHaveBeenCalled();
  });

  it("DELETE -> 404 if no matching owned cards exist", async () => {
    mockGetCurrentUser.base();

    vi.mocked(db.card.findMany).mockResolvedValue([]);

    const cardIds = [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ];

    const req = deleteRequest({ cardIds });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: "No matching cards found",
    });

    expect(db.card.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: cardIds,
        },
        user_id: "id",
      },
      select: {
        id: true,
      },
    });

    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("DELETE -> deletes owned cards", async () => {
    mockGetCurrentUser.base();

    const cardIds = [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ];

    vi.mocked(db.card.findMany).mockResolvedValue([
      { id: cardIds[0] },
      { id: cardIds[1] },
    ]);

    vi.mocked(db.studySessionCard.findMany).mockResolvedValue([]);

    const req = deleteRequest({ cardIds });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      deletedCount: 2,
    });

    expect(db.studySessionCard.findMany).toHaveBeenCalledWith({
      where: {
        card_id: {
          in: cardIds,
        },
      },
      select: {
        session_id: true,
      },
      distinct: ["session_id"],
    });

    expect(db.studySession.deleteMany).not.toHaveBeenCalled();

    expect(db.card.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: cardIds,
        },
      },
    });
  });

  it("DELETE -> deletes affected study sessions before deleting cards", async () => {
    mockGetCurrentUser.base();

    const cardIds = [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ];

    vi.mocked(db.card.findMany).mockResolvedValue([
      { id: cardIds[0] },
      { id: cardIds[1] },
    ]);

    vi.mocked(db.studySessionCard.findMany).mockResolvedValue([
      { session_id: "session-1" },
      { session_id: "session-2" },
    ]);

    const req = deleteRequest({ cardIds });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      deletedCount: 2,
    });

    expect(db.studySession.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["session-1", "session-2"],
        },
      },
    });

    expect(db.card.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: cardIds,
        },
      },
    });

    expect(db.studySession.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      db.card.deleteMany.mock.invocationCallOrder[0],
    );
  });

  it("DELETE -> only deletes cards owned by the current user", async () => {
    mockGetCurrentUser.base();

    const requestedIds = [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ];

    const ownedId = requestedIds[0];

    vi.mocked(db.card.findMany).mockResolvedValue([{ id: ownedId }]);

    vi.mocked(db.studySessionCard.findMany).mockResolvedValue([]);

    const req = deleteRequest({
      cardIds: requestedIds,
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      deletedCount: 1,
    });

    expect(db.card.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [ownedId],
        },
      },
    });
  });

  it("DELETE -> handles duplicate session references only once", async () => {
    mockGetCurrentUser.base();

    const cardId = "550e8400-e29b-41d4-a716-446655440000";

    vi.mocked(db.card.findMany).mockResolvedValue([{ id: cardId }]);

    vi.mocked(db.studySessionCard.findMany).mockResolvedValue([
      { session_id: "session-1" },
      { session_id: "session-1" },
      { session_id: "session-2" },
    ]);

    const req = deleteRequest({
      cardIds: [cardId],
    });

    await DELETE(req);

    expect(db.studySession.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["session-1", "session-1", "session-2"],
        },
      },
    });
  });
});
