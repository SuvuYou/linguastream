import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.db.test.ts"],
    globalSetup: ["../../packages/db/test/global-setup.ts"],
    setupFiles: ["../../packages/db/test/setup.ts"],
    fileParallelism: false,
  },
});
