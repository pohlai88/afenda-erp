import { getSystemAdminLynxOutcomeMonitorThresholdCatalog } from "./sys-lynx-outcome-monitor-catalog.contract";

export const systemAdminLynxOutcomeMonitorSeverityModes = [
  "standard",
  "observe",
  "critical",
] as const;

export type SystemAdminLynxOutcomeMonitorSeverityMode =
  (typeof systemAdminLynxOutcomeMonitorSeverityModes)[number];

export function isSystemAdminLynxOutcomeMonitorSeverityMode(
  value: string,
): value is SystemAdminLynxOutcomeMonitorSeverityMode {
  return systemAdminLynxOutcomeMonitorSeverityModes.includes(
    value as SystemAdminLynxOutcomeMonitorSeverityMode,
  );
}

export function parseSystemAdminLynxOutcomeMonitorThresholds(
  formData: FormData,
  monitorId: string,
) {
  const catalog = getSystemAdminLynxOutcomeMonitorThresholdCatalog(monitorId);
  if (!catalog) {
    return { ok: false as const, reason: "unknown-monitor" as const };
  }

  const fieldErrors: Record<string, string> = {};
  const thresholds = Object.fromEntries(
    catalog.fields.map((field) => {
      const fieldName = `threshold.${field.key}`;
      const raw = formData.get(fieldName);
      if (typeof raw !== "string" || raw.trim() === "") {
        return [field.key, field.defaultValue];
      }

      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        fieldErrors[fieldName] = `${field.label} must be zero or greater.`;
        return [field.key, field.defaultValue];
      }

      return [field.key, value];
    }),
  );

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false as const,
      reason: "invalid-threshold" as const,
      fieldErrors,
    };
  }

  return { ok: true as const, thresholds };
}
