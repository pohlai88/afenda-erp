import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/governed-surface", {
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
