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
      "@afenda/kernel/feature-metadata": path.resolve(
        __dirname,
        "../../packages/kernel/src/modules/feature-metadata.ts",
      ),
      "@afenda/kernel/execution-capabilities": path.resolve(
        __dirname,
        "../../packages/kernel/src/execution-kernel/capabilities/execution-capabilities.ts",
      ),
      "@afenda/kernel/execution-tenant-policy": path.resolve(
        __dirname,
        "../../packages/kernel/src/execution-kernel/policy/tenant-execution-rules.ts",
      ),
      "@afenda/kernel/module-definitions": path.resolve(
        __dirname,
        "../../packages/kernel/src/modules/definitions.ts",
      ),
      "@afenda/kernel/tenant-availability": path.resolve(
        __dirname,
        "../../packages/kernel/src/modules/tenant-availability.ts",
      ),
      "@afenda/kernel/tenant-module-availability": path.resolve(
        __dirname,
        "../../packages/kernel/src/modules/tenant-module-availability.ts",
      ),
      "@afenda/kernel": path.resolve(
        __dirname,
        "../../packages/kernel/src/index.ts",
      ),
      "@afenda/kernel/server": path.resolve(
        __dirname,
        "../../packages/kernel/src/server.ts",
      ),
      "@afenda/kernel/execution": path.resolve(
        __dirname,
        "../../packages/kernel/src/execution.ts",
      ),
    },
  },
});
