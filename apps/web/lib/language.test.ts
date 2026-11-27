import { describe, expect, it } from "vitest";
import { languageName } from "./language";

describe("languageName", () => {
  it("names a language code in English and keeps what it can't name", () => {
    expect(languageName("uk")).toBe("Ukrainian");
    expect(languageName("not a tag")).toBe("not a tag");
  });
});
