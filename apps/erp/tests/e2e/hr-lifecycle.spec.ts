import { expect, test } from "@playwright/test";

import {
  getHrLifecycleListSurfaceKeys,
  hrLifecycleAuditTrailSearchParam,
  hrLifecycleOverviewSearchParam,
  hrLifecyclePendingTransitionsSearchParam,
  hrLifecycleProbationDueSearchParam,
  HR_LIFECYCLE_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrLifecyclePendingTransitionsSurfaceKey,
} from "@afenda/feature-hr-suite/metadata";
import { governedListSectionTestId } from "@afenda/governed-surface";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoLifecycleWorkbench(
  page: import("@playwright/test").Page,
  search = "",
) {
  const path = search ? `/hr/lifecycle?${search}` : "/hr/lifecycle";
  await page.goto(path, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/hr\/lifecycle/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: "Employee lifecycle" }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "Access restricted" }),
  ).not.toBeVisible();
  await expect(
    page.locator('[data-testid^="governed-list-section:"]').first(),
  ).toBeVisible({ timeout: 240_000 });
  await dismissDevSignInPanel(page);
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

function sectionSearchInput(
  section: import("@playwright/test").Locator,
  name: string,
) {
  return section.getByRole("textbox", { name });
}

test.describe("HR lifecycle workbench", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("renders pending transitions first on the workbench", async ({ page }) => {
    test.setTimeout(360_000);

    await gotoLifecycleWorkbench(page);

    const pendingSection = await expectGovernedSectionVisible(
      page,
      getHrLifecycleListSurfaceKeys()[0]!,
    );
    await expect(pendingSection.getByText("Scheduled transitions")).toBeVisible();
    await expect(
      sectionSearchInput(pendingSection, "Search scheduled transitions"),
    ).toBeVisible();

    const probationSection = await expectGovernedSectionVisible(
      page,
      getHrLifecycleListSurfaceKeys()[1]!,
    );

    const pendingBox = await pendingSection.boundingBox();
    const probationBox = await probationSection.boundingBox();
    expect(pendingBox).toBeTruthy();
    expect(probationBox).toBeTruthy();
    expect(pendingBox!.y).toBeLessThan(probationBox!.y);
  });

  test("preserves pending transitions search in the URL", async ({ page }) => {
    test.setTimeout(360_000);

    await gotoLifecycleWorkbench(
      page,
      `${hrLifecyclePendingTransitionsSearchParam}=lifecycle-e2e-query`,
    );

    const section = await expectGovernedSectionVisible(
      page,
      hrLifecyclePendingTransitionsSurfaceKey,
    );
    const searchInput = sectionSearchInput(
      section,
      "Search scheduled transitions",
    );
    await expect(searchInput).toHaveValue("lifecycle-e2e-query");
    await expect(page).toHaveURL(/lifecyclePendingTransitionsSearch=lifecycle-e2e-query/);
  });

  test("preserves overview roster search in the URL", async ({ page }) => {
    test.setTimeout(360_000);

    await gotoLifecycleWorkbench(
      page,
      `${hrLifecycleOverviewSearchParam}=overview-e2e-query`,
    );

    const overviewKey = getHrLifecycleListSurfaceKeys()[5]!;
    const section = await expectGovernedSectionVisible(page, overviewKey);
    await expect(
      sectionSearchInput(section, "Search employees"),
    ).toHaveValue("overview-e2e-query");
  });

  test("registers audit trail as read-only without row actions", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await gotoLifecycleWorkbench(
      page,
      `${hrLifecycleAuditTrailSearchParam}=audit-e2e-query`,
    );

    const auditKey = getHrLifecycleListSurfaceKeys()[6]!;
    expect(HR_LIFECYCLE_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(auditKey)).toBe(
      true,
    );

    const section = await expectGovernedSectionVisible(page, auditKey);
    await expect(
      sectionSearchInput(section, "Search audit trail"),
    ).toHaveValue("audit-e2e-query");
    await expect(section.getByRole("columnheader", { name: "Actions" })).toHaveCount(
      0,
    );
  });

  test("shows exit pathways panel for writers", async ({ page }) => {
    test.setTimeout(360_000);

    await gotoLifecycleWorkbench(page);

    await expect(page.getByRole("heading", { name: "Exit pathways" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Initiate notice period" }),
    ).toBeVisible();
  });

  test("shows movement panel for writers", async ({ page }) => {
    test.setTimeout(360_000);

    await gotoLifecycleWorkbench(
      page,
      `${hrLifecycleProbationDueSearchParam}=probation-e2e`,
    );

    await expect(page.getByRole("heading", { name: "Record movement" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Record movement" }),
    ).toBeVisible();
  });
});
