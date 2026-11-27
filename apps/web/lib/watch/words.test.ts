import { describe, expect, it } from "vitest";
import { isWorthLearning, nextStatus, splitToken, statusOf } from "./words";

describe("word helpers", () => {
  it("cycles unknown → learning → known → ignored → unknown", () => {
    expect(nextStatus("unknown")).toBe("learning");
    expect(nextStatus("learning")).toBe("known");
    expect(nextStatus("known")).toBe("ignored");
    expect(nextStatus("ignored")).toBe("unknown");
  });

  it("treats a word without a row as unknown, and no lemma or no data as nothing", () => {
    const statuses = new Map([["Hafen", "learning" as const]]);
    expect(statusOf(statuses, "Hafen")).toBe("learning");
    expect(statusOf(statuses, "Markt")).toBe("unknown");
    expect(statusOf(statuses, null)).toBeNull();
    expect(statusOf(undefined, "Hafen")).toBeNull();
  });

  it("calls a common word worth learning until it's known or ignored", () => {
    expect(isWorthLearning(1240, "unknown")).toBe(true);
    expect(isWorthLearning(1240, "learning")).toBe(true);
    expect(isWorthLearning(1240, "known")).toBe(false);
    expect(isWorthLearning(40000, "unknown")).toBe(false);
    expect(isWorthLearning(null, "unknown")).toBe(false);
  });

  it("keeps punctuation outside the word", () => {
    expect(splitToken("Hamburg!")).toEqual({ before: "", core: "Hamburg", after: "!" });
    expect(splitToken("„Morgen,“")).toEqual({ before: "„", core: "Morgen", after: ",“" });
    expect(splitToken("Café")).toEqual({ before: "", core: "Café", after: "" });
    expect(splitToken("–")).toEqual({ before: "", core: "–", after: "" });
  });
});
