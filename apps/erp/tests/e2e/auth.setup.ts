import fs from "node:fs";
import path from "node:path";

import { expect, test as setup } from "@playwright/test";

import {
  AFENDA_SESSION_COOKIE,
  DEMO_ORG_ID,
  DEMO_ORG_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  DEMO_USER_NAME,
  DEV_SESSION_MAX_AGE_SECONDS,
  userSessionSchema,
} from "@afenda/auth";

import { baseURL, PLAYWRIGHT_ARTIFACTS } from "./playwright.shared.cjs";

function createE2eDevSessionCookie() {
  const session = userSessionSchema.parse({
    source: "dev",
    id: DEMO_USER_ID,
    name: DEMO_USER_NAME,
    email: DEMO_USER_EMAIL,
    activeOrganizationId: DEMO_ORG_ID,
    organizations: [
      {
        membershipId: "member_demo_owner",
        id: DEMO_ORG_ID,
        name: DEMO_ORG_NAME,
        slug: "afenda-operations",
        locale: "en-MY",
        role: "owner",
        capabilities: ["dashboard.view"],
      },
    ],
  });

  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

setup("persist dev sign-in storage state", async ({ page }) => {
  const authFile = PLAYWRIGHT_ARTIFACTS.authState;
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.rmSync(authFile, { force: true });

  if (process.env.AFENDA_NEON_AUTH_ENABLED === "1") {
    fs.writeFileSync(
      authFile,
      JSON.stringify({ cookies: [], origins: [] }, null, 2),
    );
    setup.skip(true, "Neon Auth active — HR authenticated E2E is skipped.");
    return;
  }

  await page.context().addCookies([
    {
      name: AFENDA_SESSION_COOKIE,
      value: createE2eDevSessionCookie(),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      expires: Math.floor(Date.now() / 1000) + DEV_SESSION_MAX_AGE_SECONDS,
    },
  ]);

  const cookies = await page.context().cookies();
  expect(
    cookies.some((cookie) => cookie.name === AFENDA_SESSION_COOKIE),
  ).toBe(true);

  await page.goto("/dashboard", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });

  await page.context().storageState({ path: authFile });
});
