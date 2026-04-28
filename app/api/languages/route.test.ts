import { describe, beforeEach, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import { GET } from "./route";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableTranslationLanguages,
} from "@/lib/db-helpers/languages";
import type { User } from "@prisma/client";

vi.mock("@/lib/initializations/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db-helpers/languages", () => ({
  fetchAvailableSourceLanguages: vi.fn(),
  fetchAvailableTranslationLanguages: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

const mockedFetchSource = vi.mocked(fetchAvailableSourceLanguages);
const mockedFetchTranslationLanguages = vi.mocked(
  fetchAvailableTranslationLanguages,
);

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

describe("GET api/languages", () => {
  it("returns 401 if user is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });

    expect(mockedFetchSource).not.toHaveBeenCalled();
    expect(mockedFetchTranslationLanguages).not.toHaveBeenCalled();
  });

  it("returns available languages when authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "id" } as User);

    mockedFetchSource.mockResolvedValue(["en", "de"]);
    mockedFetchTranslationLanguages.mockResolvedValue(["es", "fr"]);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      availableSourceLanguages: ["en", "de"],
      availableTranslationLanguages: ["es", "fr"],
    });

    expect(mockedFetchSource).toHaveBeenCalled();
    expect(mockedFetchTranslationLanguages).toHaveBeenCalled();
  });

  it("returns 500 if something throws", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "123" } as User);

    mockedFetchSource.mockRejectedValue(new Error("DB fail"));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: "Internal error" });
  });
});
