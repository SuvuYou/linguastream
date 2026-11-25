import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env"), quiet: true });

export function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;

  if (!url) {
    throw new Error("TEST_DATABASE_URL is not set (see .env.example).");
  }

  const name = new URL(url).pathname.slice(1);

  if (!name.endsWith("_test")) {
    throw new Error(
      `Refusing to run integration tests against "${name}": the database name must end in "_test".`,
    );
  }

  return url;
}
