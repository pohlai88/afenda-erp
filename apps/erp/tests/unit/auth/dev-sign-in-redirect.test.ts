import { describe, expect, it } from "vitest";
import { resolveDevSignInRedirectPath } from "@/kitchen-sinks/auth-dev-sign-in.redirect";

describe("developer sign-in redirect", () => {
  it("falls back to onboarding when no current route is available", () => {
    expect(resolveDevSignInRedirectPath({})).toBe("/onboarding");
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
      "/onboarding",
    );
    expect(resolveDevSignInRedirectPath({ formValue: "/onboarding" })).toBe(
      "/onboarding",
    );
    expect(
      resolveDevSignInRedirectPath({ formValue: "/api/auth/session" }),
    ).toBe("/onboarding");
    expect(resolveDevSignInRedirectPath({ formValue: "//example.com" })).toBe(
      "/onboarding",
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
    ).toBe("/onboarding");
  });
});
