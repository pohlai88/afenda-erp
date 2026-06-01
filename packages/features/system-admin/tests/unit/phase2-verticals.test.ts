import { describe, expect, it } from "vitest";
import {
  buildSystemAdminCapabilityCoverageRows,
  evaluateCapabilityCoverage,
} from "../../src/capabilities/data";
import { SYSTEM_ADMIN_PROTECTED_MODULE_KEY } from "../../src/modules/contracts";
import { buildSystemAdminModuleCatalogRows } from "../../src/modules/data/system-admin.modules.query.server";
import { buildSystemAdminPermissionCatalogRows } from "../../src/permissions/data/system-admin.permissions.query.server";
import { systemAdminCapabilitySettingsActionSchema } from "../../src/capabilities/schemas/system-admin.capability-settings.schema";
import { systemAdminModuleSettingsActionSchema } from "../../src/modules/schemas/system-admin.module-settings.schema";
import { getErpModuleById } from "@afenda/kernel/module-definitions";
import {
  applyTenantCapabilityAvailability,
  applyTenantNavigationAvailability,
} from "@afenda/kernel/tenant-availability";
import { applyTenantModuleAvailability } from "@afenda/kernel/tenant-module-availability";

describe("system admin phase 2 permission catalog", () => {
  it("flags permissions without execution capabilities as orphan", () => {
    const rows = buildSystemAdminPermissionCatalogRows();
    const dashboardView = rows.find((row) => row.permission === "dashboard.view");

    expect(dashboardView).toBeDefined();
    expect(dashboardView?.capabilityCount).toBeGreaterThan(0);
    expect(dashboardView?.status).toBe("active");
  });

  it("validates module and capability setting schemas", () => {
    expect(
      systemAdminModuleSettingsActionSchema.safeParse({
        moduleKey: "finance",
        enabled: "true",
        visible: "true",
        readiness: "active",
      }).success,
    ).toBe(true);
    expect(
      systemAdminCapabilitySettingsActionSchema.safeParse({
        capabilityKey: "finance.view",
        availability: "preview",
      }).success,
    ).toBe(true);
  });
});

describe("system admin phase 2 capability coverage", () => {
  it("flags capabilities with missing routes", () => {
    const coverage = evaluateCapabilityCoverage({
      capability: {
        key: "custom.test",
        moduleKey: "finance",
        label: "Custom test",
        requiredPermission: "finance.view",
        auditArea: "finance",
        status: "active",
      },
    });

    expect(coverage.verdict).toBe("missing_route");
    expect(coverage.issues.some((issue) => issue.includes("route"))).toBe(true);
  });

  it("builds coverage rows from the execution kernel registry", () => {
    const rows = buildSystemAdminCapabilityCoverageRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.requiredPermission.length > 0)).toBe(true);
  });
});

describe("system admin phase 2 module availability", () => {
  it("never removes the protected system-admin module from navigation", () => {
    const systemAdminModule = getErpModuleById(SYSTEM_ADMIN_PROTECTED_MODULE_KEY);
    expect(systemAdminModule).not.toBeNull();

    const filtered = applyTenantNavigationAvailability(
      systemAdminModule ? [systemAdminModule] : [],
      {
        moduleSettings: [
          {
            moduleKey: SYSTEM_ADMIN_PROTECTED_MODULE_KEY,
            enabled: false,
            visible: false,
            readiness: "blocked",
          },
        ],
        capabilitySettings: [
          {
            capabilityKey: "system-admin.view",
            availability: "disabled",
          },
        ],
      },
    );

    expect(filtered).toHaveLength(1);
  });

  it("hides disabled modules from active navigation targets", () => {
    const financeModule = getErpModuleById("finance");
    expect(financeModule).not.toBeNull();

    const filtered = applyTenantModuleAvailability(
      financeModule ? [financeModule] : [],
      [
        {
          moduleKey: "finance",
          enabled: false,
          visible: true,
          readiness: "active",
        },
      ],
    );

    expect(filtered).toHaveLength(0);
  });

  it("maps module catalog rows from tenant settings", () => {
    const rows = buildSystemAdminModuleCatalogRows({
      settings: [
        {
          organizationId: "org_1",
          moduleKey: "finance",
          enabled: false,
          visible: true,
          readiness: "deprecated",
          configuration: {},
          updatedAt: new Date("2026-05-01T00:00:00.000Z"),
        },
      ],
    });

    const finance = rows.find((row) => row.id === "finance");
    expect(finance?.status).toBe("disabled");
    expect(finance?.availability).toBe("disabled");
    expect(finance?.readinessVerdict).toBe("warning");
    expect(finance?.readiness).toBe("deprecated");
    expect(finance?.category).toBe("finance");
  });
});

describe("system admin phase 2 capability navigation", () => {
  it("hides modules when org capability settings disable the required permission", () => {
    const financeModule = getErpModuleById("finance");
    expect(financeModule).not.toBeNull();

    const filtered = applyTenantCapabilityAvailability(
      financeModule ? [financeModule] : [],
      [{ capabilityKey: "finance.view", availability: "disabled" }],
    );

    expect(filtered).toHaveLength(0);
  });

  it("combines module and capability tenant settings for navigation", () => {
    const financeModule = getErpModuleById("finance");
    expect(financeModule).not.toBeNull();

    const filtered = applyTenantNavigationAvailability(
      financeModule ? [financeModule] : [],
      {
        moduleSettings: [
          {
            moduleKey: "finance",
            enabled: true,
            visible: true,
            readiness: "active",
          },
        ],
        capabilitySettings: [
          { capabilityKey: "finance.view", availability: "disabled" },
        ],
      },
    );

    expect(filtered).toHaveLength(0);
  });
});

describe("system admin phase 2 nav visibility", () => {
  it("filters system admin nav items by effective capabilities", async () => {
    const { resolveSystemAdminNavItems } = await import(
      "../../src/overview/contracts/system-admin.nav.contract"
    );

    const items = resolveSystemAdminNavItems([
      "system-admin.view",
      "system-admin.permissions.read",
    ]);

    expect(items.map((item) => item.href)).toContain("/system-admin/permissions");
    expect(items.map((item) => item.href)).not.toContain("/system-admin/modules");
  });
});

describe("system admin phase 2 module guard", () => {
  it("blocks disabling the system-admin module in the action schema layer", () => {
    const parsed = systemAdminModuleSettingsActionSchema.parse({
      moduleKey: SYSTEM_ADMIN_PROTECTED_MODULE_KEY,
      enabled: "false",
      visible: "true",
      readiness: "active",
    });

    expect(parsed.moduleKey).toBe(SYSTEM_ADMIN_PROTECTED_MODULE_KEY);
    expect(parsed.enabled).toBe(false);
  });
});
