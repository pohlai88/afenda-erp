import { test, type Page } from "@playwright/test";

export function skipWhenNeonAuthEnabled() {
  test.skip(
    process.env.AFENDA_NEON_AUTH_ENABLED === "1",
    "Requires dev sign-in (AFENDA_NEON_AUTH_ENABLED=0).",
  );
}

export async function dismissDevSignInPanel(page: Page) {
  await page.evaluate(() => {
    document
      .querySelector('aside[aria-label="Developer sign-in"]')
      ?.remove();
  });
}
