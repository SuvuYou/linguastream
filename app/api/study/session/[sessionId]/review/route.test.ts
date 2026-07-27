import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { db } from "@/lib/initializations/db";
import { calculateNextReview } from "@/lib/algorithms/sm2";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/algorithms/sm2", () => ({
  calculateNextReview: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    studySession: {
      findUnique: vi.fn(),
    },
    studySessionCard: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockedDb = vi.mocked(db);
const mockedCalculateNextReview = vi.mocked(calculateNextReview);

const tx = {
  studySessionCard: {
    updateMany: vi.fn(),
  },
  card: {
    update: vi.fn(),
  },
  studySession: {
    update: vi.fn(),
  },
};

function mockParams(sessionId = "550e8400-e29b-41d4-a716-446655440000") {
  return {
    params: Promise.resolve({ sessionId }),
  };
}

const validBody = {
  cardId: "550e8400-e29b-41d4-a716-446655440001",
  rating: 2,
};

beforeEach(() => {
  vi.clearAllMocks();

  mockedDb.$transaction.mockImplementation(async (cb: any) => cb(tx));

  mockedCalculateNextReview.mockReturnValue({
    repetitions: 2,
    interval_days: 6,
    ease_factor: 2.6,
    next_review: new Date("2030-01-01"),
  });
});

describe("POST /api/study-session/[sessionId]/review", () => {
  it("POST -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: "Unauthorized",
    });
  });

  it("POST -> 400 for invalid body", async () => {
    mockGetCurrentUser.base();

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        cardId: "bad-id",
      }),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Invalid request",
    });
  });

  it("POST -> 404 if session not found", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "Session not found",
    });
  });

  it("POST -> 404 if session belongs to another user", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "someone-else",
      completed_at: null,
      expires_at: new Date(Date.now() + 60000),
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("POST -> 404 if session completed", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: new Date(),
      expires_at: new Date(Date.now() + 60000),
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("POST -> 404 if session expired", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: null,
      expires_at: new Date(Date.now() - 60000),
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("POST -> 404 if card not found", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: null,
      expires_at: new Date(Date.now() + 60000),
    });

    mockedDb.studySessionCard.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "Card not found",
    });
  });

  it("POST -> 404 if card belongs to another user", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: null,
      expires_at: new Date(Date.now() + 60000),
    });

    mockedDb.studySessionCard.findUnique.mockResolvedValue({
      reviewed: false,
      card: {
        user_id: "someone-else",
      },
    });

    const res = await POST(
      new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
      mockParams(),
    );

    expect(res.status).toBe(404);
  });

  it("POST -> 409 if card already reviewed", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: null,
      expires_at: new Date(Date.now() + 60000),
    });

    mockedDb.studySessionCard.findUnique.mockResolvedValue({
      reviewed: true,
      card: {
        user_id: "id",
      },
    });

    const res = await POST(
      new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
      mockParams(),
    );

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: "Card already reviewed",
    });
  });

  it("POST -> reviews card", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: null,
      expires_at: new Date(Date.now() + 60000),
    });

    mockedDb.studySessionCard.findUnique.mockResolvedValue({
      reviewed: false,
      card: {
        id: validBody.cardId,
        user_id: "id",
        repetitions: 1,
        interval_days: 1,
        ease_factor: 2.5,
      },
    });

    tx.studySessionCard.updateMany.mockResolvedValue({
      count: 1,
    });

    tx.studySession.update.mockResolvedValueOnce({
      id: "session-1",
      reviewed_cards: 3,
      total_cards: 5,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());
    const body = await res.json();

    expect(mockedCalculateNextReview).toHaveBeenCalledWith(
      expect.objectContaining({
        id: validBody.cardId,
      }),
      2,
    );

    expect(tx.card.update).toHaveBeenCalledWith({
      where: {
        id: validBody.cardId,
      },
      data: mockedCalculateNextReview.mock.results[0].value,
    });

    expect(body).toEqual({
      reviewedCount: 3,
      totalDue: 5,
      progress: 3 / 5,
      completed: false,
    });
  });

  it("POST -> completes session after last review", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: null,
      expires_at: new Date(Date.now() + 60000),
    });

    mockedDb.studySessionCard.findUnique.mockResolvedValue({
      reviewed: false,
      card: {
        id: validBody.cardId,
        user_id: "id",
        repetitions: 1,
        interval_days: 1,
        ease_factor: 2.5,
      },
    });

    tx.studySessionCard.updateMany.mockResolvedValue({
      count: 1,
    });

    tx.studySession.update
      .mockResolvedValueOnce({
        id: "session-1",
        reviewed_cards: 5,
        total_cards: 5,
      })
      .mockResolvedValueOnce({});

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(200);

    expect(tx.studySession.update).toHaveBeenNthCalledWith(2, {
      where: {
        id: "session-1",
      },
      data: {
        completed_at: expect.any(Date),
      },
    });
  });

  it("POST -> returns 409 when transaction detects already reviewed", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      user_id: "id",
      completed_at: null,
      expires_at: new Date(Date.now() + 60000),
    });

    mockedDb.studySessionCard.findUnique.mockResolvedValue({
      reviewed: false,
      card: {
        id: validBody.cardId,
        user_id: "id",
        repetitions: 1,
        interval_days: 1,
        ease_factor: 2.5,
      },
    });

    tx.studySessionCard.updateMany.mockResolvedValue({
      count: 0,
    });

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req, mockParams());

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: "Card already reviewed",
    });
  });
});
