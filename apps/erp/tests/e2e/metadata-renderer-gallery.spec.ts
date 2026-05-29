/**
 * Visual regression snapshot test for the metadata renderer gallery.
 *
 * One full-page screenshot captures all 13 governed renderers in a single
 * assertion. A pixel diff > 2% means a token or layout regression occurred.
 *
 * Tagged @visual so it only runs in CI (or locally with --grep @visual).
 * Update snapshots from a Linux environment:
 *   pnpm test:e2e --update-snapshots --grep @visual
 */
import { expect, test } from "@playwright/test";

test.describe("Metadata renderer gallery @visual", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with dev bypass — skip if Neon Auth is active
    await page.goto("/sign-in");
    const devSignInButton = page.getByRole("button", {
      name: "Continue to dashboard",
    });

    if (!(await devSignInButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "Dev sign-in unavailable (Neon Auth active).");
      return;
    }

    await devSignInButton.click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
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

    // Wait for lazy-loaded sections (charts, kanban boards)
    await page.waitForTimeout(500);

    // Expect the gallery heading to be visible before snapshotting
    await expect(
      page.getByRole("heading", { name: /Metadata renderer gallery/i }),
    ).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveScreenshot("renderer-gallery.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
