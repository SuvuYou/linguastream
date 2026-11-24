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
    studySession: {
      findUnique: vi.fn(),
    },
    studySessionCard: {
      findMany: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db);

function mockParams(sessionId = "session-1") {
  return {
    params: Promise.resolve({ sessionId }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/study-session/[sessionId]", () => {
  it("GET -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });

  it("GET -> 400 for invalid query parameters", async () => {
    mockGetCurrentUser.base();

    const req = new NextRequest("http://localhost?limit=0");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: "Invalid query parameters",
    });
  });

  it("GET -> 404 if session does not exist", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: "Session not found",
    });
  });

  it("GET -> 404 if session belongs to another user", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "someone-else",
      total_cards: 5,
      completed_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("GET -> returns empty result if session is completed", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "id",
      total_cards: 5,
      completed_at: new Date(),
      expires_at: new Date(Date.now() + 60_000),
    });

    const req = new NextRequest("http://localhost?cursor=10");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      cards: [],
      cursor: 10,
      nextCursor: null,
    });

    expect(mockedDb.studySessionCard.findMany).not.toHaveBeenCalled();
  });

  it("GET -> 410 if session is expired", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "id",
      total_cards: 5,
      completed_at: null,
      expires_at: new Date(Date.now() - 60_000),
    });

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(410);
    expect(body).toEqual({
      error: "Session expired",
    });
  });

  it("GET -> returns cards without cursor", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "id",
      total_cards: 5,
      completed_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });

    mockedDb.studySessionCard.findMany.mockResolvedValue([
      {
        position: 0,
        card: {
          id: "card-1",
          word: "Haus",
        },
      },
      {
        position: 1,
        card: {
          id: "card-2",
          word: "Baum",
        },
      },
    ]);

    const req = new NextRequest("http://localhost");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      cards: [
        {
          id: "card-1",
          word: "Haus",
        },
        {
          id: "card-2",
          word: "Baum",
        },
      ],
      cursor: null,
      nextCursor: null,
    });

    expect(mockedDb.studySessionCard.findMany).toHaveBeenCalledWith({
      where: {
        session_id: "session-1",
        reviewed: false,
      },
      orderBy: {
        position: "asc",
      },
      take: 20,
      include: {
        card: {
          include: {
            word_profile: {
              select: {
                part_of_speech: true,
              },
            },
          },
        },
      },
    });
  });

  it("GET -> applies cursor and limit", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "id",
      total_cards: 5,
      completed_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });

    mockedDb.studySessionCard.findMany.mockResolvedValue([
      {
        position: 6,
        card: { id: "1" },
      },
      {
        position: 7,
        card: { id: "2" },
      },
    ]);

    const req = new NextRequest("http://localhost?cursor=5&limit=2");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(mockedDb.studySessionCard.findMany).toHaveBeenCalledWith({
      where: {
        session_id: "session-1",
        reviewed: false,
        position: {
          gt: 5,
        },
      },
      orderBy: {
        position: "asc",
      },
      take: 2,
      include: {
        card: {
          include: {
            word_profile: {
              select: {
                part_of_speech: true,
              },
            },
          },
        },
      },
    });

    expect(body).toEqual({
      cards: [{ id: "1" }, { id: "2" }],
      cursor: 5,
      nextCursor: 7,
    });
  });

  it("GET -> returns null nextCursor when fewer than limit cards remain", async () => {
    mockGetCurrentUser.base();

    mockedDb.studySession.findUnique.mockResolvedValue({
      id: "session-1",
      user_id: "id",
      total_cards: 5,
      completed_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });

    mockedDb.studySessionCard.findMany.mockResolvedValue([
      {
        position: 3,
        card: {
          id: "card-3",
        },
      },
    ]);

    const req = new NextRequest("http://localhost?limit=5");

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(body).toEqual({
      cards: [
        {
          id: "card-3",
        },
      ],
      cursor: null,
      nextCursor: null,
    });
  });
});
