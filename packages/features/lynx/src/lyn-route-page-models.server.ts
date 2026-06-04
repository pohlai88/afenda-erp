import {
  LYNX_WORKSPACE_ROUTES,
  lynxClaimValidationResultSchema,
  lynxQualityGateResultSchema,
  type LynxQualityGateResult,
  type LynxQualityGateStatus,
} from "../contracts";
import {
  getLynxRunAnalytics,
  getLynxRunDetail,
  listLynxRunLedger,
  type AiRequestStatus,
  type LynxRunDetail,
  type LynxRunLedgerFilters,
  type LynxRunLedgerSummary,
  type LynxWorkflowSessionStatus,
} from "./lynx.run-ledger.repository.server";
import {
  getLynxWorkflowSession,
  listLynxWorkflowSessions,
  type LynxWorkflowSessionFilters,
  type LynxWorkflowSessionSummary,
} from "./lynx.workflow-session.repository.server";
import {
  buildLynxClaimValidationListSurface,
  buildLynxRunDetailStatGrid,
  buildLynxRunEventTimelineListSurface,
  buildLynxRunFeedbackListSurface,
  buildLynxRunManagementListSurface,
  buildLynxRunManagementQualityStatGrid,
  buildLynxRunManagementStatGrid,
  buildLynxWorkflowLinkedRunListSurface,
  buildLynxWorkflowSessionDetailStatGrid,
  buildLynxWorkflowSessionListSurface,
  type LynxClaimValidationRow,
  type LynxRouteListPagination,
  type LynxRunEventTimelineRow,
  type LynxRunFeedbackRow,
  type LynxRunManagementFilters,
  type LynxRunManagementRow,
  type LynxWorkflowSessionFilters as LynxWorkflowSessionSurfaceFilters,
  type LynxWorkflowSessionRow,
} from "../surface";

type SearchParamValue = string | string[] | undefined;

export type LynxRouteSearchParams = Record<string, SearchParamValue>;

const LYNX_ROUTE_LIST_WINDOW = 100;
const LYNX_ROUTE_LIST_QUERY_LIMIT = LYNX_ROUTE_LIST_WINDOW + 1;
const RUN_STATUSES = ["started", "completed", "failed"] as const satisfies readonly AiRequestStatus[];
const WORKFLOW_STATUSES = [
  "active",
  "paused",
  "completed",
  "failed",
  "cancelled",
] as const satisfies readonly LynxWorkflowSessionStatus[];
const QUALITY_GATE_FILTERS = [
  "unsupported",
  "lowCitationPrecision",
  "failedQualityGate",
] as const satisfies readonly NonNullable<LynxRunLedgerFilters["qualityGate"]>[];

function firstParam(params: LynxRouteSearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function dateParam(params: LynxRouteSearchParams, key: string) {
  const value = firstParam(params, key);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function stringParam(params: LynxRouteSearchParams, key: string) {
  const value = firstParam(params, key)?.trim();
  return value ? value : undefined;
}

function enumParam<TValue extends string>(
  params: LynxRouteSearchParams,
  key: string,
  allowedValues: readonly TValue[],
) {
  const value = stringParam(params, key);
  return value && allowedValues.includes(value as TValue)
    ? (value as TValue)
    : undefined;
}

function parseRunFilters(
  params: LynxRouteSearchParams,
): LynxRunLedgerFilters & LynxRunManagementFilters {
  return {
    status: enumParam(params, "status", RUN_STATUSES),
    route: stringParam(params, "route"),
    workflowId: stringParam(params, "workflowId"),
    model: stringParam(params, "model"),
    toolName: stringParam(params, "toolName"),
    qualityGate: enumParam(params, "qualityGate", QUALITY_GATE_FILTERS),
    origin: stringParam(params, "origin"),
    monitorStatus: stringParam(params, "monitorStatus"),
    severity: stringParam(params, "severity"),
    provider: stringParam(params, "provider"),
    search: stringParam(params, "q") ?? stringParam(params, "search"),
    startedFrom: dateParam(params, "from"),
    startedTo: dateParam(params, "to"),
  };
}

function parseWorkflowFilters(
  params: LynxRouteSearchParams,
): LynxWorkflowSessionFilters & LynxWorkflowSessionSurfaceFilters {
  return {
    status: enumParam(params, "status", WORKFLOW_STATUSES),
    origin: stringParam(params, "origin"),
    monitorStatus: stringParam(params, "monitorStatus"),
    severity: stringParam(params, "severity"),
  };
}

function formatDate(value: Date) {
  return value.toISOString();
}

function qualityGateStatus(value: Record<string, unknown> | null | undefined) {
  const gate = parseQualityGate(value);
  return gate?.status ?? "-";
}

function parseQualityGate(
  value: Record<string, unknown> | null | undefined,
): LynxQualityGateResult | null {
  if (!value) return null;
  const parsed = lynxQualityGateResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = "-",
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function metadataNumber(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function metadataQualityGateStatus(
  metadata: Record<string, unknown>,
): LynxQualityGateStatus | "-" {
  const qualityGate = metadata.qualityGate;
  return qualityGate && typeof qualityGate === "object"
    ? qualityGateStatus(qualityGate as Record<string, unknown>)
    : "-";
}

function toRunRow(run: LynxRunLedgerSummary): LynxRunManagementRow {
  return {
    id: run.id,
    promptSummary: run.promptSummary,
    route: run.route,
    workflowId: run.workflowId ?? "-",
    model: run.model,
    status: run.status,
    latency: `${run.latencyMs} ms`,
    qualityGate: metadataQualityGateStatus(run.metadata),
    unsupportedClaims: String(metadataNumber(run.metadata, "unsupportedClaims")),
    startedAt: formatDate(run.startedAt),
    href: LYNX_WORKSPACE_ROUTES.runDetail(run.id),
  };
}

function toWorkflowRow(
  session: LynxWorkflowSessionSummary,
): LynxWorkflowSessionRow {
  return {
    id: session.id,
    promptSummary: session.promptSummary,
    workflowId: session.workflowId,
    origin: metadataString(session.metadata, "origin"),
    monitorStatus: metadataString(session.metadata, "monitorStatus"),
    severity: metadataString(session.metadata, "severity"),
    ownerAuthUserId: session.userAuthId,
    status: session.status,
    currentStage: session.currentStage,
    latestRunId: session.latestRunId ?? "-",
    qualityGate: qualityGateStatus(session.qualityGateSummary),
    nextRecommendedStep: session.nextRecommendedStep,
    updatedAt: formatDate(session.updatedAt),
    href: LYNX_WORKSPACE_ROUTES.workflowDetail(session.id),
  };
}

function toEventRow(
  event: LynxRunDetail["events"][number],
): LynxRunEventTimelineRow {
  return {
    id: event.id,
    eventType: event.eventType,
    summary: event.summary,
    toolName: event.toolName ?? "-",
    evidenceCount: String(event.evidenceReferences.length),
    validation: qualityGateStatus(event.validationMetrics),
    approvalProposalId: event.approvalProposalId ?? "-",
    sandboxId: event.sandboxId ?? "-",
    createdAt: formatDate(event.createdAt),
  };
}

function toFeedbackRow(
  feedback: LynxRunDetail["feedback"][number],
): LynxRunFeedbackRow {
  return {
    id: feedback.id,
    rating: feedback.rating,
    category: feedback.category,
    note: feedback.note,
    createdAt: formatDate(feedback.createdAt),
  };
}

function toClaimRows(run: LynxRunDetail): LynxClaimValidationRow[] {
  return run.events.flatMap((event) => {
    const claims = event.validationMetrics.claims;
    if (!Array.isArray(claims)) return [];
    return claims.flatMap((claim, index) => {
      const parsed = lynxClaimValidationResultSchema.safeParse(claim);
      if (!parsed.success) return [];
      const evidence = parsed.data.evidenceLinks
        .map((link) => link.title ?? link.evidenceId)
        .join(", ");

      return [
        {
          id: `${event.id}-${index}`,
          claim: parsed.data.claim.text,
          status: parsed.data.status,
          evidence: evidence || "-",
          reason: parsed.data.reason,
        },
      ];
    });
  });
}

function windowedRows<TRow>(rows: readonly TRow[]): {
  rows: TRow[];
  pagination: LynxRouteListPagination;
} {
  const hasNextPage = rows.length > LYNX_ROUTE_LIST_WINDOW;
  const visibleRows = rows.slice(0, LYNX_ROUTE_LIST_WINDOW);
  return {
    rows: visibleRows,
    pagination: {
      pageSize: LYNX_ROUTE_LIST_WINDOW,
      totalCount: visibleRows.length + (hasNextPage ? 1 : 0),
      hasNextPage,
    },
  };
}

export async function buildLynxRunManagementPageModel(input: {
  organizationId: string;
  searchParams: LynxRouteSearchParams;
}) {
  const filters = parseRunFilters(input.searchParams);
  const [runs, analytics] = await Promise.all([
    listLynxRunLedger({
      organizationId: input.organizationId,
      filters,
      limit: LYNX_ROUTE_LIST_QUERY_LIMIT,
    }),
    getLynxRunAnalytics({
      organizationId: input.organizationId,
      filters,
      limit: LYNX_ROUTE_LIST_WINDOW,
    }),
  ]);

  const runWindow = windowedRows(runs);

  return {
    filters,
    overview: buildLynxRunManagementStatGrid(analytics),
    quality: buildLynxRunManagementQualityStatGrid(analytics),
    runs: buildLynxRunManagementListSurface({
      rows: runWindow.rows.map(toRunRow),
      filters,
      exportTriggerElementId: "lynx-runs-export",
      pagination: runWindow.pagination,
    }),
  };
}

export async function buildLynxRunDetailPageModel(input: {
  organizationId: string;
  runId: string;
}) {
  const run = await getLynxRunDetail(input);
  if (!run) return null;

  return {
    run,
    overview: buildLynxRunDetailStatGrid({
      eventCount: run.events.length,
      toolCallCount: run.events.filter((event) => event.toolName).length,
      evidenceReferenceCount: run.events.reduce(
        (total, event) => total + event.evidenceReferences.length,
        0,
      ),
      feedbackCount: run.feedback.length,
      latencyMs: run.latencyMs,
      status: run.status,
    }),
    events: buildLynxRunEventTimelineListSurface({
      rows: run.events.map(toEventRow),
    }),
    feedback: buildLynxRunFeedbackListSurface({
      rows: run.feedback.map(toFeedbackRow),
    }),
    claims: buildLynxClaimValidationListSurface({
      rows: toClaimRows(run),
    }),
  };
}

export async function buildLynxWorkflowSessionListPageModel(input: {
  organizationId: string;
  searchParams: LynxRouteSearchParams;
}) {
  const filters = parseWorkflowFilters(input.searchParams);
  const sessions = await listLynxWorkflowSessions({
    organizationId: input.organizationId,
    filters,
    limit: LYNX_ROUTE_LIST_QUERY_LIMIT,
  });
  const sessionWindow = windowedRows(sessions);

  return {
    filters,
    sessions: buildLynxWorkflowSessionListSurface({
      rows: sessionWindow.rows.map(toWorkflowRow),
      filters,
      pagination: sessionWindow.pagination,
    }),
  };
}

export async function buildLynxWorkflowSessionDetailPageModel(input: {
  organizationId: string;
  sessionId: string;
}) {
  const session = await getLynxWorkflowSession({
    organizationId: input.organizationId,
    id: input.sessionId,
  });
  if (!session) return null;

  const linkedRuns = await listLynxRunLedger({
    organizationId: input.organizationId,
    filters: {
      workflowSessionId: input.sessionId,
    },
    limit: LYNX_ROUTE_LIST_QUERY_LIMIT,
  });
  const linkedRunWindow = windowedRows(linkedRuns);

  return {
    session,
    overview: buildLynxWorkflowSessionDetailStatGrid({
      status: session.status,
      origin: metadataString(session.metadata, "origin"),
      monitorStatus: metadataString(session.metadata, "monitorStatus"),
      severity: metadataString(session.metadata, "severity"),
      ownerAuthUserId: session.userAuthId,
      currentStage: session.currentStage,
      linkedRunCount: linkedRunWindow.pagination.totalCount,
      evidenceCount: metadataNumber(session.evidenceSummary, "count"),
      approvalReferenceCount: metadataNumber(
        session.evidenceSummary,
        "approvalReferenceCount",
      ),
      sandboxReferenceCount: metadataNumber(
        session.evidenceSummary,
        "sandboxReferenceCount",
      ),
      feedbackCount: metadataNumber(session.evidenceSummary, "feedbackCount"),
      qualityGateStatus: qualityGateStatus(session.qualityGateSummary),
      updatedAt: formatDate(session.updatedAt),
    }),
    linkedRuns: buildLynxWorkflowLinkedRunListSurface({
      rows: linkedRunWindow.rows.map(toRunRow),
    }),
  };
}
