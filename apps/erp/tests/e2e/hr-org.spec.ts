import { expect, test } from "@playwright/test";

import {
  getHrOrgListSurfaceKeys,
  hrOrgUnitsSearchParam,
  hrOrgUnitsSurfaceKey,
  hrOrgUiCopy,
} from "@afenda/feature-hr-suite/metadata";
import { governedListSectionTestId } from "@afenda/governed-surface";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoOrgWorkbench(
  page: import("@playwright/test").Page,
  search = "",
) {
  const path = search ? `/hr/org?${search}` : "/hr/org";
  await page.goto(path, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/hr\/org/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: hrOrgUiCopy.page.title }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "Access restricted" }),
  ).not.toBeVisible();
  await expect(
    page.locator('[data-testid^="governed:list-section:"]').first(),
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

test.describe("HR organization workbench", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("renders org overview, chart, and units list without access denied", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await gotoOrgWorkbench(page);

    await expect(
      page.getByRole("heading", { name: hrOrgUiCopy.orgChart.title }),
    ).toBeVisible();

    const unitsSection = await expectGovernedSectionVisible(
      page,
      getHrOrgListSurfaceKeys()[0]!,
    );
    await expect(
      unitsSection.getByText(
        `${hrOrgUiCopy.units.surfaceHeaderTitle} unavailable`,
      ),
    ).not.toBeVisible();
    await expect(
      sectionSearchInput(unitsSection, hrOrgUiCopy.units.searchLabel),
    ).toBeVisible({ timeout: 120_000 });
  });

  test("preserves organization units search in the URL", async ({ page }) => {
    test.setTimeout(360_000);

    const query = "operations";
    await gotoOrgWorkbench(
      page,
      `${hrOrgUnitsSearchParam}=${encodeURIComponent(query)}`,
    );

    const unitsSection = await expectGovernedSectionVisible(
      page,
      hrOrgUnitsSurfaceKey,
    );
    await expect(
      unitsSection.getByText(
        `${hrOrgUiCopy.units.surfaceHeaderTitle} unavailable`,
      ),
    ).not.toBeVisible();
    await expect(
      sectionSearchInput(unitsSection, hrOrgUiCopy.units.searchLabel),
    ).toHaveValue(query);
    await expect(page).toHaveURL(
      new RegExp(`${hrOrgUnitsSearchParam}=${query}`),
    );
  });
});
