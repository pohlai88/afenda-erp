import { expect, test } from "@playwright/test";

const HR_COMPLIANCE_ALERTS_SECTION_TEST_ID =
  "governed-list-section:hr.workforce.compliance.alerts.list";

async function devSignIn(page: import("@playwright/test").Page) {
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

test.describe("HR compliance workbench", () => {
  test("renders compliance alerts first on the workbench", async ({ page }) => {
    test.setTimeout(75_000);

    await devSignIn(page);
    await page.goto("/hr/compliance");
    await expect(page).toHaveURL(/\/hr\/compliance/);

    await expect(
      page.getByRole("heading", { level: 1, name: "Compliance" }),
    ).toBeVisible();

    const alertsSection = page.getByTestId(HR_COMPLIANCE_ALERTS_SECTION_TEST_ID);
    await expect(alertsSection).toBeVisible();
    await expect(alertsSection.getByText("Compliance alerts")).toBeVisible();
    await expect(
      alertsSection.getByLabel("Search compliance alerts"),
    ).toBeVisible();

    const obligationsSection = page.getByTestId(
      "governed-list-section:hr.workforce.compliance.obligations.list",
    );
    await expect(obligationsSection).toBeVisible();

    const alertsBox = await alertsSection.boundingBox();
    const obligationsBox = await obligationsSection.boundingBox();
    expect(alertsBox).toBeTruthy();
    expect(obligationsBox).toBeTruthy();
    expect(alertsBox!.y).toBeLessThan(obligationsBox!.y);

    const emptyState = alertsSection.getByText("No active compliance alerts");
    const alertTable = alertsSection.getByRole("columnheader", {
      name: "Severity",
    });

    await expect(emptyState.or(alertTable)).toBeVisible();
  });

  test("preserves compliance alerts search in the URL", async ({ page }) => {
    test.setTimeout(75_000);

    await devSignIn(page);
    await page.goto("/hr/compliance?complianceAlertsSearch=deadline");
    await expect(page).toHaveURL(/complianceAlertsSearch=deadline/);

    const alertsSection = page.getByTestId(HR_COMPLIANCE_ALERTS_SECTION_TEST_ID);
    await expect(alertsSection).toBeVisible();
    await expect(alertsSection.getByLabel("Search compliance alerts")).toHaveValue(
      "deadline",
    );
  });
});
