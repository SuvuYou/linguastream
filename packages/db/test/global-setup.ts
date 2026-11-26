import { execSync } from "node:child_process";
import path from "node:path";
import { Client } from "pg";
import { getTestDatabaseUrl } from "./helpers/test-database-url.js";

async function createDatabaseIfMissing(url: string) {
  const target = new URL(url);
  const name = target.pathname.slice(1);
  const admin = new URL(url);
  admin.pathname = "/postgres";

  const client = new Client({ connectionString: admin.toString() });
  await client.connect();

  try {
    const { rowCount } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [name],
    );

    if (!rowCount) {
      await client.query(`CREATE DATABASE "${name}"`);
    }
  } finally {
    await client.end();
  }
}

export default async function setup() {
  const url = getTestDatabaseUrl();

  await createDatabaseIfMissing(url);

  execSync("pnpm exec prisma migrate reset --force", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}
