import { describe, expect, it } from "vitest";

import { SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION } from "../../src/features/capabilities/sys-capability-safety.contract";
import { parseSystemAdminCapabilityMatrixRole } from "../../src/features/capabilities/sys-capabilities-matrix-role.shared";
import {
  countDuplicateExecutionCapabilityKeys,
  listUniqueExecutionCapabilities,
} from "../../src/features/capabilities/sys-capabilities-catalog.shared";
import { parseSystemAdminCapabilitySettingsFormData } from "../../src/features/capabilities/sys-capability-settings-form.shared";
import {
  isSystemAdminModuleDisabledForOrg,
  resolveSystemAdminCapabilityOrgAvailability,
} from "../../src/features/capabilities/sys-capabilities-org-settings.shared";
import {
  resolveSystemAdminCapabilityAuditAction,
  systemAdminCapabilityAuditActions,
} from "../../src/features/capabilities/sys-capabilities.event";

describe("capabilities shared helpers", () => {
  it("uses hyphenated audit action keys", () => {
    expect(systemAdminCapabilityAuditActions).toContain(
      "system-admin.capability.enable",
    );
    expect(systemAdminCapabilityAuditActions).toContain(
      "system-admin.capability.disable",
    );
    expect(systemAdminCapabilityAuditActions).not.toContain(
      "system_admin.capability.enable",
    );
  });

  it("parses valid matrix role search params", () => {
    expect(parseSystemAdminCapabilityMatrixRole("owner")).toBe("owner");
    expect(parseSystemAdminCapabilityMatrixRole(["admin"])).toBe("admin");
  });

  it("rejects unknown matrix role values", () => {
    expect(parseSystemAdminCapabilityMatrixRole("not-a-role")).toBeUndefined();
    expect(parseSystemAdminCapabilityMatrixRole(undefined)).toBeUndefined();
  });

  it("resolves preview audit action from availability transition", () => {
    expect(
      resolveSystemAdminCapabilityAuditAction({
        previous: "enabled",
        next: "preview",
      }),
    ).toBe("system-admin.capability.preview");
  });

  it("declares protected bootstrap capability permission constant", () => {
    expect(SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION).toBe(
      "system-admin.settings.read",
    );
  });

  it("resolves enable audit action when previous availability was null", () => {
    expect(
      resolveSystemAdminCapabilityAuditAction({
        previous: null,
        next: "enabled",
      }),
    ).toBe("system-admin.capability.enable");
  });

  it("returns setting update audit action when availability is unchanged", () => {
    expect(
      resolveSystemAdminCapabilityAuditAction({
        previous: "enabled",
        next: "enabled",
      }),
    ).toBe("system-admin.capability_setting.update");
  });

  it("parses capability settings form data with trimmed values", () => {
    const formData = new FormData();
    formData.set("capabilityKey", " finance.view ");
    formData.set("availability", " preview ");

    const parsed = parseSystemAdminCapabilitySettingsFormData(formData);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.capabilityKey).toBe("finance.view");
      expect(parsed.data.availability).toBe("preview");
    }
  });

  it("defaults org availability to enabled when no tenant override exists", () => {
    expect(
      resolveSystemAdminCapabilityOrgAvailability("finance.view", new Map()),
    ).toBe("enabled");
  });

  it("deduplicates duplicate kernel capability keys for catalog rendering", () => {
    const uniqueKeys = listUniqueExecutionCapabilities().map(
      (capability) => capability.key,
    );

    expect(uniqueKeys.length).toBe(new Set(uniqueKeys).size);
    expect(countDuplicateExecutionCapabilityKeys()).toBeGreaterThanOrEqual(0);
  });

  it("treats hidden parent modules as disabled for org coverage", () => {
    const settingsByModule = new Map([
      [
        "finance",
        {
          organizationId: "org_1",
          moduleKey: "finance",
          enabled: true,
          visible: false,
          readiness: "active" as const,
          configuration: {},
          updatedAt: new Date("2026-01-01"),
        },
      ],
    ]);

    expect(isSystemAdminModuleDisabledForOrg("finance", settingsByModule)).toBe(
      true,
    );
  });
});
