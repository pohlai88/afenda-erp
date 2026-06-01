import { describe, expect, it } from "vitest";
import {
  MINUTES_PER_HOUR,
  readConfigurationNumber,
  readConfigurationOptionalNumber,
  readConfigurationString,
  readExecutionSettingConfiguration,
  readOptionalFormValue,
} from "../../src/tenant-execution/contracts/system-admin.execution-settings.shared";
import { resolveExecutionCapabilityForAction } from "../../src/tenant-execution/policies/system-admin.execution-capability.shared.server";

describe("tenant-execution shared helpers", () => {
  it("reads execution setting configuration safely", () => {
    expect(readExecutionSettingConfiguration(null)).toEqual({});
    expect(readExecutionSettingConfiguration({ action: "x" })).toEqual({
      action: "x",
    });
    expect(readExecutionSettingConfiguration([])).toEqual({});
  });

  it("reads configuration strings and numbers with fallbacks", () => {
    expect(readConfigurationString("  purchasing ", "*")).toBe("purchasing");
    expect(readConfigurationString("", "*")).toBe("*");
    expect(readConfigurationNumber(2, 1)).toBe(2);
    expect(readConfigurationNumber("2", 1)).toBe(1);
    expect(readConfigurationOptionalNumber(3)).toBe(3);
    expect(readConfigurationOptionalNumber(undefined)).toBeUndefined();
  });

  it("reads optional form values", () => {
    expect(readOptionalFormValue(" 24 ")).toBe("24");
    expect(readOptionalFormValue("   ")).toBeUndefined();
    expect(readOptionalFormValue(null)).toBeUndefined();
  });

  it("exposes minutes-per-hour constant for escalation conversion", () => {
    expect(MINUTES_PER_HOUR).toBe(60);
  });

  it("resolves execution capabilities by key or required permission", () => {
    const capability = resolveExecutionCapabilityForAction("dashboard.view");
    expect(capability?.requiredPermission).toBe("dashboard.view");
  });
});
