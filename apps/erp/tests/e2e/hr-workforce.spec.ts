import { expect, test, type Page } from "@playwright/test";

async function devSignIn(page: Page) {
  await page.goto("/sign-in");
  const devSignInButton = page.getByRole("button", {
    name: "Continue to dashboard",
  });

  if (!(await devSignInButton.isVisible())) {
    test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
  }

  await devSignInButton.click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("HR workforce @smoke", () => {
  test("loads employee directory with seeded workforce rows", async ({ page }) => {
    await devSignIn(page);
    await page.goto("/hr/employees");

    await expect(
      page.getByRole("heading", { level: 1, name: "Employees" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Add employee" })).toBeVisible();
    await expect(page.getByText("E-001")).toBeVisible();
    await expect(page.getByText("E-002")).toBeVisible();
    await expect(page.getByText("E-003")).toBeVisible();
  });

  test("creates and archives an employee through the workforce UI", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await devSignIn(page);
    const employeeNumber = `E-E2E-${Date.now()}`;

    await page.goto("/hr/employees/new");
    await expect(
      page.getByRole("heading", { level: 1, name: "Add employee" }),
    ).toBeVisible();

    await page.getByLabel("Employee number").fill(employeeNumber);
    await page.getByLabel("Legal name").fill("E2E Test Worker");
    await page.getByLabel("Work email").fill(`${employeeNumber.toLowerCase()}@afenda.local`);
    await page.getByRole("button", { name: "Create employee" }).click();

    await expect(page).toHaveURL(/\/hr\/employees\/[^/]+$/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { level: 1, name: "E2E Test Worker" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Archive employee" }).click();
    await expect(page).toHaveURL(/\/hr\/employees$/, { timeout: 20_000 });
    await expect(page.getByText(employeeNumber)).not.toBeVisible();
  });
});
