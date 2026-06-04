import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/metadata-ui", {
  test: {
    environment: "node",
    include: [
      "src/tests/**/*.test.ts",
      "src/tests/**/*.test.tsx",
      "src/tests/**/*-test.shared.ts",
    ],
  },
});
