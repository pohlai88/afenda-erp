import type { AiRequestStatus, LynxRunLedgerFilters } from "@afenda/db";

const runStatuses = new Set<AiRequestStatus>([
  "started",
  "completed",
  "failed",
]);
const qualityGateFilters = new Set<
  NonNullable<LynxRunLedgerFilters["qualityGate"]>
>(["unsupported", "lowCitationPrecision", "failedQualityGate"]);

type SearchParamValue = string | string[] | undefined;

function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanParam(value: SearchParamValue, maxLength = 160) {
  const param = firstParam(value)?.trim();
  return param ? param.slice(0, maxLength) : undefined;
}

function parseDateParam(value: SearchParamValue) {
  const param = cleanParam(value, 40);
  if (!param) {
    return undefined;
  }

  const date = new Date(param);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export function parseLynxRunFilters(
  searchParams: Record<string, SearchParamValue>,
): LynxRunLedgerFilters {
  const status = cleanParam(searchParams.status, 40);
  const route = cleanParam(searchParams.route, 120);
  const workflowId = cleanParam(searchParams.workflowId, 120);
  const model = cleanParam(searchParams.model, 160);
  const toolName = cleanParam(searchParams.toolName, 120);
  const qualityGate = cleanParam(searchParams.qualityGate, 80);
  const search = cleanParam(searchParams.q, 160);
  const origin = cleanParam(searchParams.origin, 120);
  const monitorStatus = cleanParam(searchParams.monitorStatus, 80);
  const severity = cleanParam(searchParams.severity, 80);
  const provider = cleanParam(searchParams.provider, 120);
  const startedFrom = parseDateParam(searchParams.from);
  const startedTo = parseDateParam(searchParams.to);

  return {
    ...(status && runStatuses.has(status as AiRequestStatus)
      ? { status: status as AiRequestStatus }
      : {}),
    ...(route ? { route } : {}),
    ...(workflowId ? { workflowId } : {}),
    ...(model ? { model } : {}),
    ...(toolName ? { toolName } : {}),
    ...(qualityGate &&
    qualityGateFilters.has(
      qualityGate as NonNullable<LynxRunLedgerFilters["qualityGate"]>,
    )
      ? {
          qualityGate: qualityGate as NonNullable<
            LynxRunLedgerFilters["qualityGate"]
          >,
        }
      : {}),
    ...(search ? { search } : {}),
    ...(origin ? { origin } : {}),
    ...(monitorStatus ? { monitorStatus } : {}),
    ...(severity ? { severity } : {}),
    ...(provider ? { provider } : {}),
    ...(startedFrom ? { startedFrom } : {}),
    ...(startedTo ? { startedTo } : {}),
  };
}

export function buildLynxRunFilterSearchParams(input: {
  filters: LynxRunLedgerFilters;
}) {
  const params = new URLSearchParams();
  const { filters } = input;

  if (filters.status) params.set("status", filters.status);
  if (filters.route) params.set("route", filters.route);
  if (filters.workflowId) params.set("workflowId", filters.workflowId);
  if (filters.model) params.set("model", filters.model);
  if (filters.toolName) params.set("toolName", filters.toolName);
  if (filters.qualityGate) params.set("qualityGate", filters.qualityGate);
  if (filters.search) params.set("q", filters.search);
  if (filters.origin) params.set("origin", filters.origin);
  if (filters.monitorStatus) params.set("monitorStatus", filters.monitorStatus);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.provider) params.set("provider", filters.provider);
  if (filters.startedFrom) {
    params.set("from", filters.startedFrom.toISOString());
  }
  if (filters.startedTo) params.set("to", filters.startedTo.toISOString());

  return params;
}
