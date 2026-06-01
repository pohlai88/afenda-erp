import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import {
  createVitestConfig,
  INTEGRATION_TEST_GLOB,
  integrationTestOptions,
} from "@afenda/config/vitest";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

const shared = createVitestConfig("@afenda/feature-hr-suite", {
  resolve: {
    alias: {
      "server-only": path.join(packageRoot, "tests/stubs/server-only.ts"),
    },
  },
});

const testInclude = ["tests/**/*.test.ts", "src/**/tests/**/*.test.ts"];

export default defineConfig({
  ...shared,
  test: {
    ...shared.test,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: testInclude,
          exclude: [...INTEGRATION_TEST_GLOB],
          testTimeout: 30_000,
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: [...INTEGRATION_TEST_GLOB],
          ...integrationTestOptions,
        },
      },
    ],
  },
});
