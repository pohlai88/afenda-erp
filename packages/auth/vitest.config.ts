import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/auth", {
  test: {
    include: ["tests/**/*.test.ts", "neon-auth/tests/**/*.test.ts"],
  },
});
