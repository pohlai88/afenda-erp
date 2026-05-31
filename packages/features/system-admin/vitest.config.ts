import path from "node:path";
import { fileURLToPath } from "node:url";
import { createVitestConfig } from "@afenda/config/vitest";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig("@afenda/feature-system-admin", {
  test: {
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
  resolve: {
    alias: {
      "server-only": path.join(packageRoot, "tests/stubs/server-only.ts"),
    },
  },
});
