import { describe, expect, it } from "vitest";
import {
  isDevAuthBypassEnabled,
  isDevCookieAuthEnabled,
} from "@afenda/config/env";
import {
  capabilitiesForRole,
  isAppCapability,
  normalizeCapabilities,
  normalizeOrganizationSlug,
} from "../../src/index";

describe("auth capabilities", () => {
  it("returns full access for owner role", () => {
    expect(capabilitiesForRole("owner")).toContain("system-admin.view");
    expect(capabilitiesForRole("owner")).toContain("finance.view");
  });

  it("normalizes unknown capabilities using fallback role", () => {
    expect(
      normalizeCapabilities(["finance.view", "invalid"], "viewer"),
    ).toEqual(["finance.view"]);
    expect(normalizeCapabilities(["invalid"], "viewer")).toEqual([
      "dashboard.view",
      "reports.view",
      "reports.documents.read",
    ]);
  });

  it("detects valid app capabilities", () => {
    expect(isAppCapability("sales.view")).toBe(true);
    expect(isAppCapability("sales.write")).toBe(false);
  });

  it("normalizes organization slugs", () => {
    expect(normalizeOrganizationSlug("Afenda Operations!")).toBe(
      "afenda-operations",
    );
  });

  it("only enables dev auth bypass in development", () => {
    expect(
      isDevAuthBypassEnabled({
        NODE_ENV: "development",
        AFENDA_DEV_AUTH_BYPASS: "1",
      }),
    ).toBe(true);
    expect(
      isDevAuthBypassEnabled({
        NODE_ENV: "production",
        AFENDA_DEV_AUTH_BYPASS: "1",
      }),
    ).toBe(false);
  });

  it("only enables dev cookie auth in production for explicit e2e runs", () => {
    expect(
      isDevCookieAuthEnabled({
        NODE_ENV: "production",
        AFENDA_NEON_AUTH_ENABLED: "0",
      }),
    ).toBe(false);
    expect(
      isDevCookieAuthEnabled({
        NODE_ENV: "production",
        AFENDA_NEON_AUTH_ENABLED: "0",
        AFENDA_E2E_DEV_AUTH: "1",
      }),
    ).toBe(true);
  });
});
