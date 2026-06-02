import { describe, expect, it } from "vitest";
import { resolveDevSignInRedirectPath } from "@/routes/auth/dev-sign-in-redirect";

describe("developer sign-in redirect", () => {
  it("falls back to dashboard when no current route is available", () => {
    expect(resolveDevSignInRedirectPath({})).toBe("/dashboard");
  });

  it("accepts safe internal form redirect paths", () => {
    expect(
      resolveDevSignInRedirectPath({
        formValue: "/finance?view=open#activity",
      }),
    ).toBe("/finance?view=open#activity");
  });

  it("rejects auth, onboarding, api, and external redirects", () => {
    expect(resolveDevSignInRedirectPath({ formValue: "/sign-in" })).toBe(
      "/dashboard",
    );
    expect(resolveDevSignInRedirectPath({ formValue: "/onboarding" })).toBe(
      "/dashboard",
    );
    expect(
      resolveDevSignInRedirectPath({ formValue: "/api/auth/session" }),
    ).toBe("/dashboard");
    expect(resolveDevSignInRedirectPath({ formValue: "//example.com" })).toBe(
      "/dashboard",
    );
  });

  it("uses the same-origin referer for floating panel submissions", () => {
    expect(
      resolveDevSignInRedirectPath({
        origin: "http://localhost:3100",
        referer: "http://localhost:3100/finance/work-items/finance-work-item-1",
      }),
    ).toBe("/finance/work-items/finance-work-item-1");
  });

  it("rejects cross-origin referers", () => {
    expect(
      resolveDevSignInRedirectPath({
        origin: "http://localhost:3100",
        referer: "https://example.com/finance",
      }),
    ).toBe("/dashboard");
  });
});
