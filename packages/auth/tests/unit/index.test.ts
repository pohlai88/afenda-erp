import { describe, expect, it } from "vitest";
import {
  isDevAuthBypassEnabled,
  isDevCookieAuthEnabled,
} from "@afenda/config/env";
import {
  buildOperatingContextSwitchOptions,
  capabilitiesForRole,
  isAppCapability,
  normalizeCapabilities,
  normalizeOrganizationSlug,
  organizationSummarySchema,
  readOrganizationOperatingContextLabels,
  resolveOrganizationOperatingContext,
} from "../../src/index";

describe("auth capabilities", () => {
  it("returns full access for owner role", () => {
    expect(capabilitiesForRole("owner")).toContain("system-admin.view");
    expect(capabilitiesForRole("owner")).toContain("system-admin.roles.manage");
    expect(capabilitiesForRole("owner")).toContain("finance.view");
  });

  it("does not grant granular admin permissions to non-admin roles", () => {
    expect(capabilitiesForRole("staff")).not.toContain(
      "system-admin.roles.manage",
    );
    expect(capabilitiesForRole("viewer")).not.toContain(
      "system-admin.diagnostics.read",
    );
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

  it("backfills legacy session organizations with execution defaults", () => {
    const organization = organizationSummarySchema.parse({
      id: "org_123",
      name: "Afenda Operations",
      slug: "afenda-operations",
      role: "owner",
      capabilities: ["dashboard.view"],
    });

    expect(organization.membershipId).toBe("member_demo_owner");
    expect(organization.locale).toBe("en-MY");
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

  it("keeps dev cookie auth available in local development with Neon Auth configured", () => {
    expect(
      isDevCookieAuthEnabled({
        NODE_ENV: "development",
        AFENDA_NEON_AUTH_ENABLED: "1",
        NEON_AUTH_BASE_URL: "http://localhost:3000/api/auth",
        NEON_AUTH_COOKIE_SECRET: "x".repeat(32),
      }),
    ).toBe(true);
    expect(
      isDevCookieAuthEnabled({
        NODE_ENV: "production",
        AFENDA_NEON_AUTH_ENABLED: "1",
        AFENDA_E2E_DEV_AUTH: "1",
        NEON_AUTH_BASE_URL: "https://example.com/api/auth",
        NEON_AUTH_COOKIE_SECRET: "x".repeat(32),
      }),
    ).toBe(false);
  });
});

describe("operating context labels", () => {
  it("reads tenant branding labels from tenant_settings.branding", () => {
    expect(
      readOrganizationOperatingContextLabels({
        operatingContext: {
          tenantLabel: "DLB Group",
          groupLabel: "DLBB",
          companyLabel: "De Lettuce Bear Berhad",
        },
      }),
    ).toEqual({
      tenantLabel: "DLB Group",
      groupLabel: "DLBB",
      companyLabel: "De Lettuce Bear Berhad",
    });
  });

  it("ignores invalid branding payloads", () => {
    expect(
      readOrganizationOperatingContextLabels({
        operatingContext: { tenantLabel: "" },
      }),
    ).toBeUndefined();
  });

  it("resolves operating context with hierarchy fallbacks", () => {
    expect(
      resolveOrganizationOperatingContext(
        {
          name: "Afenda Operations",
          slug: "afenda-operations",
          operatingContextLabels: {
            tenantLabel: "Footer Group",
            companyLabel: "Footer Marketing Sdn Bhd",
          },
        },
        "Dashboard",
      ),
    ).toEqual({
      tenantLabel: "Footer Group",
      companyLabel: "Footer Marketing Sdn Bhd",
      organizationLabel: "afenda-operations",
      workspaceLabel: "Dashboard",
    });
  });

  it("falls back to organization name when branding labels are absent", () => {
    expect(
      resolveOrganizationOperatingContext({
        name: "Afenda Operations",
        slug: "afenda-operations",
      }),
    ).toEqual({
      tenantLabel: "Afenda Operations",
      organizationLabel: "afenda-operations",
    });
  });

  it("builds switch options only when the user has multiple organizations", () => {
    const organizations = [
      {
        id: "org_a",
        name: "Org A",
        slug: "org-a",
        operatingContextLabels: {
          tenantLabel: "Group A",
          companyLabel: "Company A",
        },
      },
      {
        id: "org_b",
        name: "Org B",
        slug: "org-b",
      },
    ] as const;

    expect(buildOperatingContextSwitchOptions(organizations, "org_a")).toEqual([
      {
        organizationId: "org_a",
        tenantLabel: "Group A",
        companyLabel: "Company A",
        organizationLabel: "org-a",
        isActive: true,
      },
      {
        organizationId: "org_b",
        tenantLabel: "Org B",
        organizationLabel: "org-b",
        isActive: false,
      },
    ]);
    expect(buildOperatingContextSwitchOptions([organizations[0]], "org_a")).toBeUndefined();
  });
});
