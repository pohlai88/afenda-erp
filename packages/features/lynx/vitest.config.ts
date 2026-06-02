import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/feature-lynx", {
  test: {
    setupFiles: ["./tests/vitest.setup.ts"],
  },
});
