import { describe, expect, it } from "vitest";
import { getWordDefinitionRoute } from "./definition.js";

const query = getWordDefinitionRoute.query!;

describe("getWordDefinitionRoute", () => {
  it("is GET /api/definition", () => {
    expect(getWordDefinitionRoute.method).toBe("GET");
    expect(getWordDefinitionRoute.path).toBe("/api/definition");
  });

  it("accepts a word in its sentence", () => {
    expect(query.safeParse({ word: "Haus", lang: "de", context: "Das Haus ist groß." }).success).toBe(true);
  });

  it("rejects empty or over-long input", () => {
    expect(query.safeParse({ word: "", lang: "de", context: "x" }).success).toBe(false);
    expect(query.safeParse({ word: "Haus", lang: "de", context: "x".repeat(1001) }).success).toBe(false);
    expect(query.safeParse({ word: "x".repeat(101), lang: "de", context: "x" }).success).toBe(false);
  });
});
