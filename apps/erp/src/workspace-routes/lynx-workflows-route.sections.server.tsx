import {
  buildLynxWorkflowSessionListSurface,
  getLynxReadinessSurfaceKeys,
} from "@afenda/feature-lynx/metadata";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import {
  getMetadataString,
  getQualityGateStatus,
} from "@/workspace-routes/lynx-workflows-route.shared";
import {
  loadLynxWorkflowSessionsBundle,
  type LynxWorkflowSessionListFilters,
} from "@/workspace-routes/workspace-route-cache";

export async function LynxWorkflowSessionsListSection({
  filters,
}: {
  filters: LynxWorkflowSessionListFilters;
}) {
  const { sessions } = await loadLynxWorkflowSessionsBundle(filters);
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const hasFilters = Boolean(
    filters.status ||
      filters.origin ||
      filters.monitorStatus ||
      filters.severity,
  );
  const listSurface = buildLynxWorkflowSessionListSurface({
    ...(hasFilters ? { filters } : {}),
    rows: sessions.map((session) => ({
      id: session.id,
      promptSummary: session.promptSummary || session.id,
      workflowId: session.workflowId,
      origin: getMetadataString(session.metadata, "origin"),
      monitorStatus: getMetadataString(session.metadata, "monitorStatus"),
      severity: getMetadataString(session.metadata, "severity"),
      ownerAuthUserId: getMetadataString(session.metadata, "ownerAuthUserId"),
      status: session.status,
      currentStage: session.currentStage,
      latestRunId: session.latestRunId ?? "-",
      qualityGate: getQualityGateStatus(session.qualityGateSummary),
      nextRecommendedStep: session.nextRecommendedStep || "-",
      updatedAt: session.updatedAt.toLocaleString(),
      href: `/lynx/workflows/${session.id}`,
    })),
  });

  return (
    <GovernedPatternCListSection
      title="Workflow sessions"
      description="Current-state pointers linked to immutable Lynx run replay records."
      surfaceKey={surfaceKeys.workflowSessions}
      listConfiguration={listSurface}
      parentAccessAllowed
      layout="embedded"
    />
  );
}
