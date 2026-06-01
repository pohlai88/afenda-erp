/**
 * Visual regression snapshot test for the metadata renderer gallery.
 *
 * One full-page screenshot captures all 13 governed renderers in a single
 * assertion. A pixel diff > 2% means a token or layout regression occurred.
 *
 * Tagged @visual — runs via `pnpm test:visual` (CI) or `pnpm test:visual:update` (local).
 */
import { expect, test } from "@playwright/test";

import { skipWhenNeonAuthEnabled } from "./support/auth";

test.describe("Metadata renderer gallery @visual", () => {
  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("renderer gallery empty and forbidden fixtures are visible", async ({
    page,
  }) => {
    await page.goto("/playground/metadata-renderer-gallery");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No metrics configured.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("No approval steps recorded.")).toBeVisible();
    await expect(
      page.getByText("No workflow columns configured."),
    ).toBeVisible();
    await expect(
      page.getByText("You do not have access to this surface"),
    ).toBeVisible();
  });

  test("renderer gallery renders without regressions @visual", async ({
    page,
  }) => {
    await page.goto("/playground/metadata-renderer-gallery");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /Metadata renderer gallery/i }),
    ).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveScreenshot("renderer-gallery.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
