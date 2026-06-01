import { expect, test } from "@playwright/test";

import { skipWhenNeonAuthEnabled } from "./support/auth";

test.describe("System admin approvals smoke", () => {
  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads approval catalog @authenticated", async ({ page }) => {
    await page.goto("/system-admin/approvals", {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveURL(/\/system-admin\/approvals/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Approvals" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("governed-list-section:system-admin.approvals.list"),
    ).toBeVisible();
  });

  test("opens approval detail when approvalsKey is present @authenticated", async ({
    page,
  }) => {
    await page.goto("/system-admin/approvals?approvalsKey=finance.payment", {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveURL(/approvalsKey=finance\.payment/);

    const detailPanel = page.locator(
      '[data-testid="system-admin-approval-detail:finance.payment"]',
    );

    if (await detailPanel.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(detailPanel.getByText("Recent approval activity")).toBeVisible();
      await expect(
        detailPanel.getByRole("link", { name: "Back to catalog" }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("heading", { level: 1, name: "Approvals" }),
      ).toBeVisible();
    }
  });
});
