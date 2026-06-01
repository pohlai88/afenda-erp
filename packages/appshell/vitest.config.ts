import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "server-only": new URL("./tests/server-only.stub.ts", import.meta.url)
        .pathname,
    },
  },
});
