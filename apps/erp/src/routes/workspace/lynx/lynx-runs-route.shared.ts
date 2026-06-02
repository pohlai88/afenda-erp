import type { LynxRunLedgerFilters } from "@afenda/feature-lynx/server";

export function formDefault(value: string | undefined) {
  return value ?? "";
}

export function getRunQualityGate(metadata: Record<string, unknown>) {
  const gate = metadata.qualityGate;
  return typeof gate === "object" && gate !== null
    ? (gate as Record<string, unknown>)
    : null;
}

export function getEventQualityGate(metrics: Record<string, unknown>) {
  const gate = metrics.qualityGate;
  return typeof gate === "object" && gate !== null
    ? (gate as Record<string, unknown>)
    : null;
}

export function formatPercent(value: unknown) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "-";
}

export function getQualityGateStatus(metadata: Record<string, unknown>) {
  const gate = getRunQualityGate(metadata);
  return typeof gate?.status === "string" ? gate.status : "-";
}

export function getUnsupportedClaimCount(metadata: Record<string, unknown>) {
  const gate = getRunQualityGate(metadata);
  return typeof gate?.unsupportedClaimCount === "number"
    ? String(gate.unsupportedClaimCount)
    : "-";
}

export function toLynxObservabilityFilters(filters: LynxRunLedgerFilters) {
  return {
    route: filters.route,
    workflowId: filters.workflowId,
    model: filters.model,
    qualityGate: filters.qualityGate,
    from: filters.startedFrom,
    to: filters.startedTo,
    origin: filters.origin,
    monitorStatus: filters.monitorStatus,
    severity: filters.severity,
    provider: filters.provider,
  };
}
