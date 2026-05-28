import { requireCapability } from "@afenda/auth/server";
import { getLynxRunDetail, listLynxRunLedger } from "@afenda/db";
import { parseLynxRunFilters } from "@/lib/api/lynx-run-filters";

function csvCell(value: unknown) {
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "string"
        ? value
        : value == null
          ? ""
          : JSON.stringify(value);

  return `"${text.replaceAll('"', '""')}"`;
}

function getEventQualityGate(metrics: Record<string, unknown>) {
  const gate = metrics.qualityGate;
  return typeof gate === "object" && gate !== null
    ? (gate as Record<string, unknown>)
    : null;
}

export async function GET(request: Request) {
  const { organization } = await requireCapability("dashboard.view");
  const url = new URL(request.url);
  const filters = parseLynxRunFilters(
    Object.fromEntries(url.searchParams.entries()),
  );
  const runs = await listLynxRunLedger({
    organizationId: organization.id,
    filters,
    limit: 500,
  });
  const details = await Promise.all(
    runs.map((run) =>
      getLynxRunDetail({
        organizationId: organization.id,
        runId: run.id,
      }),
    ),
  );
  const rows = details
    .filter((detail): detail is NonNullable<typeof detail> => Boolean(detail))
    .map((detail) => ({
      runId: detail.id,
      status: detail.status,
      route: detail.route,
      workflowId: detail.workflowId ?? "",
      workflowSessionId: detail.workflowSessionId ?? "",
      model: detail.model,
      promptSummary: detail.promptSummary,
      latencyMs: detail.latencyMs,
      startedAt: detail.startedAt,
      completedAt: detail.completedAt,
      eventCount: detail.events.length,
      toolCallCount: detail.events.filter((event) => event.toolName).length,
      evidenceReferenceCount: detail.events.reduce(
        (total, event) => total + event.evidenceReferences.length,
        0,
      ),
      approvalProposalIds: detail.events
        .map((event) => event.approvalProposalId)
        .filter(Boolean)
        .join(";"),
      sandboxIds: detail.events
        .map((event) => event.sandboxId)
        .filter(Boolean)
        .join(";"),
      feedbackCount: detail.feedback.length,
      negativeFeedbackCount: detail.feedback.filter(
        (feedback) => feedback.rating === "negative",
      ).length,
      failedQualityGateCount: detail.events.filter(
        (event) =>
          getEventQualityGate(event.validationMetrics)?.status === "failed",
      ).length,
      unsupportedClaimCount: detail.events.reduce((total, event) => {
        const gate = getEventQualityGate(event.validationMetrics);
        return (
          total +
          (typeof gate?.unsupportedClaimCount === "number"
            ? gate.unsupportedClaimCount
            : 0)
        );
      }, 0),
    }));
  const headers = [
    "run_id",
    "status",
    "route",
    "workflow_id",
    "workflow_session_id",
    "model",
    "prompt_summary",
    "latency_ms",
    "started_at",
    "completed_at",
    "event_count",
    "tool_call_count",
    "evidence_reference_count",
    "approval_proposal_ids",
    "sandbox_ids",
    "feedback_count",
    "negative_feedback_count",
    "failed_quality_gate_count",
    "unsupported_claim_count",
  ];
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) =>
      [
        row.runId,
        row.status,
        row.route,
        row.workflowId,
        row.workflowSessionId,
        row.model,
        row.promptSummary,
        row.latencyMs,
        row.startedAt,
        row.completedAt,
        row.eventCount,
        row.toolCallCount,
        row.evidenceReferenceCount,
        row.approvalProposalIds,
        row.sandboxIds,
        row.feedbackCount,
        row.negativeFeedbackCount,
        row.failedQualityGateCount,
        row.unsupportedClaimCount,
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="lynx-run-audit-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
