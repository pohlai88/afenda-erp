import { expect, test } from "@playwright/test";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoAuditWorkbench(page: import("@playwright/test").Page) {
  await page.goto("/system-admin/audit", {
    timeout: 60_000,
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/system-admin\/audit/, { timeout: 15_000 });
  await dismissDevSignInPanel(page);

  const accessDenied = page.getByTestId("system-admin-audit-access-denied");
  const pageRoot = page.getByTestId("system-admin-audit-page");
  const catalog = page.getByRole("table", {
    name: "Administrative audit evidence",
  });

  await expect(accessDenied.or(pageRoot)).toBeVisible({ timeout: 60_000 });

  if (await accessDenied.isVisible().catch(() => false)) {
    throw new Error(
      "E2E dev session lacks system-admin audit read access.",
    );
  }

  await expect(
    page.getByRole("heading", { name: "Audit viewer" }),
  ).toBeVisible();
  await expect(catalog).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("system-admin-audit-coverage")).toBeVisible();
}

test.describe("System admin audit viewer smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads audit evidence catalog @authenticated", async ({ page }) => {
    test.setTimeout(360_000);
    await gotoAuditWorkbench(page);
  });

  test("opens audit detail when auditId is present @authenticated", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await page.goto("/system-admin/audit?auditId=audit-gallery-1", {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });
    await dismissDevSignInPanel(page);

    await expect(page).toHaveURL(/auditId=audit-gallery-1/);

    const detailPanel = page.locator(
      '[data-testid="system-admin-audit-detail:audit-gallery-1"]',
    );

    if (await detailPanel.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(detailPanel.getByText("Evidence timeline")).toBeVisible();
      await expect(
        detailPanel.getByRole("link", { name: "Back to results" }),
      ).toBeVisible();
      return;
    }

    await gotoAuditWorkbench(page);
  });
});
