import type { LynxOutcomeMonitorSetting } from "@afenda/db";

export type { LynxOutcomeMonitorSetting };

export function readMonitorThresholdNumber(
  thresholds: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const value = thresholds[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function readMonitorSeverityMode(
  severityPolicy: Record<string, unknown>,
): string {
  return typeof severityPolicy.mode === "string"
    ? severityPolicy.mode
    : "standard";
}
