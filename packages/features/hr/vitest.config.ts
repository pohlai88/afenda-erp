import path from "node:path";
import { fileURLToPath } from "node:url";
import { createVitestConfig } from "@afenda/config/vitest";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig("@afenda/feature-hr", {
  resolve: {
    alias: {
      "server-only": path.join(packageRoot, "tests/stubs/server-only.ts"),
    },
  },
});
