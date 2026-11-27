import { db } from "@linguastream/db";
import { VocabularyRepository } from "./vocabulary.repository";

const repo = new VocabularyRepository();

let n = 0;
async function user() {
  n++;
  return db.user.create({
    data: { firebaseUid: `uid-${n}`, email: `learner-${n}@example.com`, nativeLanguage: "uk", learningLanguage: "de" },
  });
}

describe("VocabularyRepository (Postgres)", () => {
  it("sets, changes and reads a status per user, language and case-sensitive lemma", async () => {
    const a = await user();
    const b = await user();
    expect(await repo.status(a.id, "de", "Hund")).toBe("unknown");

    await repo.setStatus(a.id, { language: "de", lemma: "Hund", status: "learning" });
    await repo.setStatus(a.id, { language: "de", lemma: "Hund", status: "known" });
    await repo.setStatus(a.id, { language: "de", lemma: "essen", status: "ignored" });
    await repo.setStatus(b.id, { language: "de", lemma: "Hund", status: "learning" });

    expect(await repo.status(a.id, "de", "Hund")).toBe("known");
    expect(await repo.status(a.id, "de", "hund")).toBe("unknown");
    expect(await repo.statuses(a.id, "de", ["Hund", "essen", "Katze"])).toEqual(
      new Map([
        ["Hund", "known"],
        ["essen", "ignored"],
      ]),
    );
    expect(await repo.statuses(b.id, "de", ["Hund"])).toEqual(new Map([["Hund", "learning"]]));
    expect(await repo.statuses(a.id, "de", [])).toEqual(new Map());
    expect(await db.vocabularyWord.count({ where: { userId: a.id } })).toBe(2);
  });

  it("keeps a saved word's row when it goes back to unknown, marked as a manual change", async () => {
    const a = await user();
    await db.vocabularyWord.create({
      data: { userId: a.id, language: "de", lemma: "Hund", status: "learning", statusSource: "save", savedAt: new Date() },
    });
    await repo.setStatus(a.id, { language: "de", lemma: "Hund", status: "unknown" });
    const row = await db.vocabularyWord.findFirstOrThrow({ where: { userId: a.id } });
    expect([row.status, row.statusSource, row.savedAt !== null]).toEqual(["unknown", "manual", true]);
  });
});
