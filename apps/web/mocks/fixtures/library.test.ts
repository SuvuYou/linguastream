import { LibraryPage } from "@linguastream/contracts";
import { describe, expect, it } from "vitest";
import { libraryPage, mockLibrary } from "./library";

describe("mock library", () => {
  it("holds valid videos with unique ids, newest first", () => {
    const page = libraryPage(0);
    expect(LibraryPage.safeParse(page).success).toBe(true);
    expect(new Set(mockLibrary.map((v) => v.id)).size).toBe(mockLibrary.length);
    const times = mockLibrary.map((v) => Date.parse(v.added_at));
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("pages by 24 and searches title and channel", () => {
    expect(libraryPage(0).items).toHaveLength(24);
    expect(libraryPage(1).items).toHaveLength(mockLibrary.length - 24);
    expect(libraryPage(0, "brezeln").items.every((v) => v.title.includes("Brezeln"))).toBe(true);
    expect(libraryPage(0, "LENA").total).toBeGreaterThan(0);
    expect(libraryPage(0, "zzz").total).toBe(0);
  });
});
