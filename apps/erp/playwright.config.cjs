const { defineConfig } = require("@playwright/test");

const { defineAfendaPlaywrightConfig } = require("./tests/e2e/playwright.shared.cjs");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig(defineAfendaPlaywrightConfig("production"));
