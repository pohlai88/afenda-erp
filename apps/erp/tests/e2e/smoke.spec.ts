import { expect, test, type Locator, type Page } from "@playwright/test";

import { skipWhenNeonAuthEnabled } from "./support/auth";

async function isVisible(locator: Locator) {
  return locator.isVisible({ timeout: 5_000 }).catch(() => false);
}

async function gotoApp(page: Page, path: string) {
  await page.goto(path, { timeout: 60_000, waitUntil: "domcontentloaded" });
}

test.describe("Afenda ERP public smoke", () => {
  test("redirects unauthenticated home traffic to sign in @public", async ({
    page,
  }) => {
    await gotoApp(page, "/");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Tenant-aware ERP access",
    );
  });

  test("renders the sign-in page @public", async ({ page }) => {
    await gotoApp(page, "/sign-in");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: /Sign in to your workspace|Enter the workspace/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sign in|Continue to dashboard/ }),
    ).toBeVisible();
  });

  test("shows floating dev sign-in on pre-sign-in shell pages @public", async ({
    page,
  }) => {
    await gotoApp(page, "/sign-up");

    const devPanel = page.locator('aside[aria-label="Developer sign-in"]');

    if (!(await isVisible(devPanel))) {
      test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
    }

    await expect(devPanel.getByText("Developer sign-in")).toBeVisible();
    await devPanel.getByText("Developer sign-in").click();
    await expect(
      devPanel.getByRole("button", { name: "Continue here" }),
    ).toBeVisible();
  });
});

test.describe("Afenda ERP authenticated smoke", () => {
  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads dashboard from storage state @authenticated", async ({
    page,
  }) => {
    await gotoApp(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Production hardening",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("table", { name: "Production hardening" }),
    ).toBeVisible();
  });

  test("loads Lynx from storage state @authenticated", async ({ page }) => {
    await gotoApp(page, "/lynx");
    await expect(page).toHaveURL(/\/lynx/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Lynx Console" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Lynx Operator" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Recover negative P&L" }),
    ).toBeVisible();
  });

  test("opens a governed module record detail @authenticated", async ({
    page,
  }) => {
    await gotoApp(page, "/finance");
    await expect(
      page.getByRole("heading", { level: 1, name: "Finance" }),
    ).toBeVisible();

    await gotoApp(page, "/finance/records/finance-milestone-1");
    await expect(page).toHaveURL(/\/finance\/records\/finance-milestone-1/);
    await expect(
      page.getByRole("heading", { level: 1, name: "FINANCE-001" }),
    ).toBeVisible();

    const detailTabs = page.getByTestId(
      "governed:detail-tabs:finance-milestone-1",
    );
    await expect(detailTabs).toBeVisible();
    await expect(
      detailTabs.getByTestId("governed:detail-tab:overview"),
    ).toBeVisible();
    await expect(detailTabs.getByText("Record type")).toBeVisible();
    await expect(detailTabs.getByText("Amount")).toBeVisible();

    await detailTabs.getByTestId("governed:detail-tab:relations").click();
    await expect(detailTabs.getByText("Extension metadata")).toBeVisible();
  });

  test("opens a governed module work item detail @authenticated", async ({
    page,
  }) => {
    await gotoApp(page, "/finance/work-items/finance-work-item-1");
    await expect(page).toHaveURL(/\/finance\/work-items\/finance-work-item-1/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Introduce journal and subledger domain services.",
      }),
    ).toBeVisible();

    const detailTabs = page.getByTestId(
      "governed:detail-tabs:finance-work-item-1",
    );
    await expect(detailTabs).toBeVisible();
    await expect(
      detailTabs.getByTestId("governed:detail-tab:overview"),
    ).toBeVisible();
    await expect(detailTabs.getByText("Owner")).toBeVisible();
    await expect(detailTabs.getByText("Status")).toBeVisible();
    await expect(detailTabs.getByText("Priority")).toBeVisible();
  });
});

test.describe("Afenda ERP dev auth flow", () => {
  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads a protected route after floating dev sign-in @dev-auth-flow", async ({
    page,
  }) => {
    test.setTimeout(75_000);

    await gotoApp(page, "/sign-in");
    const initialDevPanel = page.locator(
      'aside[aria-label="Developer sign-in"]',
    );

    if (!(await isVisible(initialDevPanel))) {
      test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
    }

    await initialDevPanel.getByText("Developer sign-in").click();
    await Promise.all([
      page.waitForURL(/\/dashboard/, {
        timeout: 60_000,
        waitUntil: "domcontentloaded",
      }),
      initialDevPanel.getByRole("button", { name: "Continue here" }).click(),
    ]);
    await gotoApp(page, "/finance");
    await expect(
      page.getByRole("heading", { level: 1, name: "Finance" }),
    ).toBeVisible();
  });
});

test.describe("Neon Auth smoke", () => {
  test("renders neon sign-in when enabled @neon", async ({ page }) => {
    test.skip(
      process.env.AFENDA_NEON_AUTH_ENABLED !== "1",
      "Requires AFENDA_NEON_AUTH_ENABLED=1 and Neon Auth configuration.",
    );

    await gotoApp(page, "/sign-in");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Sign in to your workspace",
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});
