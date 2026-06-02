import type { LynxWorkflowSessionStatus } from "@afenda/feature-lynx/server";

export const workflowSessionStatuses: readonly LynxWorkflowSessionStatus[] = [
  "active",
  "paused",
  "completed",
  "failed",
  "cancelled",
];

export const workflowSessionOrigins = ["proactive-outcome-sweep"] as const;
export const workflowSessionMonitorStatuses = [
  "healthy",
  "watch",
  "blocked",
] as const;
export const workflowSessionSeverities = ["info", "review", "critical"] as const;

export function getQualityGateStatus(summary: Record<string, unknown>) {
  return typeof summary.status === "string" ? summary.status : "-";
}

export function getMetadataString(
  metadata: Record<string, unknown>,
  key: "origin" | "monitorStatus" | "severity" | "ownerAuthUserId",
) {
  const value = metadata[key];
  return typeof value === "string" ? value : "-";
}

export function parseWorkflowSessionStatus(
  value: string | string[] | undefined,
): LynxWorkflowSessionStatus | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return workflowSessionStatuses.includes(
    candidate as LynxWorkflowSessionStatus,
  )
    ? (candidate as LynxWorkflowSessionStatus)
    : undefined;
}

export function parseLiteralParam(
  value: string | string[] | undefined,
  allowedValues: readonly string[],
): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return undefined;
  return allowedValues.includes(candidate) ? candidate : undefined;
}

export function parseLynxWorkflowSessionFilters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const status = parseWorkflowSessionStatus(searchParams.status);
  const origin = parseLiteralParam(
    searchParams.origin,
    workflowSessionOrigins,
  );
  const monitorStatus = parseLiteralParam(
    searchParams.monitorStatus,
    workflowSessionMonitorStatuses,
  );
  const severity = parseLiteralParam(
    searchParams.severity,
    workflowSessionSeverities,
  );

  return { status, origin, monitorStatus, severity };
}
