import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import type { Client } from "pg";
import { parseFrequencyLine, parseLine, type EntryRow, type FormRow } from "./wiktextract.js";

export const BATCH_ROWS = 2_000;

export interface ImportStats {
  lines: number;
  entries: number;
  forms: number;
  frequencies: number;
  rankedLemmas: number;
  seconds: number;
}

export interface ImportOptions {
  dictionary: string;
  frequencies?: string;
  language?: string;
  log?: (message: string) => void;
}

function lines(path: string) {
  const file = createReadStream(path);
  return createInterface({ input: path.endsWith(".gz") ? file.pipe(createGunzip()) : file, crlfDelay: Infinity });
}

async function insertEntries(client: Client, language: string, rows: EntryRow[]) {
  if (rows.length === 0) return;
  await client.query(
    `INSERT INTO dictionary_entries (language, word, word_lower, pos, gender, plural, flags, senses, sense_count)
     SELECT $1, v.word, lower(v.word), v.pos, v.gender, v.plural,
            ARRAY(SELECT jsonb_array_elements_text(v.flags)), v.senses, jsonb_array_length(v.senses)
     FROM unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::jsonb[], $7::jsonb[])
       AS v(word, pos, gender, plural, flags, senses)`,
    [
      language,
      rows.map((r) => r.word),
      rows.map((r) => r.pos),
      rows.map((r) => r.gender),
      rows.map((r) => r.plural),
      rows.map((r) => JSON.stringify(r.flags)),
      rows.map((r) => JSON.stringify(r.senses)),
    ],
  );
}

async function insertForms(client: Client, language: string, rows: FormRow[]) {
  if (rows.length === 0) return;
  await client.query(
    `INSERT INTO dictionary_forms (language, form, form_lower, lemma, pos, tags)
     SELECT $1, v.form, lower(v.form), v.lemma, v.pos, ARRAY(SELECT jsonb_array_elements_text(v.tags))
     FROM unnest($2::text[], $3::text[], $4::text[], $5::jsonb[]) AS v(form, lemma, pos, tags)`,
    [
      language,
      rows.map((r) => r.form),
      rows.map((r) => r.lemma),
      rows.map((r) => r.pos),
      rows.map((r) => JSON.stringify(r.tags)),
    ],
  );
}

async function insertFrequencies(client: Client, rows: { word: string; count: number }[]) {
  if (rows.length === 0) return;
  await client.query(
    `INSERT INTO frequency_import (word, count)
     SELECT v.word, v.count FROM unnest($1::text[], $2::bigint[]) AS v(word, count)
     ON CONFLICT (word) DO NOTHING`,
    [rows.map((r) => r.word), rows.map((r) => r.count)],
  );
}

export const RANK_LEMMAS_SQL = `
  WITH f AS (
    SELECT DISTINCT form_lower AS form, lemma FROM dictionary_forms
    WHERE language = $1 AND form_lower !~ '\\s'
  ),
  shared AS (SELECT form, count(*) AS lemmas FROM f GROUP BY form),
  totals AS (
    SELECT f.lemma, sum(q.count::numeric / shared.lemmas) AS total
    FROM f JOIN shared USING (form) JOIN frequency_import q ON q.word = f.form
    GROUP BY f.lemma
  )
  INSERT INTO lemma_frequencies (language, word, count, rank)
  SELECT $1, lemma, round(total)::bigint, row_number() OVER (ORDER BY total DESC, lemma)
  FROM totals`;

export async function importDictionary(client: Client, options: ImportOptions): Promise<ImportStats> {
  const language = options.language ?? "de";
  const log = options.log ?? (() => undefined);
  const started = Date.now();
  const stats: ImportStats = { lines: 0, entries: 0, forms: 0, frequencies: 0, rankedLemmas: 0, seconds: 0 };

  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM dictionary_entries WHERE language = $1", [language]);
    await client.query("DELETE FROM dictionary_forms WHERE language = $1", [language]);
    await client.query("DELETE FROM lemma_frequencies WHERE language = $1", [language]);

    let entries: EntryRow[] = [];
    let forms: FormRow[] = [];
    for await (const line of lines(options.dictionary)) {
      stats.lines++;
      const parsed = parseLine(line, language);
      if (parsed.entry) entries.push(parsed.entry);
      forms.push(...parsed.forms);
      if (entries.length >= BATCH_ROWS) {
        await insertEntries(client, language, entries);
        stats.entries += entries.length;
        entries = [];
      }
      if (forms.length >= BATCH_ROWS) {
        await insertForms(client, language, forms);
        stats.forms += forms.length;
        forms = [];
      }
      if (stats.lines % 50_000 === 0) log(`${stats.lines.toLocaleString("en")} lines read`);
    }
    await insertEntries(client, language, entries);
    await insertForms(client, language, forms);
    stats.entries += entries.length;
    stats.forms += forms.length;

    if (options.frequencies) {
      await client.query("CREATE TEMP TABLE frequency_import (word text PRIMARY KEY, count bigint NOT NULL) ON COMMIT DROP");
      let batch: { word: string; count: number }[] = [];
      for await (const line of lines(options.frequencies)) {
        const row = parseFrequencyLine(line);
        if (!row) continue;
        batch.push(row);
        stats.frequencies++;
        if (batch.length >= BATCH_ROWS) {
          await insertFrequencies(client, batch);
          batch = [];
        }
      }
      await insertFrequencies(client, batch);
      const ranked = await client.query(RANK_LEMMAS_SQL, [language]);
      stats.rankedLemmas = ranked.rowCount ?? 0;
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
  await client.query("ANALYZE dictionary_entries, dictionary_forms, lemma_frequencies");
  stats.seconds = Math.round((Date.now() - started) / 1000);
  return stats;
}
