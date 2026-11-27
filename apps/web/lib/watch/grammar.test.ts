import { describe, expect, it } from "vitest";
import { describeMorph, flagName, genderName, groupForms } from "./grammar";

describe("grammar helpers", () => {
  it("turns spaCy morphology into words, person and number first", () => {
    expect(describeMorph("Mood=Ind|Number=Plur|Person=1|Tense=Pres|VerbForm=Fin")).toBe(
      "1st person · plural · present · indicative",
    );
    expect(describeMorph("Case=Dat|Gender=Masc|Number=Sing")).toBe("singular · dative · masculine");
    expect(describeMorph("Foreign=Yes")).toBeNull();
    expect(describeMorph(null)).toBeNull();
  });

  it("names genders and flags", () => {
    expect(genderName("m")).toBe("masculine");
    expect(genderName("m, n")).toBe("masculine or neuter");
    expect(genderName(null)).toBeNull();
    expect(flagName("aux-sein")).toBe("perfect with sein");
    expect(flagName("strong")).toBe("strong");
  });

  it("groups forms by their tags, skipping table markers and repeats", () => {
    expect(
      groupForms([
        { form: "de-conj", pos: "verb", tags: ["table-tags"] },
        { form: "fange an", pos: "verb", tags: ["first-person", "singular", "present"] },
        { form: "fangen an", pos: "verb", tags: ["first-person", "plural", "present"] },
        { form: "fangen an", pos: "verb", tags: ["third-person", "plural", "present"] },
        { form: "angefangen", pos: "verb", tags: ["participle", "past"] },
        { form: "angefangen", pos: "verb", tags: ["participle", "past"] },
        { form: "anfang", pos: "verb", tags: [] },
      ]),
    ).toEqual([
      { label: "first person · singular · present", forms: ["fange an"] },
      { label: "first person · plural · present", forms: ["fangen an"] },
      { label: "third person · plural · present", forms: ["fangen an"] },
      { label: "participle · past", forms: ["angefangen"] },
      { label: "other", forms: ["anfang"] },
    ]);
  });
});
