import { expect, test } from "@playwright/test";

import {
  systemAdminBillingGovernanceSurfaceKey,
  systemAdminBillingSubscriptionSurfaceKey,
} from "@afenda/feature-system-admin/metadata";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoBillingWorkbench(page: import("@playwright/test").Page) {
  await page.goto("/system-admin/billing", {
    timeout: 60_000,
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/system-admin\/billing/, { timeout: 15_000 });
  await dismissDevSignInPanel(page);

  const accessDenied = page.getByTestId("system-admin-billing-access-denied");
  const pageRoot = page.getByTestId("system-admin-billing-page");
  const readiness = page.getByTestId("system-admin-billing-readiness");
  const subscription = page.getByTestId(
    `governed-list-section:${systemAdminBillingSubscriptionSurfaceKey}`,
  );

  await expect(accessDenied.or(pageRoot)).toBeVisible({ timeout: 60_000 });

  if (await accessDenied.isVisible().catch(() => false)) {
    throw new Error(
      "E2E dev session lacks system-admin billing read access.",
    );
  }

  await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
  await expect(readiness).toBeVisible();
  await expect(
    page.getByTestId(
      `governed-list-section:${systemAdminBillingGovernanceSurfaceKey}`,
    ),
  ).toBeVisible();
  await expect(subscription).toBeVisible();
}

test.describe("System admin billing smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads billing workbench @authenticated", async ({ page }) => {
    test.setTimeout(360_000);
    await gotoBillingWorkbench(page);
  });

  test("shows checkout success banner when checkout=success @authenticated", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await page.goto("/system-admin/billing?checkout=success", {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });
    await dismissDevSignInPanel(page);

    const accessDenied = page.getByTestId("system-admin-billing-access-denied");
    if (await accessDenied.isVisible({ timeout: 5_000 }).catch(() => false)) {
      throw new Error(
        "E2E dev session lacks system-admin billing read access.",
      );
    }

    await expect(page.getByTestId("system-admin-billing-checkout-banner")).toBeVisible();
    await gotoBillingWorkbench(page);
  });
});
