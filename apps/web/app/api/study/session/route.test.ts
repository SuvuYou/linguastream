import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
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
      findFirst: vi.fn(),
    },
    studySession: {
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
    },
    studySessionCard: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockedDb = vi.mocked(db);

const tx = {
  studySession: {
    create: vi.fn(),
  },
  studySessionCard: {
    createMany: vi.fn(),
  },
};

beforeEach(() => {
  vi.clearAllMocks();

  mockedDb.$transaction.mockImplementation(async (cb: any) => cb(tx));

  mockedDb.studySession.deleteMany.mockResolvedValue({ count: 0 });
});

const validBody = {
  deckId: "550e8400-e29b-41d4-a716-446655440000",
  sourceLanguage: "de",
};

describe("POST /api/study-session", () => {
  it("POST -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });

  it("POST -> 400 for invalid body", async () => {
    mockGetCurrentUser.base();

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        deckId: "bad-id",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: "Invalid request",
    });
  });

  it("POST -> 404 if deck does not exist", async () => {
    mockGetCurrentUser.base();

    mockedDb.deck.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: "Deck not found",
    });
  });

  it("POST -> 404 if deck belongs to another user", async () => {
    mockGetCurrentUser.base();

    mockedDb.deck.findUnique.mockResolvedValue({
      id: validBody.deckId,
      name: "Deck",
      user_id: "someone-else",
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it("POST -> returns existing active session", async () => {
    mockGetCurrentUser.base();

    mockedDb.deck.findUnique.mockResolvedValue({
      id: validBody.deckId,
      name: "German",
      user_id: "id",
    });

    mockedDb.studySession.findFirst.mockResolvedValue({
      id: "session-1",
      total_cards: 12,
    });

    mockedDb.studySessionCard.count.mockResolvedValue(5);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      sessionId: "session-1",
      deckTitle: "German",
      totalDue: 12,
      reviewedCount: 5,
      nextReviewAt: null,
    });

    expect(mockedDb.card.findMany).not.toHaveBeenCalled();
    expect(mockedDb.$transaction).not.toHaveBeenCalled();
  });

  it("POST -> creates session with due cards", async () => {
    mockGetCurrentUser.base();

    mockedDb.deck.findUnique.mockResolvedValue({
      id: validBody.deckId,
      name: "German",
      user_id: "id",
    });

    mockedDb.studySession.findFirst.mockResolvedValue(null);

    mockedDb.card.findMany.mockResolvedValue([
      { id: "card-1" },
      { id: "card-2" },
    ]);

    tx.studySession.create.mockResolvedValue({
      id: "session-1",
      total_cards: 2,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      sessionId: "session-1",
      deckTitle: "German",
      totalDue: 2,
      reviewedCount: 0,
      nextReviewAt: null,
    });

    expect(tx.studySessionCard.createMany).toHaveBeenCalledWith({
      data: [
        {
          session_id: "session-1",
          card_id: "card-1",
          position: 0,
        },
        {
          session_id: "session-1",
          card_id: "card-2",
          position: 1,
        },
      ],
    });
  });

  it("POST -> creates empty session and returns next review date", async () => {
    mockGetCurrentUser.base();

    const nextReview = new Date("2030-01-01T12:00:00Z");

    mockedDb.deck.findUnique.mockResolvedValue({
      id: validBody.deckId,
      name: "German",
      user_id: "id",
    });

    mockedDb.studySession.findFirst.mockResolvedValue(null);

    mockedDb.card.findMany.mockResolvedValue([]);

    mockedDb.card.findFirst.mockResolvedValue({
      next_review: nextReview,
    });

    tx.studySession.create.mockResolvedValue({
      id: "session-2",
      total_cards: 0,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(body).toEqual({
      sessionId: "session-2",
      deckTitle: "German",
      totalDue: 0,
      reviewedCount: 0,
      nextReviewAt: nextReview.toJSON(),
    });

    expect(tx.studySessionCard.createMany).not.toHaveBeenCalled();
  });

  it("POST -> deletes expired sessions before continuing", async () => {
    mockGetCurrentUser.base();

    mockedDb.deck.findUnique.mockResolvedValue({
      id: validBody.deckId,
      name: "German",
      user_id: "id",
    });

    mockedDb.studySession.findFirst.mockResolvedValue(null);

    mockedDb.card.findMany.mockResolvedValue([]);

    mockedDb.card.findFirst.mockResolvedValue(null);

    tx.studySession.create.mockResolvedValue({
      id: "session-3",
      total_cards: 0,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    await POST(req);

    expect(mockedDb.studySession.deleteMany).toHaveBeenCalledWith({
      where: {
        expires_at: {
          lt: expect.any(Date),
        },
      },
    });
  });
});
