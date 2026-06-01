import { expect, test } from "@playwright/test";

import { systemAdminApprovalsSurfaceKey } from "@afenda/feature-system-admin/metadata";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoApprovalsWorkbench(page: import("@playwright/test").Page) {
  await page.goto("/system-admin/approvals", {
    timeout: 60_000,
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/system-admin\/approvals/, { timeout: 15_000 });
  await dismissDevSignInPanel(page);

  const accessDenied = page.getByTestId("system-admin-approvals-access-denied");
  const catalog = page.getByTestId(
    `governed:list-section:${systemAdminApprovalsSurfaceKey}`,
  );
  const pageRoot = page.getByTestId("system-admin-approvals-page");

  await expect(accessDenied.or(pageRoot)).toBeVisible({ timeout: 60_000 });

  if (await accessDenied.isVisible().catch(() => false)) {
    throw new Error(
      "E2E dev session lacks system-admin approvals read access.",
    );
  }

  await expect(page.getByRole("heading", { name: "Approvals" })).toBeVisible();
  await expect(catalog).toBeVisible();
}

test.describe("System admin approvals smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads approval catalog @authenticated", async ({ page }) => {
    test.setTimeout(360_000);
    await gotoApprovalsWorkbench(page);
  });

  test("opens approval detail when approvalsKey is present @authenticated", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await page.goto("/system-admin/approvals?approvalsKey=finance.payment", {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });
    await dismissDevSignInPanel(page);

    await expect(page).toHaveURL(/approvalsKey=finance\.payment/);

    const detailPanel = page.locator(
      '[data-testid="system-admin-approval-detail:finance.payment"]',
    );

    if (await detailPanel.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(detailPanel.getByText("Recent approval activity")).toBeVisible();
      await expect(
        detailPanel.getByRole("link", { name: "Back to catalog" }),
      ).toBeVisible();
      return;
    }

    await gotoApprovalsWorkbench(page);
  });
});
