import { expect, test } from "@playwright/test";

import {
  systemAdminImportJobsSurfaceKey,
  systemAdminImportTemplatesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoDataManagementWorkbench(
  page: import("@playwright/test").Page,
) {
  await page.goto("/system-admin/data-management", {
    timeout: 60_000,
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/system-admin\/data-management/, {
    timeout: 15_000,
  });
  await dismissDevSignInPanel(page);

  const accessDenied = page.getByTestId(
    "system-admin-data-management-access-denied",
  );
  const pageRoot = page.getByTestId("system-admin-data-management-page");
  const summary = page.getByTestId("system-admin-data-management-summary");
  const templates = page.getByTestId(
    `governed:list-section:${systemAdminImportTemplatesSurfaceKey}`,
  );
  const importJobs = page.getByTestId(
    `governed:list-section:${systemAdminImportJobsSurfaceKey}`,
  );

  await expect(accessDenied.or(pageRoot)).toBeVisible({ timeout: 60_000 });

  if (await accessDenied.isVisible().catch(() => false)) {
    throw new Error(
      "E2E dev session lacks system-admin data-management read access.",
    );
  }

  await expect(page.getByRole("heading", { name: "Data Management" })).toBeVisible();
  await expect(summary).toBeVisible();
  await expect(page.getByTestId("system-admin-data-management-templates")).toBeVisible();
  await expect(templates).toBeVisible();
  await expect(page.getByTestId("system-admin-data-management-import-jobs")).toBeVisible();
  await expect(importJobs).toBeVisible();
}

test.describe("System admin data-management smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads data-management workbench @authenticated", async ({ page }) => {
    test.setTimeout(360_000);
    await gotoDataManagementWorkbench(page);
  });
});
