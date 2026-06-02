import { LynxOperatorPanel } from "@afenda/feature-lynx/client";
import {
  buildLynxWorkflowLinkedRunListSurface,
  buildLynxWorkflowSessionDetailStatGrid,
  getLynxReadinessSurfaceKeys,
} from "@afenda/feature-lynx/metadata";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import {
  getMetadataString,
  getQualityGateStatus,
  getRunQualityGateStatus,
  getUnsupportedClaimCount,
} from "@/routes/workspace/lynx/lynx-workflow-session-detail-route.shared";
import { loadLynxWorkflowSessionDetailBundle } from "@/routes/workspace/shared/workspace-route-cache";
import { Button, SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";

export async function LynxWorkflowSessionHeroSection({
  workflowSessionId,
}: {
  workflowSessionId: string;
}) {
  const { session, runs, availableRunDetails } =
    await loadLynxWorkflowSessionDetailBundle(workflowSessionId);
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const evidenceReferenceCount = availableRunDetails.reduce(
    (total, detail) =>
      total +
      detail.events.reduce(
        (eventTotal, event) => eventTotal + event.evidenceReferences.length,
        0,
      ),
    0,
  );
  const approvalReferenceCount = availableRunDetails.reduce(
    (total, detail) =>
      total +
      detail.events.filter((event) => Boolean(event.approvalProposalId)).length,
    0,
  );
  const sandboxReferenceCount = availableRunDetails.reduce(
    (total, detail) =>
      total + detail.events.filter((event) => Boolean(event.sandboxId)).length,
    0,
  );
  const feedbackCount = availableRunDetails.reduce(
    (total, detail) => total + detail.feedback.length,
    0,
  );
  const origin = getMetadataString(session.metadata, "origin");
  const monitorStatus = getMetadataString(session.metadata, "monitorStatus");
  const severity = getMetadataString(session.metadata, "severity");
  const ownerAuthUserId = getMetadataString(
    session.metadata,
    "ownerAuthUserId",
  );
  const detailStats = buildLynxWorkflowSessionDetailStatGrid({
    status: session.status,
    ...(origin ? { origin } : {}),
    ...(monitorStatus ? { monitorStatus } : {}),
    ...(severity ? { severity } : {}),
    ...(ownerAuthUserId ? { ownerAuthUserId } : {}),
    currentStage: session.currentStage,
    linkedRunCount: runs.length,
    evidenceCount: evidenceReferenceCount,
    approvalReferenceCount,
    sandboxReferenceCount,
    feedbackCount,
    qualityGateStatus: getQualityGateStatus(session.qualityGateSummary),
    updatedAt: session.updatedAt.toLocaleString(),
  });

  return (
    <SectionPanel
      eyebrow="Lynx workflow session"
      headingLevel={1}
      title={session.promptSummary || session.id}
      description={`${session.workflowId} · ${session.currentStage}`}
      aside={
        <div className="flex flex-col items-end gap-3 text-right">
          <StatusBadge
            label={session.status}
            tone={
              session.status === "failed"
                ? "warning"
                : session.status === "completed"
                  ? "positive"
                  : "neutral"
            }
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/lynx/workflows">Back to workflows</Link>
            </Button>
            {session.latestRunId ? (
              <Button asChild variant="ghost">
                <Link href={`/lynx/runs/${session.latestRunId}`}>
                  Latest run
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <GovernedPatternBStatSection
        title="Workflow overview"
        surfaceKey={`${surfaceKeys.workflowSessionStats}.${session.id}`}
        layout="embedded"
        statGroups={[
          {
            groupKey: "lynx-workflow-session",
            configuration: detailStats,
          },
        ]}
      />
    </SectionPanel>
  );
}

export async function LynxWorkflowSessionResumeSection({
  workflowSessionId,
}: {
  workflowSessionId: string;
}) {
  const { session } = await loadLynxWorkflowSessionDetailBundle(workflowSessionId);
  const canResume = session.status === "active" || session.status === "paused";

  if (!canResume) {
    return null;
  }

  return (
    <SectionPanel
      title="Resume workflow"
      description="Continue this Lynx workflow session without exposing tenant context to the client or model."
    >
      <LynxOperatorPanel
        defaultWorkflowId={session.workflowId}
        workflowSessionId={session.id}
      />
    </SectionPanel>
  );
}

export async function LynxWorkflowSessionRunsSection({
  workflowSessionId,
}: {
  workflowSessionId: string;
}) {
  const { session, runs } =
    await loadLynxWorkflowSessionDetailBundle(workflowSessionId);
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const linkedRuns = buildLynxWorkflowLinkedRunListSurface({
    rows: runs.map((run) => ({
      id: run.id,
      promptSummary: run.promptSummary || run.id,
      route: run.route,
      workflowId: run.workflowId ?? "-",
      model: run.model,
      status: run.status,
      qualityGate: getRunQualityGateStatus(run.metadata),
      unsupportedClaims: getUnsupportedClaimCount(run.metadata),
      latency: `${run.latencyMs} ms`,
      startedAt: run.startedAt.toLocaleString(),
      href: `/lynx/runs/${run.id}`,
    })),
  });

  return (
    <GovernedPatternCListSection
      title="Linked runs"
      description="Immutable replay records connected to this durable workflow session."
      surfaceKey={`${surfaceKeys.workflowSessionRuns}.${session.id}`}
      listConfiguration={linkedRuns}
      parentAccessAllowed
      layout="embedded"
    />
  );
}
