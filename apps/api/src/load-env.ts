import { existsSync } from "node:fs";
import path from "node:path";

// Imported first in main.ts, before anything reads process.env (the Prisma client does
// on import). The repo-root .env holds DATABASE_URL, shared with packages/db;
// apps/api/.env holds the API's own variables (Firebase Admin). Existing variables win.
for (const file of ["../../.env", ".env"]) {
  const fullPath = path.resolve(process.cwd(), file);
  if (existsSync(fullPath)) process.loadEnvFile(fullPath);
}
