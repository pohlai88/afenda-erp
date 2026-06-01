import { expect, test } from "@playwright/test";

import {
  getHrDocumentsListSurfaceKeys,
  hrDocumentsRepositorySearchParam,
  hrDocumentsRepositorySurfaceKey,
  hrDocumentsUiCopy,
} from "@afenda/feature-hr-suite/metadata";
import { governedListSectionTestId } from "@afenda/governed-surface";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoDocumentsWorkbench(
  page: import("@playwright/test").Page,
  search = "",
) {
  const path = search ? `/hr/documents?${search}` : "/hr/documents";
  await page.goto(path, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/hr\/documents/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: hrDocumentsUiCopy.page.title }),
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

test.describe("HR documents workbench", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("renders documents overview and repository without access denied", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await gotoDocumentsWorkbench(page);

    await expect(
      page.getByRole("heading", { name: hrDocumentsUiCopy.overview.sectionTitle }),
    ).toBeVisible();

    const repositorySection = await expectGovernedSectionVisible(
      page,
      getHrDocumentsListSurfaceKeys()[0]!,
    );
    await expect(
      repositorySection.getByText(
        `${hrDocumentsUiCopy.repository.sectionTitle} unavailable`,
      ),
    ).not.toBeVisible();
    await expect(
      sectionSearchInput(
        repositorySection,
        hrDocumentsUiCopy.repository.searchLabel,
      ),
    ).toBeVisible({ timeout: 120_000 });
  });

  test("preserves repository search in the URL", async ({ page }) => {
    test.setTimeout(360_000);

    const query = "passport-scan";
    await gotoDocumentsWorkbench(
      page,
      `${hrDocumentsRepositorySearchParam}=${encodeURIComponent(query)}`,
    );

    const repositorySection = await expectGovernedSectionVisible(
      page,
      hrDocumentsRepositorySurfaceKey,
    );
    await expect(
      repositorySection.getByText(
        `${hrDocumentsUiCopy.repository.sectionTitle} unavailable`,
      ),
    ).not.toBeVisible();
    await expect(
      sectionSearchInput(
        repositorySection,
        hrDocumentsUiCopy.repository.searchLabel,
      ),
    ).toHaveValue(query);
    await expect(page).toHaveURL(
      new RegExp(`${hrDocumentsRepositorySearchParam}=${query}`),
    );
  });
});
