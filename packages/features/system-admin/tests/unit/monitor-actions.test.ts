import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  logServerEvent: vi.fn(),
  requireCapability: vi.fn(async () => ({
    session: { id: "auth_1" },
    organization: { id: "org_1" },
  })),
  requireExecutionContext: vi.fn(async () => ({
    organizationId: "org_1",
    organizationSlug: "org-1",
    userId: "auth_1",
    membershipId: "member_1",
    locale: "en-MY",
    actorType: "user",
    capabilities: ["system-admin.lynx.approve"],
    role: "admin",
    sessionSource: "dev",
  })),
  hasExecutionPermission: vi.fn(
    (
      context: { capabilities: readonly string[] },
      permission: string,
    ) => context.capabilities.includes(permission),
  ),
  requireExecutionPermission: vi.fn(),
  revalidatePath: vi.fn(),
  updateLynxOutcomeMonitorSetting: vi.fn(async () => undefined),
}));

vi.mock("@afenda/auth/server", () => ({
  requireCapability: mocks.requireCapability,
}));

vi.mock("@afenda/kernel/execution", () => ({
  hasExecutionPermission: mocks.hasExecutionPermission,
  requireExecutionContext: mocks.requireExecutionContext,
  requireExecutionPermission: mocks.requireExecutionPermission,
}));

vi.mock("@afenda/db", () => ({
  updateLynxOutcomeMonitorSetting: mocks.updateLynxOutcomeMonitorSetting,
}));

vi.mock("@afenda/observability/server", () => ({
  logServerEvent: mocks.logServerEvent,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { updateLynxOutcomeMonitorSettingAction } from "../../src/lynx/actions/system-admin.lynx-outcome-monitor.actions.server";

function monitorForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("monitorId", "finance-control-watch");
  formData.set("enabled", "true");
  formData.set("severityMode", "standard");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

describe("Lynx outcome monitor setting actions", () => {
  beforeEach(() => {
    mocks.logServerEvent.mockClear();
    mocks.requireCapability.mockClear();
    mocks.requireExecutionContext.mockClear();
    mocks.hasExecutionPermission.mockClear();
    mocks.requireExecutionPermission.mockClear();
    mocks.revalidatePath.mockClear();
    mocks.updateLynxOutcomeMonitorSetting.mockClear();
  });

  it("rejects invalid catalog threshold values instead of defaulting silently", async () => {
    const result = await updateLynxOutcomeMonitorSettingAction(
      undefined,
      monitorForm({ "threshold.blockedRecordsWatchAbove": "-1" }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected monitor setting update to fail.");
    }
    expect(result.fieldErrors).toMatchObject({
      "threshold.blockedRecordsWatchAbove":
        "Blocked records watch above must be zero or greater.",
    });
    expect(mocks.updateLynxOutcomeMonitorSetting).not.toHaveBeenCalled();
    expect(mocks.logServerEvent).toHaveBeenCalledWith(
      "warn",
      "Lynx outcome monitor setting update rejected.",
      expect.objectContaining({
        organizationId: "org_1",
        operation: "lynx.outcome-monitor.update",
      }),
      expect.objectContaining({ reason: "invalid-threshold" }),
    );
  });

  it("persists catalog-backed threshold values with explicit severity", async () => {
    const result = await updateLynxOutcomeMonitorSettingAction(
      undefined,
      monitorForm({
        "threshold.blockedRecordsWatchAbove": "2",
        "threshold.closeControlsWatchAbove": "3",
        severityMode: "critical",
      }),
    );

    expect(result.ok).toBe(true);
    expect(mocks.updateLynxOutcomeMonitorSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        monitorId: "finance-control-watch",
        thresholds: expect.objectContaining({
          blockedRecordsWatchAbove: 2,
          closeControlsWatchAbove: 3,
          highPriorityWorkWatchAbove: 0,
        }),
        severityPolicy: { mode: "critical" },
      }),
    );
  });
});
