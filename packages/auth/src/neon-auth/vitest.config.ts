import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/auth/neon-auth", {
  test: {
    include: ["src/neon-auth/tests/**/*.test.ts"],
    root: "..",
  },
});
