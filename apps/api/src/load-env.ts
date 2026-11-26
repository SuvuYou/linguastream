import { existsSync } from "node:fs";
import path from "node:path";

for (const file of ["../../.env", ".env"]) {
  const fullPath = path.resolve(process.cwd(), file);
  if (existsSync(fullPath)) process.loadEnvFile(fullPath);
}
