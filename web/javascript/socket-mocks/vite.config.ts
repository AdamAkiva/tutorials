import { defineConfig } from "vitest/config";

/**********************************************************************************/

export default defineConfig({
  test: {
    root: "./",
    testTimeout: 8_000,
    teardownTimeout: 4_000,
    restoreMocks: true,
    logHeapUsage: true,
    slowTestThreshold: 128,
    pool: "threads",
    poolOptions: {
      threads: {
        isolate: false,
        useAtomics: true,
      },
    },
    maxConcurrency: 8,
    server: {
      sourcemap: "inline",
    },
    reporters: ["basic", "hanging-process"],
  },
});
