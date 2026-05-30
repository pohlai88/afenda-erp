/**
 * Visual regression for @afenda/ui primitive previews (interface lab).
 *
 * Lab route is public when Neon Auth is off (visual config / CI e2e env).
 *
 *   pnpm test:visual:update   # local baselines via next dev
 *   pnpm test:visual          # CI gate via next start
 */
import { expect, test } from "@playwright/test";

const LAB_PATH = "/interface-lab/primitives";

test.describe("UI primitive interface lab @visual", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(LAB_PATH, { waitUntil: "domcontentloaded", timeout: 300_000 });
    await page.close();
  });

  test("primitive lab page renders fixture sections", async ({ page }) => {
    await page.goto(LAB_PATH, { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: /Interface lab — primitives/i }),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("button", { name: "Default" })).toBeVisible();
    await expect(page.getByPlaceholder("EMP-001")).toBeVisible();
  });

  test("button matrix matches approved snapshot @visual", async ({ page }) => {
    await page.goto(LAB_PATH, { waitUntil: "domcontentloaded" });

    const fixture = page.locator('[data-visual-fixture="button-matrix"]');
    await expect(fixture).toBeVisible({ timeout: 60_000 });
    await expect(fixture).toHaveScreenshot("primitive-button-matrix.png");
  });

  test("input field matches approved snapshot @visual", async ({ page }) => {
    await page.goto(LAB_PATH, { waitUntil: "domcontentloaded" });

    const fixture = page.locator('[data-visual-fixture="input-field"]');
    await expect(fixture).toBeVisible({ timeout: 60_000 });
    await expect(fixture).toHaveScreenshot("primitive-input-field.png");
  });

  test("dialog open surface matches approved snapshot @visual", async ({ page }) => {
    await page.goto(LAB_PATH, { waitUntil: "domcontentloaded" });

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 60_000 });
    await expect(dialog).toHaveScreenshot("primitive-dialog-open.png");
  });
});
