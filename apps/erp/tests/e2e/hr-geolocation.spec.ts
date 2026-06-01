import { expect, test } from "@playwright/test";

import {
  hrGeoGeofencesSurfaceKey,
  hrGeoStatsSurfaceKey,
  hrGeoUiCopy,
} from "@afenda/feature-hr-suite/metadata";

import {
  dismissDevSignInPanel,
  skipWhenNeonAuthEnabled,
} from "./support/auth";

async function gotoGeolocationWorkbench(page: import("@playwright/test").Page) {
  await page.goto("/hr/geolocation-remote-checkin", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/hr\/geolocation-remote-checkin/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", {
      name: hrGeoUiCopy.capture.sectionTitle,
    }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "Geolocation access required" }),
  ).not.toBeVisible();
  await dismissDevSignInPanel(page);
}

test.describe("HR geolocation remote check-in", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    skipWhenNeonAuthEnabled();
  });

  test("renders the geolocation workbench with KPI and geofence list", async ({
    page,
  }) => {
    test.setTimeout(360_000);
    await gotoGeolocationWorkbench(page);

    await expect(
      page.getByTestId(`governed-stat-section:${hrGeoStatsSurfaceKey}`),
    ).toBeVisible({ timeout: 240_000 });

    await expect(
      page.getByTestId(`governed-list-section:${hrGeoGeofencesSurfaceKey}`),
    ).toBeVisible({ timeout: 240_000 });
  });
});
