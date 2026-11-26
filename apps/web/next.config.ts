import path from "node:path";
import * as dotenv from "dotenv";
import type { NextConfig } from "next";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env"), quiet: true });

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // transpilePackages: ["plyr"], TODO: Check if this is needed after building

  typescript: { tsconfigPath: "tsconfig.ci.json" },

  // Locally, Next.js forwards /api/* to the API, the same split Caddy does in production.
  // Rewrites returned as an array run after Next's own routes, so the route handlers still
  // in app/api (the session cookie, the search and stream placeholders) answer first.
  // The cookie and Origin header pass through unchanged.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
