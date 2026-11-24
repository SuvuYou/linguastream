import path from "node:path";
import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// DATABASE_URL lives in the repo-root .env (shared by packages/db, apps/web and
// later apps/api). Prisma commands run from packages/db, so the root is two levels up.
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
