import { expect, test } from "@playwright/test";

test.describe("Afenda ERP smoke", () => {
  test("redirects unauthenticated home traffic to sign in", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Tenant-aware ERP access",
    );
  });

  test("renders the sign-in page", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: /Sign in to your workspace|Enter the workspace/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sign in|Continue to dashboard/ }),
    ).toBeVisible();
  });

  test("loads dashboard after dev sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    const devSignInButton = page.getByRole("button", {
      name: "Continue to dashboard",
    });

    if (!(await devSignInButton.isVisible())) {
      test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
    }

    await devSignInButton.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Tenant workspace")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Afenda Operations workspace",
      }),
    ).toBeVisible();
  });

  test("loads solution console after dev sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    const devSignInButton = page.getByRole("button", {
      name: "Continue to dashboard",
    });

    if (!(await devSignInButton.isVisible())) {
      test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
    }

    await devSignInButton.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/solution-console");
    await expect(page).toHaveURL(/\/solution-console/);
    await expect(page.getByText("Recovery playbook catalog")).toBeVisible();
    await expect(
      page.getByRole("article").filter({ hasText: "Negative P&L" }).first(),
    ).toBeVisible();
  });

  test("opens a governed module record detail after dev sign-in", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    const devSignInButton = page.getByRole("button", {
      name: "Continue to dashboard",
    });

    if (!(await devSignInButton.isVisible())) {
      test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
    }

    await devSignInButton.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/finance");
    await expect(
      page.getByRole("heading", { level: 1, name: "Finance" }),
    ).toBeVisible();

    await page.goto("/finance/records/finance-milestone-1");
    await expect(page).toHaveURL(/\/finance\/records\/finance-milestone-1/);
    await expect(
      page.getByRole("heading", { level: 1, name: "FINANCE-001" }),
    ).toBeVisible();
    await expect(page.getByText("Governed metadata")).toBeVisible();
    await expect(page.getByText("Audit trail")).toBeVisible();
  });

  test("opens a governed module work item detail after dev sign-in", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    const devSignInButton = page.getByRole("button", {
      name: "Continue to dashboard",
    });

    if (!(await devSignInButton.isVisible())) {
      test.skip(true, "Dev sign-in is unavailable while Neon Auth is active.");
    }

    await devSignInButton.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/finance/work-items/finance-work-item-1");
    await expect(page).toHaveURL(/\/finance\/work-items\/finance-work-item-1/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Introduce journal and subledger domain services.",
      }),
    ).toBeVisible();
    await expect(page.getByText("Work item metadata")).toBeVisible();
    await expect(page.getByText("Audit trail")).toBeVisible();
  });
});

test.describe("Neon Auth smoke", () => {
  test("renders neon sign-in when enabled", async ({ page }) => {
    test.skip(
      process.env.AFENDA_NEON_AUTH_ENABLED !== "1",
      "Requires AFENDA_NEON_AUTH_ENABLED=1 and Neon Auth configuration.",
    );

    await page.goto("/sign-in");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Sign in to your workspace",
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});
