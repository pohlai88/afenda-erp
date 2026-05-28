import { requireCapability } from "@afenda/auth/server";
import {
  getLynxRunDetail,
  getLynxWorkflowSession,
  listLynxRunLedger,
} from "@afenda/db";
import {
  buildLynxWorkflowLinkedRunListSurface,
  buildLynxWorkflowSessionDetailStatGrid,
  getLynxReadinessSurfaceKeys,
} from "@afenda/feature-lynx/metadata";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { Button, SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LynxOperatorPanel } from "../../lynx-operator-panel";

type PageProps = {
  params: Promise<{ workflowSessionId: string }>;
};

function getQualityGateStatus(summary: Record<string, unknown>) {
  return typeof summary.status === "string" ? summary.status : "-";
}

function getUnsupportedClaimCount(metadata: Record<string, unknown>) {
  const gate = metadata.qualityGate;
  if (typeof gate !== "object" || gate === null) {
    return "-";
  }

  const value = (gate as Record<string, unknown>).unsupportedClaimCount;
  return typeof value === "number" ? String(value) : "-";
}

function getRunQualityGateStatus(metadata: Record<string, unknown>) {
  const gate = metadata.qualityGate;
  if (typeof gate !== "object" || gate === null) {
    return "-";
  }

  const value = (gate as Record<string, unknown>).status;
  return typeof value === "string" ? value : "-";
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: "origin" | "monitorStatus" | "severity" | "ownerAuthUserId",
) {
  const value = metadata[key];
  return typeof value === "string" ? value : undefined;
}

export default async function LynxWorkflowSessionDetailPage({
  params,
}: PageProps) {
  const { workflowSessionId } = await params;
  const { organization } = await requireCapability("dashboard.view");
  const session = await getLynxWorkflowSession({
    organizationId: organization.id,
    id: workflowSessionId,
  });

  if (!session) {
    notFound();
  }

  const [sessionRuns, latestSessionRuns] = await Promise.all([
    listLynxRunLedger({
      organizationId: organization.id,
      filters: { workflowSessionId: session.id },
      limit: 100,
    }),
    session.latestRunId
      ? listLynxRunLedger({
          organizationId: organization.id,
          runIds: [session.latestRunId],
          limit: 1,
        })
      : Promise.resolve([]),
  ]);
  const runs = Array.from(
    new Map(
      [...latestSessionRuns, ...sessionRuns].map((run) => [run.id, run]),
    ).values(),
  );
  const runDetails = await Promise.all(
    runs.map((run) =>
      getLynxRunDetail({
        organizationId: organization.id,
        runId: run.id,
      }),
    ),
  );
  const availableRunDetails = runDetails.filter(
    (detail): detail is NonNullable<typeof detail> => Boolean(detail),
  );
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
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const origin = getMetadataString(session.metadata, "origin");
  const monitorStatus = getMetadataString(session.metadata, "monitorStatus");
  const severity = getMetadataString(session.metadata, "severity");
  const ownerAuthUserId = getMetadataString(session.metadata, "ownerAuthUserId");
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
      href: `/solution-console/runs/${run.id}`,
    })),
  });
  const canResume = session.status === "active" || session.status === "paused";

  return (
    <div className="flex flex-col gap-6">
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
                <Link href="/solution-console/workflows">
                  Back to workflows
                </Link>
              </Button>
              {session.latestRunId ? (
                <Button asChild variant="ghost">
                  <Link href={`/solution-console/runs/${session.latestRunId}`}>
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

      {canResume ? (
        <SectionPanel
          title="Resume workflow"
          description="Continue this Lynx workflow session without exposing tenant context to the client or model."
        >
          <LynxOperatorPanel
            defaultWorkflowId={session.workflowId}
            workflowSessionId={session.id}
          />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title="Linked runs"
        description="Immutable replay records connected to this durable workflow session."
        surfaceKey={`${surfaceKeys.workflowSessionRuns}.${session.id}`}
        listConfiguration={linkedRuns}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
