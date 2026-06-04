import path from "node:path";
import { fileURLToPath } from "node:url";
import { createVitestConfig } from "@afenda/config/vitest";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig("@afenda/governed-surface", {
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: [path.join(packageRoot, "tests", "setup.ts")],
  },
});
