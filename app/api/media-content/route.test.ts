import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { db } from "@/lib/initializations/db";
import type { MediaContent, User } from "@prisma/client";

vi.mock("@/lib/initializations/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

beforeEach(() => vi.resetAllMocks());

const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedDb = vi.mocked(db, true);

describe("POST api/media-content", () => {
  it("returns 400 on invalid input", async () => {
    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({ title: 123 }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Invalid input" });
  });

  it("returns 401 if user is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        title: "A",
        jellyfin_id: "1",
        source_language: "en",
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 409 if already in library with real language", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "u1" } as User);

    mockedDb.mediaContent.findFirst.mockResolvedValue({
      id: "1",
      jellyfin_id: "123",
      source_language: "en",
    } as MediaContent);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        title: "Movie",
        jellyfin_id: "123",
        source_language: "en",
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(409);
  });

  it("updates existing item if language was unknown", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "u1" } as User);

    mockedDb.mediaContent.findFirst.mockResolvedValue({
      id: "1",
      jellyfin_id: "123",
      source_language: "unknown",
    } as MediaContent);

    mockedDb.mediaContent.update.mockResolvedValue({
      id: "1",
      title: "Updated",
    } as MediaContent);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        title: "Updated",
        jellyfin_id: "123",
        source_language: "en",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(mockedDb.mediaContent.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        source_language: "en",
        title: "Updated",
        user_id: "u1",
      },
    });

    expect(json.title).toBe("Updated");
  });

  it("creates new content if not existing", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "u1" } as User);

    mockedDb.mediaContent.findFirst.mockResolvedValue(null);

    mockedDb.mediaContent.create.mockResolvedValue({
      id: "2",
      title: "New",
    } as MediaContent);

    const req = new NextRequest("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        title: "New",
        jellyfin_id: "999",
        source_language: "en",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(mockedDb.mediaContent.create).toHaveBeenCalled();

    expect(json.title).toBe("New");
  });
});
