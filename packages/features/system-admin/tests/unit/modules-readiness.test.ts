import { describe, expect, it } from "vitest";
import { filterSystemAdminListRows } from "../../src/overview/contracts/system-admin.list-filter.shared";
import { resolveSystemAdminModuleAuditAction } from "../../src/modules/events/system-admin.modules.event";
import { buildSystemAdminModuleCatalogRows } from "../../src/modules/data/system-admin.modules.query.server";
import {
  listDisabledModuleDependencyKeys,
  resolveSystemAdminModuleAvailability,
  resolveSystemAdminModuleReadinessVerdict,
} from "../../src/modules/contracts";
import { resolveSystemAdminModuleRowTrailingAction } from "../../src/modules/surface/system-admin.modules-list-trailing.shared";

describe("system admin modules readiness", () => {
  it("maps tenant settings to availability and readiness verdict", () => {
    expect(
      resolveSystemAdminModuleAvailability({
        organizationId: "org_1",
        moduleKey: "finance",
        enabled: true,
        visible: true,
        readiness: "preview",
        configuration: {},
        updatedAt: new Date(),
      }),
    ).toBe("preview");

    expect(
      resolveSystemAdminModuleReadinessVerdict({
        moduleKey: "finance",
        setting: {
          organizationId: "org_1",
          moduleKey: "finance",
          enabled: true,
          visible: true,
          readiness: "blocked",
          configuration: {},
          updatedAt: new Date(),
        },
        settings: [],
        capabilityCount: 4,
        enabledRoleCount: 2,
      }),
    ).toBe("blocked");
  });

  it("blocks readiness when declared dependencies are disabled", () => {
    const settings = [
      {
        organizationId: "org_1",
        moduleKey: "inventory",
        enabled: false,
        visible: true,
        readiness: "active" as const,
        configuration: {},
        updatedAt: new Date(),
      },
      {
        organizationId: "org_1",
        moduleKey: "purchasing",
        enabled: true,
        visible: true,
        readiness: "active" as const,
        configuration: {},
        updatedAt: new Date(),
      },
    ];

    expect(
      listDisabledModuleDependencyKeys({
        moduleKey: "purchasing",
        settings,
      }),
    ).toEqual(["inventory"]);

    expect(
      resolveSystemAdminModuleReadinessVerdict({
        moduleKey: "purchasing",
        setting: settings[1],
        settings,
        capabilityCount: 3,
        enabledRoleCount: 2,
      }),
    ).toBe("blocked");
  });

  it("selects granular audit actions from setting transitions", () => {
    expect(
      resolveSystemAdminModuleAuditAction({
        previous: {
          enabled: true,
          visible: true,
          readiness: "active",
        },
        next: {
          enabled: false,
          visible: true,
          readiness: "active",
        },
      }),
    ).toBe("system-admin.module.disable");

    expect(
      resolveSystemAdminModuleAuditAction({
        previous: {
          enabled: true,
          visible: true,
          readiness: "active",
        },
        next: {
          enabled: true,
          visible: false,
          readiness: "active",
        },
      }),
    ).toBe("system-admin.module_visibility.update");
  });

  it("filters module catalog rows for toolbar search", () => {
    const rows = buildSystemAdminModuleCatalogRows({ settings: [], policySettings: [] });
    const filtered = filterSystemAdminListRows(rows, "finance", [
      "module",
      "id",
      "category",
    ]);

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((row) => row.module.toLowerCase().includes("finance"))).toBe(
      true,
    );
  });

  it("exposes enable/disable trailing actions for mutable module rows", () => {
    const enableAction = resolveSystemAdminModuleRowTrailingAction({
      moduleKey: "finance",
      availability: "disabled",
      canMutate: true,
    });
    expect(enableAction?.descriptor?.label).toBe("Enable");

    const deprecatedEnableAction = resolveSystemAdminModuleRowTrailingAction({
      moduleKey: "finance",
      availability: "disabled",
      canMutate: true,
      lifecycleStatus: "deprecated",
    });
    expect(deprecatedEnableAction?.descriptor?.confirm?.title).toBe(
      "Enable deprecated module",
    );

    const criticalDisableAction = resolveSystemAdminModuleRowTrailingAction({
      moduleKey: "dashboard",
      availability: "enabled",
      canMutate: true,
    });
    expect(criticalDisableAction?.descriptor?.confirm?.title).toBe(
      "Disable critical module",
    );

    const protectedAction = resolveSystemAdminModuleRowTrailingAction({
      moduleKey: "system-admin",
      availability: "enabled",
      canMutate: true,
    });
    expect(protectedAction?.state).toBe("disabled");
  });
});
