import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/neon-auth", {
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
