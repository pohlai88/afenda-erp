import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/auth", {
  test: {
    include: ["src/neon-auth/tests/**/*.test.ts"],
  },
});
