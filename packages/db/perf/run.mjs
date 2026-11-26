// Measures the candidate indexes for card [7] with EXPLAIN (ANALYZE, BUFFERS).
//   node perf/run.mjs --seed   create and seed the perf database, then measure
//   node perf/run.mjs          measure again on the existing data
// Writes perf/results.md. See docs/changes/007-indexes/.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, "..");
dotenv.config({ path: path.resolve(packageDir, "../../.env"), quiet: true });

const RUNS = 5;

function perfUrl() {
  const fromEnv = process.env.PERF_DATABASE_URL;
  const base = fromEnv ?? process.env.DATABASE_URL;
  if (!base) throw new Error("Set PERF_DATABASE_URL or DATABASE_URL in the root .env.");
  const url = new URL(base);
  if (!fromEnv) url.pathname = "/linguastream_perf";
  if (!url.pathname.endsWith("_perf")) {
    throw new Error(`Refusing to run against "${url.pathname.slice(1)}": the name must end in "_perf".`);
  }
  return url.toString();
}

async function createDatabaseIfMissing(url) {
  const name = new URL(url).pathname.slice(1);
  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    if (!rowCount) await client.query(`CREATE DATABASE "${name}"`);
  } finally {
    await client.end();
  }
}

// ── Scenarios ───────────────────────────────────────────────────────

const RESET = `
  DROP INDEX IF EXISTS perf_connections_line_id, perf_connections_video_id, perf_connections_word_id,
    perf_line_translations_line_id, perf_deck_words_word_id, perf_review_logs_card_id,
    perf_tracks_video_id, perf_lines_track_start, perf_lines_lemmas, perf_words_saved,
    perf_cards_user_due, perf_lines_user_lemmas;
  ALTER TABLE cards DROP COLUMN IF EXISTS user_id;
  ALTER TABLE lines DROP COLUMN IF EXISTS user_id;
`;

// Indexes every scenario after the baseline shares: foreign keys used by deletes
// and joins, the time window, the notebook page.
const COMMON = `
  CREATE INDEX perf_connections_line_id ON connections (line_id);
  CREATE INDEX perf_connections_video_id ON connections (video_id);
  CREATE INDEX perf_connections_word_id ON connections (word_id);
  CREATE INDEX perf_line_translations_line_id ON line_translations (line_id);
  CREATE INDEX perf_deck_words_word_id ON deck_words (word_id);
  CREATE INDEX perf_review_logs_card_id ON review_logs (card_id);
  CREATE INDEX perf_tracks_video_id ON tracks (video_id);
  CREATE INDEX perf_lines_track_start ON lines (track_id, start_ms);
  CREATE INDEX perf_words_saved ON vocabulary_words (user_id, saved_at DESC) WHERE saved_at IS NOT NULL;
`;

const SCENARIOS = [
  { id: "none", name: "No extra indexes", sql: "" },
  {
    id: "join",
    name: "B: indexes on the existing model",
    sql: COMMON + `CREATE INDEX perf_lines_lemmas ON lines USING gin (lemmas);`,
  },
  {
    id: "userid",
    name: "A: user_id copied onto cards and lines",
    sql:
      COMMON +
      `
      CREATE EXTENSION IF NOT EXISTS btree_gin;
      ALTER TABLE cards ADD COLUMN user_id uuid;
      UPDATE cards c SET user_id = w.user_id FROM vocabulary_words w WHERE w.id = c.word_id;
      ALTER TABLE lines ADD COLUMN user_id uuid;
      UPDATE lines l SET user_id = v.user_id FROM tracks t JOIN videos v ON v.id = t.video_id WHERE t.id = l.track_id;
      CREATE INDEX perf_cards_user_due ON cards (user_id, due);
      CREATE INDEX perf_lines_user_lemmas ON lines USING gin (user_id, lemmas);
    `,
  },
];

// ── Queries ─────────────────────────────────────────────────────────

function queries(p, scenario) {
  const userIdOnRows = scenario === "userid";
  return [
    {
      id: "window",
      name: "1. Lines of a track in a 2-minute window",
      sql: `SELECT id, start_ms, end_ms, text FROM lines
            WHERE track_id = ${p.track} AND start_ms < 1320000 AND end_ms > 1200000
            ORDER BY start_ms`,
    },
    {
      id: "due",
      name: "2. A user's due cards, oldest first, 50",
      sql: userIdOnRows
        ? `SELECT * FROM cards WHERE user_id = ${p.user} AND due <= now() ORDER BY due LIMIT 50`
        : `SELECT c.* FROM cards c JOIN vocabulary_words w ON w.id = c.word_id
           WHERE w.user_id = ${p.user} AND c.due <= now() ORDER BY c.due LIMIT 50`,
    },
    ...[
      ["common", "w1", "a common lemma (in ~44 % of lines)"],
      ["rare", "w5000", "a rare lemma"],
    ].flatMap(([key, lemma, label]) => [
      {
        id: `lemma-${key}-page`,
        name: `3. A user's lines with ${label}, first 50`,
        sql: userIdOnRows
          ? `SELECT id, text FROM lines WHERE user_id = ${p.user} AND lemmas @> ARRAY['${lemma}'] LIMIT 50`
          : `SELECT l.id, l.text FROM lines l JOIN tracks t ON t.id = l.track_id JOIN videos v ON v.id = t.video_id
             WHERE v.user_id = ${p.user} AND l.lemmas @> ARRAY['${lemma}'] LIMIT 50`,
      },
      {
        id: `lemma-${key}-count`,
        name: `3. Count of a user's lines with ${label}`,
        sql: userIdOnRows
          ? `SELECT count(*) FROM lines WHERE user_id = ${p.user} AND lemmas @> ARRAY['${lemma}']`
          : `SELECT count(*) FROM lines l JOIN tracks t ON t.id = l.track_id JOIN videos v ON v.id = t.video_id
             WHERE v.user_id = ${p.user} AND l.lemmas @> ARRAY['${lemma}']`,
      },
    ]),
    {
      id: "delete-video",
      name: "4. Delete a video (rolled back)",
      sql: `DELETE FROM videos WHERE id = ${p.video}`,
      rollback: true,
    },
    {
      id: "delete-word",
      name: "4. Delete a word (rolled back)",
      sql: `DELETE FROM vocabulary_words WHERE id = ${p.word}`,
      rollback: true,
    },
    {
      id: "notebook",
      name: "5. A user's saved words, newest first, 25",
      sql: `SELECT * FROM vocabulary_words WHERE user_id = ${p.user} AND saved_at IS NOT NULL
            ORDER BY saved_at DESC LIMIT 25`,
    },
  ];
}

async function params(client) {
  const lit = (v) => client.escapeLiteral(v);
  const user = (await client.query("SELECT id FROM users ORDER BY firebase_uid LIMIT 1")).rows[0].id;
  const video = (
    await client.query(
      `SELECT v.id FROM videos v JOIN connections c ON c.video_id = v.id
       WHERE v.user_id = $1 GROUP BY v.id ORDER BY count(*) DESC LIMIT 1`,
      [user],
    )
  ).rows[0].id;
  const track = (await client.query("SELECT id FROM tracks WHERE video_id = $1", [video])).rows[0].id;
  const word = (
    await client.query(
      `SELECT w.id FROM vocabulary_words w JOIN connections c ON c.word_id = w.id
       WHERE w.user_id = $1 GROUP BY w.id ORDER BY count(*) DESC LIMIT 1`,
      [user],
    )
  ).rows[0].id;
  return { user: lit(user), video: lit(video), track: lit(track), word: lit(word) };
}

async function explain(client, q) {
  const times = [];
  let plan = "";
  for (let i = 0; i <= RUNS; i++) {
    if (q.rollback) await client.query("BEGIN");
    const { rows } = await client.query(`EXPLAIN (ANALYZE, BUFFERS) ${q.sql}`);
    if (q.rollback) await client.query("ROLLBACK");
    plan = rows.map((r) => r["QUERY PLAN"]).join("\n");
    const ms = Number(/Execution Time: ([\d.]+) ms/.exec(plan)[1]);
    if (i > 0) times.push(ms); // the first run warms the cache
  }
  times.sort((a, b) => a - b);
  return { median: times[Math.floor(times.length / 2)], plan };
}

// ── Main ────────────────────────────────────────────────────────────

const url = perfUrl();
const seed = process.argv.includes("--seed");

if (seed) {
  await createDatabaseIfMissing(url);
  execSync("pnpm exec prisma migrate reset --force", {
    cwd: packageDir,
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}

const client = new pg.Client({ connectionString: url });
await client.connect();

if (seed) {
  console.log("Seeding (about a minute)…");
  const started = Date.now();
  // One request runs as one transaction, so VACUUM (not allowed in one) is separate.
  await client.query(readFileSync(path.join(here, "seed.sql"), "utf8"));
  await client.query("VACUUM ANALYZE");
  console.log(`Seeded in ${Math.round((Date.now() - started) / 1000)} s.`);
}

const p = await params(client);
const results = {};

for (const scenario of SCENARIOS) {
  console.log(`Scenario: ${scenario.name}`);
  await client.query(RESET);
  if (scenario.sql) await client.query(scenario.sql);
  await client.query("VACUUM ANALYZE");
  for (const q of queries(p, scenario.id)) {
    results[q.id] ??= { name: q.name, runs: {} };
    results[q.id].runs[scenario.id] = await explain(client, q);
    console.log(`  ${q.name}: ${results[q.id].runs[scenario.id].median} ms`);
  }
}

await client.query(RESET);

const sizes = (
  await client.query(`
    SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) AS size, reltuples::bigint AS rows
    FROM pg_class WHERE relname IN ('lines', 'vocabulary_words', 'cards', 'connections', 'review_logs')
    ORDER BY relname`)
).rows;
const version = (await client.query("SHOW server_version")).rows[0].server_version;
await client.end();

const fmt = (ms) => (ms < 10 ? ms.toFixed(2) : ms.toFixed(0));
let md = `# Index measurements\n\nGenerated by \`packages/db/perf/run.mjs\` on ${new Date().toISOString().slice(0, 10)}, Postgres ${version}. Median of ${RUNS} runs after one warm-up run; times in ms (\`EXPLAIN ANALYZE\` execution time, which includes foreign-key triggers).\n\n`;
md += `Data: ${sizes.map((s) => `${s.relname} ${Number(s.rows).toLocaleString("en")} rows (${s.size})`).join(", ")}.\n\n`;
md += `| Query | ${SCENARIOS.map((s) => s.name).join(" | ")} |\n|---|${SCENARIOS.map(() => "---:").join("|")}|\n`;
for (const r of Object.values(results)) {
  md += `| ${r.name} | ${SCENARIOS.map((s) => fmt(r.runs[s.id].median)).join(" | ")} |\n`;
}
md += `\n## Plans\n`;
for (const r of Object.values(results)) {
  md += `\n### ${r.name}\n`;
  for (const s of SCENARIOS) {
    md += `\n<details><summary>${s.name}: ${fmt(r.runs[s.id].median)} ms</summary>\n\n\`\`\`\n${r.runs[s.id].plan}\n\`\`\`\n</details>\n`;
  }
}
writeFileSync(path.join(here, "results.md"), md);
console.log(`Wrote ${path.join(here, "results.md")}`);
