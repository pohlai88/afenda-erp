import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/object-storage", {
  test: {
    setupFiles: ["./tests/vitest.setup.ts"],
  },
});
