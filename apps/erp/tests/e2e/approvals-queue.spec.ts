import { expect, test } from "@playwright/test";

import { skipWhenNeonAuthEnabled } from "./support/auth";

test.describe("System admin approvals queue", () => {
  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads unified queue with approve and reject actions for capex work item @authenticated", async ({
    page,
  }) => {
    await page.goto("/system-admin/approvals", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    await expect(page).toHaveURL(/\/system-admin\/approvals/, {
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: "Approvals", exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    const capexRow = page.getByRole("row", {
      name: /Capex request for warehouse scanner rollout/i,
    });
    await expect(capexRow).toBeVisible({ timeout: 30_000 });

    const approveButton = capexRow.getByRole("button", { name: "Approve" });
    const rejectButton = capexRow.getByRole("button", { name: "Reject" });
    await expect(approveButton).toBeVisible();
    await expect(rejectButton).toBeVisible();

    await capexRow
      .getByLabel("Rejection reason")
      .fill("Budget threshold exceeded for this quarter.");
    await rejectButton.click();
    await expect(capexRow.getByRole("button", { name: "Reject" })).toBeHidden({
      timeout: 15_000,
    });
  });

  test("redirects legacy /approvals module route @authenticated", async ({
    page,
  }) => {
    await page.goto("/approvals", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    await expect(page).toHaveURL(/\/system-admin\/approvals/, {
      timeout: 15_000,
    });
  });
});
