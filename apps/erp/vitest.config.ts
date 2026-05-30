import path from "node:path";
import { createVitestConfig } from "@afenda/config/vitest";

const kernelRoot = path.resolve(__dirname, "../../packages/kernel/src");

export default createVitestConfig("@afenda/erp", {
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/routes/**/*.test.ts"],
  },
  resolve: {
    alias: [
      {
        find: "@afenda/kernel/execution-capabilities",
        replacement: path.join(
          kernelRoot,
          "execution-kernel/capabilities/execution-capabilities.ts",
        ),
      },
      {
        find: "@afenda/kernel/execution",
        replacement: path.join(kernelRoot, "execution.ts"),
      },
      {
        find: "@afenda/kernel/server",
        replacement: path.join(kernelRoot, "server.ts"),
      },
      {
        find: "@afenda/kernel",
        replacement: path.join(kernelRoot, "index.ts"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
});
