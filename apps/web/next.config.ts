import path from "node:path";
import * as dotenv from "dotenv";
import type { NextConfig } from "next";

// DATABASE_URL lives in the repo-root .env, shared with packages/db. Next.js only
// reads env files from apps/web, so load the root one too (it never overrides
// variables that are already set).
dotenv.config({ path: path.resolve(process.cwd(), "../../.env"), quiet: true });

const nextConfig: NextConfig = {
  // transpilePackages: ["plyr"], TODO: Check if this is needed after building
};

export default nextConfig;
