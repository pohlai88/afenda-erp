import path from "node:path";
import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/erp", {
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/routes/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@afenda/kernel": path.resolve(
        __dirname,
        "../../packages/kernel/src/index.ts",
      ),
    },
  },
});
