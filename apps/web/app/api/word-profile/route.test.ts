import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/lib/initializations/db";
import { generateGeminiText } from "@/lib/gemini/caller";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    wordProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/gemini/caller", () => ({
  generateGeminiText: vi.fn(),
}));

global.fetch = vi.fn();

const mockDb = vi.mocked(db);
const mockGemini = vi.mocked(generateGeminiText);
const mockFetch = vi.mocked(fetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function req(query = "") {
  return new NextRequest(`http://localhost/api/word-profile${query}`);
}

describe("GET /api/word-profile", () => {
  it("returns 401 if unauthorized", async () => {
    mockGetCurrentUser.empty();

    const res = await GET(req());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      error: "Unauthorized",
    });
  });

  it("returns 400 if word is missing", async () => {
    mockGetCurrentUser.base();

    const res = await GET(req("?lang=de"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: "Missing word or lang",
    });
  });

  it("returns cached profile if it exists", async () => {
    mockGetCurrentUser.base();

    mockDb.wordProfile.findUnique.mockResolvedValue({
      id: "profile-id",
      word: "Haus",
      source_language: "de",
      part_of_speech: "noun",
      forms: {},
      lexical_family: [],
      collocations: [],
    });

    const res = await GET(req("?word=Haus&lang=de"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe("profile-id");

    expect(mockGemini).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("creates profile using Wiktionary + Gemini", async () => {
    mockGetCurrentUser.base();

    mockDb.wordProfile.findUnique.mockResolvedValue(null);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        de: [
          {
            partOfSpeech: "noun",
            inflections: [
              {
                label: "plural",
                values: ["Häuser"],
              },
            ],
          },
        ],
      }),
    } as Response);

    mockGemini.mockResolvedValue(
      JSON.stringify({
        part_of_speech: null,
        forms: null,
        lexical_family: ["Wohnung"],
        collocations: ["Haus bauen"],
      }),
    );

    mockDb.wordProfile.create.mockResolvedValue({
      id: "created",
    });

    const res = await GET(req("?word=Haus&lang=de"));
    const body = await res.json();

    expect(res.status).toBe(200);

    expect(mockDb.wordProfile.create).toHaveBeenCalledWith({
      data: {
        word: "Haus",
        source_language: "de",
        part_of_speech: "noun",
        forms: {
          plural: "Häuser",
        },
        lexical_family: ["Wohnung"],
        collocations: ["Haus bauen"],
      },
    });

    expect(body).toEqual({
      id: "created",
    });
  });

  it("falls back to Gemini when Wiktionary returns nothing", async () => {
    mockGetCurrentUser.base();

    mockDb.wordProfile.findUnique.mockResolvedValue(null);

    mockFetch.mockResolvedValue({
      ok: false,
    } as Response);

    mockGemini.mockResolvedValue(
      JSON.stringify({
        part_of_speech: "verb",
        forms: {
          past: "ging",
        },
        lexical_family: ["gehen"],
        collocations: ["nach Hause gehen"],
      }),
    );

    mockDb.wordProfile.create.mockResolvedValue({
      id: "profile-id",
    });

    const res = await GET(req("?word=gehen&lang=de"));

    expect(res.status).toBe(200);

    expect(mockDb.wordProfile.create).toHaveBeenCalledWith({
      data: {
        word: "gehen",
        source_language: "de",
        part_of_speech: "verb",
        forms: {
          past: "ging",
        },
        lexical_family: ["gehen"],
        collocations: ["nach Hause gehen"],
      },
    });
  });

  it("uses 'unknown' when no POS is available", async () => {
    mockGetCurrentUser.base();

    mockDb.wordProfile.findUnique.mockResolvedValue(null);

    mockFetch.mockResolvedValue({
      ok: false,
    } as Response);

    mockGemini.mockResolvedValue(
      JSON.stringify({
        part_of_speech: null,
        forms: null,
        lexical_family: [],
        collocations: [],
      }),
    );

    mockDb.wordProfile.create.mockResolvedValue({
      id: "profile-id",
    });

    await GET(req("?word=test&lang=en"));

    expect(mockDb.wordProfile.create).toHaveBeenCalledWith({
      data: {
        word: "test",
        source_language: "en",
        part_of_speech: "unknown",
        forms: {},
        lexical_family: [],
        collocations: [],
      },
    });
  });

  it("returns 500 if Gemini fails", async () => {
    mockGetCurrentUser.base();

    mockDb.wordProfile.findUnique.mockResolvedValue(null);

    mockFetch.mockResolvedValue({
      ok: false,
    } as Response);

    mockGemini.mockRejectedValue(new Error("Gemini failed"));

    const res = await GET(req("?word=Haus&lang=de"));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({
      error: "Failed to generate word profile",
      details: "Gemini failed",
    });
  });

  it("continues if Wiktionary throws", async () => {
    mockGetCurrentUser.base();

    mockDb.wordProfile.findUnique.mockResolvedValue(null);

    mockFetch.mockRejectedValue(new Error("network"));

    mockGemini.mockResolvedValue(
      JSON.stringify({
        part_of_speech: "noun",
        forms: {},
        lexical_family: [],
        collocations: [],
      }),
    );

    mockDb.wordProfile.create.mockResolvedValue({
      id: "profile-id",
    });

    const res = await GET(req("?word=Haus&lang=de"));

    expect(res.status).toBe(200);
    expect(mockGemini).toHaveBeenCalled();
  });
});
