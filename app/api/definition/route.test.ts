import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import { generateGeminiText } from "@/lib/gemini/caller";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/gemini/caller", () => ({
  generateGeminiText: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/word-profile", () => {
  it("GET -> 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("GET -> 400 if word is missing", async () => {
    mockGetCurrentUser.base();

    const req = new NextRequest("http://localhost?lang=de");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: "Missing word or lang",
    });
  });

  it("GET -> 400 if lang is missing", async () => {
    mockGetCurrentUser.base();

    const req = new NextRequest("http://localhost?word=Haus");

    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("GET -> generates definition without context", async () => {
    mockGetCurrentUser.base();

    vi.mocked(generateGeminiText).mockResolvedValue(
      JSON.stringify({
        definition: "a building for people to live in",
        translation: "house",
      }),
    );

    const req = new NextRequest("http://localhost?word=Haus&lang=German");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(body).toEqual({
      definition: "a building for people to live in",
      translation: "house",
    });

    expect(generateGeminiText).toHaveBeenCalledWith(
      expect.stringContaining('Given the German word "Haus"'),
      {
        responseMimeType: "application/json",
      },
    );

    expect(generateGeminiText).toHaveBeenCalledWith(
      expect.not.stringContaining("as used in this sentence"),
      expect.any(Object),
    );
  });

  it("GET -> includes context in prompt", async () => {
    mockGetCurrentUser.base();

    vi.mocked(generateGeminiText).mockResolvedValue(
      JSON.stringify({
        definition: "home",
        translation: "house",
      }),
    );

    const req = new NextRequest(
      "http://localhost?word=Haus&lang=German&context=Das%20Haus%20ist%20gro%C3%9F",
    );

    await GET(req);

    expect(generateGeminiText).toHaveBeenCalledWith(
      expect.stringContaining('as used in this sentence: "Das Haus ist groß"'),
      {
        responseMimeType: "application/json",
      },
    );
  });

  it("GET -> returns parsed Gemini response", async () => {
    mockGetCurrentUser.base();

    vi.mocked(generateGeminiText).mockResolvedValue(
      JSON.stringify({
        definition: "to consume food",
        translation: "eat",
      }),
    );

    const req = new NextRequest("http://localhost?word=essen&lang=German");

    const res = await GET(req);
    const body = await res.json();

    expect(body).toEqual({
      definition: "to consume food",
      translation: "eat",
    });
  });

  it("GET -> returns 500 if Gemini throws", async () => {
    mockGetCurrentUser.base();

    vi.mocked(generateGeminiText).mockRejectedValue(
      new Error("API unavailable"),
    );

    const req = new NextRequest("http://localhost?word=Haus&lang=German");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({
      error: "Failed to generate definition",
      details: "API unavailable",
    });
  });

  it("GET -> returns 500 if Gemini returns invalid JSON", async () => {
    mockGetCurrentUser.base();

    vi.mocked(generateGeminiText).mockResolvedValue("this is not json");

    const req = new NextRequest("http://localhost?word=Haus&lang=German");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to generate definition");
    expect(body.details).toContain("JSON");
  });
});
