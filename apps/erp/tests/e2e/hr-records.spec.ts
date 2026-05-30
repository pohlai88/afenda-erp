import { expect, test } from "@playwright/test";

import { hrRecordsDirectorySurfaceKey } from "@afenda/feature-hr-suite/metadata";

async function devSignIn(page: import("@playwright/test").Page) {
  await page.context().clearCookies();
  await page.goto("/sign-in");
  const devSignInButton = page.getByRole("button", {
    name: "Continue to dashboard",
  });

  if (!(await devSignInButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
  }

  await devSignInButton.click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

async function dismissDevSignInPanel(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document
      .querySelector('aside[aria-label="Developer sign-in"]')
      ?.remove();
  });
}

async function gotoEmployeesWorkbench(page: import("@playwright/test").Page) {
  await page.goto("/hr/employees", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/hr\/employees/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: "Employee records" }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "Access restricted" }),
  ).not.toBeVisible();
  await dismissDevSignInPanel(page);
}

test.describe("HR employee records", () => {
  test.describe.configure({ mode: "serial" });

  test("renders the employee records workbench", async ({ page }) => {
    test.setTimeout(360_000);
    await devSignIn(page);
    await gotoEmployeesWorkbench(page);
    await expect(
      page.locator('[data-testid^="governed-list-section:"]').first(),
    ).toBeVisible({ timeout: 240_000 });
  });

  test("renders employee record detail when directory has employees", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await devSignIn(page);
    await gotoEmployeesWorkbench(page);

    const directory = page.getByTestId(
      `governed-list-section:${hrRecordsDirectorySurfaceKey}`,
    );
    await expect(directory).toBeVisible({ timeout: 240_000 });

    const firstRow = directory
      .locator(`[data-testid^="governed-list-row:${hrRecordsDirectorySurfaceKey}:"]`)
      .first();
    const hasRow = await firstRow.isVisible({ timeout: 120_000 }).catch(() => false);

    if (!hasRow) {
      test.skip(true, "No employees in directory.");
      return;
    }

    const rowTestId = await firstRow.getAttribute("data-testid");
    const employeeId = rowTestId?.split(":").at(-1);
    if (!employeeId) {
      test.skip(true, "Could not resolve employee id from directory row.");
      return;
    }

    await page.goto(`/hr/records/${employeeId}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await expect(page).toHaveURL(new RegExp(`/hr/records/${employeeId}`), {
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { level: 1 }).first(),
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      page.getByRole("alert").filter({ hasText: "Access restricted" }),
    ).not.toBeVisible();
    await expect(page.getByText("Employee profile")).toBeVisible({
      timeout: 60_000,
    });
  });
});
