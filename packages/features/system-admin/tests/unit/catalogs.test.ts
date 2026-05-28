import { describe, expect, it } from "vitest";
import { appCapabilities } from "@afenda/auth";
import {
  getSystemAdminLynxOutcomeMonitorThresholdCatalog,
  isSystemAdminApiScope,
  isSystemAdminPermissionKey,
  isSystemAdminWebhookEvent,
  systemAdminApiScopes,
  systemAdminPermissionCatalog,
  systemAdminDefaultWebhookEventPresets,
  systemAdminWebhookEvents,
} from "../../src/catalogs";

describe("system admin catalogs", () => {
  it("backs RBAC override selection with the app capability catalog", () => {
    expect(systemAdminPermissionCatalog.map((entry) => entry.value)).toEqual(
      appCapabilities,
    );
    expect(isSystemAdminPermissionKey("system-admin.audit.read")).toBe(true);
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
    for (const event of systemAdminDefaultWebhookEventPresets) {
      expect(isSystemAdminWebhookEvent(event)).toBe(true);
    }
  });

  it("exposes structured Lynx outcome monitor threshold catalogs", () => {
    const financeCatalog =
      getSystemAdminLynxOutcomeMonitorThresholdCatalog(
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
