import { describe, expect, it } from "vitest";
import { appCapabilities } from "@afenda/kernel";
import {
  getSystemAdminLynxOutcomeMonitorThresholdCatalog,
} from "../../src/features/lynx/sys-lynx-outcome-monitor-catalog.contract";
import {
  isSystemAdminApiScope,
  isSystemAdminWebhookEvent,
  systemAdminApiScopes,
  systemAdminDefaultWebhookEventPresets,
  systemAdminWebhookEvents,
} from "../../src/features/integrations/sys-integrations-catalog.contract";
import {
  isSystemAdminPermissionKey,
  systemAdminPermissionCatalog,
} from "../../src/features/permissions/sys-permission-catalog.contract";

describe("system admin catalogs", () => {
  it("backs RBAC override selection with the app capability catalog", () => {
    expect(systemAdminPermissionCatalog.map((entry) => entry.value)).toEqual(
      appCapabilities,
    );
    expect(isSystemAdminPermissionKey("system-admin.audit.read")).toBe(true);
    expect(isSystemAdminPermissionKey("system-admin.roles.manage")).toBe(true);
    expect(isSystemAdminPermissionKey("system-admin.diagnostics.read")).toBe(
      true,
    );
    expect(isSystemAdminPermissionKey("system-admin.data-management.run")).toBe(
      true,
    );
    expect(isSystemAdminPermissionKey("free.form.permission")).toBe(false);
  });

  it("rejects API scopes and webhook events outside their catalogs", () => {
    expect(isSystemAdminApiScope(systemAdminApiScopes[0]!.value)).toBe(true);
    expect(isSystemAdminApiScope("admin:*")).toBe(false);

    expect(isSystemAdminWebhookEvent(systemAdminWebhookEvents[0]!.value)).toBe(
      true,
    );
    expect(isSystemAdminWebhookEvent("tenant.*")).toBe(false);
    expect(isSystemAdminWebhookEvent("tenant.webhook.enabled")).toBe(true);
    expect(isSystemAdminWebhookEvent("tenant.webhook.disabled")).toBe(true);
    expect(isSystemAdminWebhookEvent("system-admin.policy.updated")).toBe(true);
    expect(isSystemAdminWebhookEvent("system-admin.security.updated")).toBe(
      true,
    );
    for (const event of systemAdminDefaultWebhookEventPresets) {
      expect(isSystemAdminWebhookEvent(event)).toBe(true);
    }
  });

  it("exposes structured Lynx outcome monitor threshold catalogs", () => {
    const financeCatalog = getSystemAdminLynxOutcomeMonitorThresholdCatalog(
      "finance-control-watch",
    );

    expect(financeCatalog?.fields.map((field) => field.key)).toContain(
      "blockedRecordsWatchAbove",
    );
    expect(getSystemAdminLynxOutcomeMonitorThresholdCatalog("raw-json")).toBe(
      undefined,
    );
  });
});
