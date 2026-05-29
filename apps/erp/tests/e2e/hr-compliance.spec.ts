import { expect, test } from "@playwright/test";

import {
  getHrComplianceListSurfaceKeys,
  hrComplianceAuditTrailSearchParam,
  hrComplianceReviewQueueSearchParam,
  hrComplianceExceptionSearchParam,
  hrComplianceExceptionsSurfaceKey,
  HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS,
} from "@afenda/feature-hr-suite/metadata";
import { governedListSectionTestId } from "@afenda/governed-surface";

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

async function gotoComplianceWorkbench(
  page: import("@playwright/test").Page,
  search = "",
) {
  const path = search ? `/hr/compliance?${search}` : "/hr/compliance";
  await page.goto(path, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/hr\/compliance/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: "Compliance" }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "Access restricted" }),
  ).not.toBeVisible();
  await expect(
    page.locator('[data-testid^="governed-list-section:"]').first(),
  ).toBeVisible({ timeout: 240_000 });
}

async function expectGovernedSectionVisible(
  page: import("@playwright/test").Page,
  surfaceKey: string,
) {
  const section = page.getByTestId(governedListSectionTestId(surfaceKey));
  await expect(section).toBeVisible({ timeout: 120_000 });
  await section.scrollIntoViewIfNeeded();
  return section;
}

function exceptionsListSection(page: import("@playwright/test").Page) {
  return page.getByTestId(
    governedListSectionTestId(hrComplianceExceptionsSurfaceKey),
  );
}

function sectionSearchInput(
  section: import("@playwright/test").Locator,
  name: string,
) {
  return section.getByRole("textbox", { name });
}

test.describe("HR compliance workbench", () => {
  test.describe.configure({ mode: "serial" });

  test("renders compliance alerts first on the workbench", async ({ page }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(page);

    const alertsSection = await expectGovernedSectionVisible(
      page,
      getHrComplianceListSurfaceKeys()[0]!,
    );
    await expect(alertsSection.getByText("Compliance alerts")).toBeVisible();
    await expect(
      sectionSearchInput(alertsSection, "Search compliance alerts"),
    ).toBeVisible();

    const reviewQueueSection = await expectGovernedSectionVisible(
      page,
      getHrComplianceListSurfaceKeys()[1]!,
    );

    const alertsBox = await alertsSection.boundingBox();
    const reviewQueueBox = await reviewQueueSection.boundingBox();
    expect(alertsBox).toBeTruthy();
    expect(reviewQueueBox).toBeTruthy();
    expect(alertsBox!.y).toBeLessThan(reviewQueueBox!.y);

    const emptyState = alertsSection.getByText("No active compliance alerts");
    const alertTable = alertsSection.getByRole("columnheader", {
      name: "Severity",
    });

    await expect(emptyState.or(alertTable)).toBeVisible();
  });

  test("preserves compliance alerts search in the URL", async ({ page }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(page, "complianceAlertsSearch=deadline");
    await expect(page).toHaveURL(/complianceAlertsSearch=deadline/);

    const alertsSection = await expectGovernedSectionVisible(
      page,
      getHrComplianceListSurfaceKeys()[0]!,
    );
    await expect(
      sectionSearchInput(alertsSection, "Search compliance alerts"),
    ).toHaveValue("deadline");
  });

  test("renders all fifteen governed Pattern C list sections", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(page);

    const surfaceKeys = getHrComplianceListSurfaceKeys();
    expect(surfaceKeys).toHaveLength(15);

    for (const surfaceKey of surfaceKeys) {
      await expectGovernedSectionVisible(page, surfaceKey);
    }

    expect(HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS.size).toBe(3);
  });

  test("preserves compliance exception search in the URL", async ({ page }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(
      page,
      `${hrComplianceExceptionSearchParam}=overdue`,
    );
    await expect(page).toHaveURL(
      new RegExp(`${hrComplianceExceptionSearchParam}=overdue`),
    );

    const exceptionsSection = await expectGovernedSectionVisible(
      page,
      hrComplianceExceptionsSurfaceKey,
    );
    await expect(
      exceptionsSection.getByText("Open exceptions", { exact: true }),
    ).toBeVisible();
    await expect(
      sectionSearchInput(exceptionsSection, "Search exceptions"),
    ).toHaveValue("overdue");
  });

  test("preserves compliance evidence links search in the URL", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(page, "complianceEvidenceLinksSearch=permit");
    await expect(page).toHaveURL(/complianceEvidenceLinksSearch=permit/);

    const evidenceSection = await expectGovernedSectionVisible(
      page,
      "hr.workforce.compliance.evidence-links.list",
    );
    await expect(
      evidenceSection.getByText("Compliance evidence unavailable"),
    ).not.toBeVisible();
    await expect(
      evidenceSection.getByText("Evidence link register", { exact: true }),
    ).toBeVisible();
    await expect(
      sectionSearchInput(evidenceSection, "Search evidence links"),
    ).toHaveValue("permit");
  });

  test("preserves compliance review queue search in the URL", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(
      page,
      `${hrComplianceReviewQueueSearchParam}=filing.confirmation`,
    );
    await expect(page).toHaveURL(
      new RegExp(`${hrComplianceReviewQueueSearchParam}=filing\\.confirmation`),
    );

    const reviewQueueSection = await expectGovernedSectionVisible(
      page,
      "hr.workforce.compliance.review-queue.list",
    );
    await expect(
      reviewQueueSection.getByText("Compliance review queue", { exact: true }),
    ).toBeVisible();
    await expect(
      sectionSearchInput(reviewQueueSection, "Search review queue"),
    ).toHaveValue("filing.confirmation");
  });

  test("preserves compliance audit trail search in the URL", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(
      page,
      `${hrComplianceAuditTrailSearchParam}=filing.update`,
    );
    await expect(page).toHaveURL(
      new RegExp(`${hrComplianceAuditTrailSearchParam}=filing\\.update`),
    );

    const auditTrailSection = await expectGovernedSectionVisible(
      page,
      "hr.workforce.compliance.audit-trail.list",
    );
    await expect(
      auditTrailSection.getByText("Audit events", { exact: true }),
    ).toBeVisible();
    await expect(
      sectionSearchInput(auditTrailSection, "Search audit trail"),
    ).toHaveValue("filing.update");
  });

  test("assigns corrective action and records progress via trailing forms (HRM-CMP-018/019)", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await devSignIn(page);
    await gotoComplianceWorkbench(page);

    const uniqueTitle = `E2E corrective ${Date.now()}`;

    const createTitleField = page.locator("#exception-title");
    await createTitleField.scrollIntoViewIfNeeded();
    await expect(createTitleField).toBeVisible({ timeout: 90_000 });
    await createTitleField.fill(uniqueTitle);
    await page.locator("#exception-type").fill("manual_gap");
    await page.getByRole("button", { name: "Create exception" }).click();

    const exceptionsSection = exceptionsListSection(page);
    await exceptionsSection.scrollIntoViewIfNeeded();

    const exceptionRow = exceptionsSection
      .getByRole("row")
      .filter({ hasText: uniqueTitle });
    await expect(exceptionRow).toBeVisible({ timeout: 30_000 });

    const assignForm = exceptionRow.locator("form").filter({
      has: page.getByRole("button", { name: "Assign corrective action" }),
    });
    await expect(assignForm).toBeVisible();

    const ownerSelect = assignForm.locator(
      'select[name="correctiveActionOwnerEmployeeId"]',
    );
    const ownerOptions = ownerSelect.locator("option");
    const ownerOptionCount = await ownerOptions.count();
    if (ownerOptionCount <= 1) {
      test.skip(true, "No active employees available for corrective owner picker.");
    }

    await assignForm
      .locator('input[name="correctiveActionDescription"]')
      .fill("E2E corrective plan");
    await ownerSelect.selectOption({ index: 1 });
    await assignForm
      .locator('input[name="correctiveActionDueDate"]')
      .fill("2026-12-31T12:00");
    await assignForm
      .getByRole("button", { name: "Assign corrective action" })
      .click();

    await expect(exceptionRow.getByText("In progress")).toBeVisible({
      timeout: 30_000,
    });

    const progressForm = exceptionRow.locator("form").filter({
      has: page.getByRole("button", { name: "Update progress" }),
    });
    await expect(progressForm).toBeVisible();
    await progressForm
      .locator('input[name="progressNote"]')
      .fill("E2E progress note");
    await progressForm.getByRole("button", { name: "Update progress" }).click();

    const resolveForm = exceptionRow.locator("form").filter({
      has: page.getByRole("button", { name: "Resolve" }),
    });
    await resolveForm
      .locator('input[name="resolutionNote"]')
      .fill("E2E resolved");
    await resolveForm.getByRole("button", { name: "Resolve" }).click();

    await expect(exceptionRow).toHaveCount(0, { timeout: 30_000 });
  });
});
