import { expect, test } from "@playwright/test";

import {
  hrGeoGeofencesSurfaceKey,
  hrGeoStatsSurfaceKey,
} from "@afenda/feature-hr-suite/metadata";

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

async function gotoGeolocationWorkbench(page: import("@playwright/test").Page) {
  await page.goto("/hr/geolocation-remote-checkin", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/hr\/geolocation-remote-checkin/, {
    timeout: 15_000,
  });
  await expect(
    page.getByText("Geolocation & Remote Check-In", { exact: true }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "Geolocation access required" }),
  ).not.toBeVisible();
  await dismissDevSignInPanel(page);
}

test.describe("HR geolocation remote check-in", () => {
  test.describe.configure({ mode: "serial" });

  test("renders the geolocation workbench with KPI and geofence list", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await devSignIn(page);
    await gotoGeolocationWorkbench(page);

    await expect(
      page.getByTestId(`governed-stat-section:${hrGeoStatsSurfaceKey}`),
    ).toBeVisible({ timeout: 240_000 });

    await expect(
      page.getByTestId(`governed-list-section:${hrGeoGeofencesSurfaceKey}`),
    ).toBeVisible({ timeout: 240_000 });
  });
});
