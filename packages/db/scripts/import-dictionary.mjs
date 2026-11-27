import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import pg from "pg";
import { importDictionary } from "../dist/dictionary/import.js";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env"), quiet: true });

const [dictionary, frequencies] = process.argv.slice(2).filter((a) => a !== "--");
if (!dictionary) {
  console.error(
    "Usage: pnpm db:import-dictionary <kaikki German .jsonl or .jsonl.gz> [de_50k.txt]\n" +
      "Downloads: kaikki.org → German → JSONL of all word senses; FrequencyWords content/2018/de/de_50k.txt.",
  );
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (repo-root .env).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const stats = await importDictionary(client, {
    dictionary: path.resolve(process.env.INIT_CWD ?? process.cwd(), dictionary),
    frequencies: frequencies && path.resolve(process.env.INIT_CWD ?? process.cwd(), frequencies),
    log: (message) => console.log(message),
  });
  console.log(
    `Imported ${stats.entries.toLocaleString("en")} entries and ${stats.forms.toLocaleString("en")} forms ` +
      `from ${stats.lines.toLocaleString("en")} lines; ${stats.rankedLemmas.toLocaleString("en")} lemmas ranked ` +
      `from ${stats.frequencies.toLocaleString("en")} frequency words, in ${stats.seconds} s.`,
  );
} finally {
  await client.end();
}
