import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { Client } from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/client.js";
import { importDictionary } from "../src/dictionary/import.js";
import { kaikkiLines } from "./helpers/kaikki.js";

describe("importDictionary (Postgres)", () => {
  let client: Client;
  const dir = mkdtempSync(path.join(tmpdir(), "dict-"));
  const dictionary = path.join(dir, "kaikki.jsonl.gz");
  const frequencies = path.join(dir, "de_50k.txt");
  writeFileSync(dictionary, gzipSync(kaikkiLines.join("\n") + "\n"));
  writeFileSync(frequencies, ["hunde 30", "hund 10", "geht 50", "aber 100", "fängt 5", "garbage", "angefangen 6"].join("\n"));

  beforeEach(async () => {
    client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
  });

  afterEach(async () => {
    await client.end();
  });

  it("loads entries, forms with lowercase keys, and ranked lemma frequencies", async () => {
    const logs: string[] = [];
    const stats = await importDictionary(client, { dictionary, frequencies, log: (m) => logs.push(m) });

    expect(stats).toMatchObject({ lines: 6, entries: 4, frequencies: 6 });
    const entries = (await db.dictionaryEntry.findMany()).sort((a, b) => a.wordLower.localeCompare(b.wordLower));
    expect(entries.map((e) => [e.word, e.wordLower, e.pos, e.senseCount])).toEqual([
      ["aber", "aber", "conj", 1],
      ["anfangen", "anfangen", "verb", 2],
      ["gehen", "gehen", "verb", 1],
      ["Hund", "hund", "noun", 2],
    ]);
    expect(entries.find((e) => e.word === "anfangen")!.flags).toEqual(["reflexive", "separable"]);

    const hunde = (await db.dictionaryForm.findMany({ where: { formLower: "hunde" } })).sort(
      (a, b) => a.lemma.localeCompare(b.lemma) || a.tags.length - b.tags.length,
    );
    expect(hunde.map((f) => [f.lemma, f.tags])).toEqual([
      ["Hund", ["form-of"]],
      ["Hund", ["nominative", "plural"]],
      ["Hunde", []],
    ]);

    const ranks = await db.lemmaFrequency.findMany({ orderBy: { rank: "asc" } });
    expect(ranks.map((r) => [r.word, Number(r.count), r.rank])).toEqual([
      ["aber", 100, 1],
      ["gehen", 50, 2],
      ["Hund", 25, 3],
      ["Hunde", 15, 4],
      ["anfangen", 6, 5],
    ]);
  });

  it("replaces an earlier import and keeps other languages", async () => {
    await db.dictionaryEntry.create({
      data: { language: "fr", word: "chien", wordLower: "chien", pos: "noun", senses: [], senseCount: 0 },
    });
    await importDictionary(client, { dictionary, frequencies });
    await importDictionary(client, { dictionary });

    expect(await db.dictionaryEntry.count({ where: { language: "de" } })).toBe(4);
    expect(await db.dictionaryEntry.count({ where: { language: "fr" } })).toBe(1);
    expect(await db.lemmaFrequency.count()).toBe(0);
  });

  it("leaves the old data in place when the import fails", async () => {
    await importDictionary(client, { dictionary });
    await expect(importDictionary(client, { dictionary: path.join(dir, "missing.jsonl") })).rejects.toThrow();
    expect(await db.dictionaryEntry.count({ where: { language: "de" } })).toBe(4);
  });
});
