import { createVitestConfig } from "@afenda/config/vitest";

export default createVitestConfig("@afenda/ui", {
  define: {
    "process.env.NODE_ENV": JSON.stringify("test"),
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    pool: "forks",
    maxWorkers: process.env.CI ? 2 : undefined,
  },
});
