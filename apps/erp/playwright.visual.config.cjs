/**
 * Visual baseline seeding via `next dev` (no production build).
 *
 *   pnpm test:visual:update
 *
 * CI uses playwright.config.cjs + `next start` after `pnpm --filter @afenda/erp build`.
 */
const { defineConfig } = require("@playwright/test");

const { defineAfendaPlaywrightConfig } = require("./tests/e2e/playwright.shared.cjs");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig(
  defineAfendaPlaywrightConfig("visual-dev", {
    grep: /@visual/,
    retries: 0,
  }),
);
