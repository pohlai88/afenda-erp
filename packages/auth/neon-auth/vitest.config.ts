import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/auth/neon-auth", {
  test: {
    include: ["neon-auth/tests/**/*.test.ts"],
  },
});
