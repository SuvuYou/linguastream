import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// SWC instead of esbuild so decorator metadata is emitted (Nest's dependency injection needs it).
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.db.test.ts"],
  },
});
