import { expect, test } from "@playwright/test";

import {
  systemAdminCapabilitiesSurfaceKey,
  systemAdminCapabilityRoleMatrixSurfaceKey,
} from "@afenda/feature-system-admin/metadata";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoCapabilitiesWorkbench(page: import("@playwright/test").Page) {
  await page.goto("/system-admin/capabilities", {
    timeout: 60_000,
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/system-admin\/capabilities/, {
    timeout: 15_000,
  });
  await dismissDevSignInPanel(page);

  const accessDenied = page.getByTestId("system-admin-capabilities-access-denied");
  const pageRoot = page.getByTestId("system-admin-capabilities-page");
  const catalog = page.getByTestId(
    `governed:list-section:${systemAdminCapabilitiesSurfaceKey}`,
  );
  const roleMatrix = page.getByTestId(
    `governed:list-section:${systemAdminCapabilityRoleMatrixSurfaceKey}`,
  );

  await expect(accessDenied.or(pageRoot)).toBeVisible({ timeout: 60_000 });

  if (await accessDenied.isVisible().catch(() => false)) {
    throw new Error(
      "E2E dev session lacks system-admin capabilities read access.",
    );
  }

  await expect(page.getByRole("heading", { name: "Capabilities" })).toBeVisible();
  await expect(page.getByTestId("system-admin-capabilities-catalog")).toBeVisible();
  await expect(catalog).toBeVisible();
  await expect(page.getByTestId("system-admin-capabilities-role-matrix")).toBeVisible();
  await expect(roleMatrix).toBeVisible();
}

test.describe("System admin capabilities smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("loads capability catalog and role matrix @authenticated", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await gotoCapabilitiesWorkbench(page);
  });

  test("preserves matrixRole filter in role matrix @authenticated", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await page.goto("/system-admin/capabilities?matrixRole=owner", {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });
    await dismissDevSignInPanel(page);

    await expect(page).toHaveURL(/matrixRole=owner/);
    await expect(page.getByTestId("system-admin-capabilities-role-matrix")).toBeVisible();
    await gotoCapabilitiesWorkbench(page);
  });
});
