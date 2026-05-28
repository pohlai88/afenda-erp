import { requireCapability } from "@afenda/auth/server";
import { getLynxRunDetail } from "@afenda/db";
import type { LynxRunEventSummary } from "@afenda/db";
import {
  buildLynxClaimValidationListSurface,
  buildLynxRunDetailStatGrid,
  buildLynxRunEventTimelineListSurface,
  buildLynxRunFeedbackListSurface,
  getLynxReadinessSurfaceKeys,
} from "@afenda/feature-lynx/metadata";
import { LynxRunFeedbackForm } from "@afenda/feature-lynx/client";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recordLynxRunFeedbackAction } from "./feedback-actions";

type PageProps = {
  params: Promise<{ runId: string }>;
};

function summarizeValidation(metrics: Record<string, unknown>) {
  const qualityGate =
    typeof metrics.qualityGate === "object" && metrics.qualityGate !== null
      ? (metrics.qualityGate as Record<string, unknown>)
      : null;

  if (typeof qualityGate?.status === "string") {
    return qualityGate.status;
  }

  const hasRequiredSections = metrics.hasRequiredSections;
  const invalidCitations = metrics.invalidCitations;

  if (Object.keys(metrics).length === 0) {
    return "-";
  }

  if (
    hasRequiredSections === false ||
    (Array.isArray(invalidCitations) && invalidCitations.length > 0)
  ) {
    return "review";
  }

  return "passed";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getClaimRows(events: LynxRunEventSummary[]) {
  return events.flatMap((event) => {
    const claims = event.metadata.claims;
    if (!Array.isArray(claims)) {
      return [];
    }

    return claims.filter(isRecord).map((result, index) => {
      const claim = isRecord(result.claim) ? result.claim : {};
      const evidenceLinks = Array.isArray(result.evidenceLinks)
        ? result.evidenceLinks.filter(isRecord)
        : [];

      return {
        id: `${event.id}.${index}`,
        claim: typeof claim.text === "string" ? claim.text : "-",
        status: typeof result.status === "string" ? result.status : "-",
        evidence:
          evidenceLinks
            .map((link) =>
              typeof link.evidenceId === "string" ? link.evidenceId : null,
            )
            .filter(Boolean)
            .join(", ") || "-",
        reason: typeof result.reason === "string" ? result.reason : "-",
      };
    });
  });
}

export default async function LynxRunDetailPage({ params }: PageProps) {
  const { runId } = await params;
  const { organization } = await requireCapability("dashboard.view");
  const run = await getLynxRunDetail({
    organizationId: organization.id,
    runId,
  });

  if (!run) {
    notFound();
  }

  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const evidenceReferenceCount = run.events.reduce(
    (total, event) => total + event.evidenceReferences.length,
    0,
  );
  const toolCallCount = run.events.filter((event) => event.toolName).length;
  const statGrid = buildLynxRunDetailStatGrid({
    eventCount: run.events.length,
    toolCallCount,
    evidenceReferenceCount,
    feedbackCount: run.feedback.length,
    latencyMs: run.latencyMs,
    status: run.status,
  });
  const eventTimeline = buildLynxRunEventTimelineListSurface({
    rows: run.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      summary: event.summary,
      toolName: event.toolName ?? "-",
      evidenceCount: String(event.evidenceReferences.length),
      validation: summarizeValidation(event.validationMetrics),
      approvalProposalId: event.approvalProposalId ?? "-",
      sandboxId: event.sandboxId ?? "-",
      createdAt: event.createdAt.toLocaleString(),
    })),
  });
  const claimValidationSurface = buildLynxClaimValidationListSurface({
    rows: getClaimRows(run.events),
  });
  const feedbackSurface = buildLynxRunFeedbackListSurface({
    rows: run.feedback.map((feedback) => ({
      id: feedback.id,
      rating: feedback.rating,
      category: feedback.category,
      note: feedback.note,
      createdAt: feedback.createdAt.toLocaleString(),
    })),
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        eyebrow="Lynx run replay"
        headingLevel={1}
        title={run.promptSummary || "Lynx run detail"}
        description={`${run.route} · ${run.model}`}
        aside={
          <div className="flex flex-col gap-3 text-right">
            <StatusBadge
              label={run.status}
              tone={
                run.status === "completed"
                  ? "positive"
                  : run.status === "failed"
                    ? "warning"
                    : "neutral"
              }
            />
            <Link
              className="block text-sm font-medium text-foreground underline-offset-4 hover:underline"
              href="/solution-console/runs"
            >
              Back to run console
            </Link>
          </div>
        }
      >
        <GovernedPatternBStatSection
          title="Run overview"
          surfaceKey={`${surfaceKeys.stats}.${run.id}`}
          layout="embedded"
          statGroups={[
            {
              groupKey: "lynx-run-detail",
              configuration: statGrid,
            },
          ]}
        />
      </SectionPanel>

      <GovernedPatternCListSection
        title="Run replay timeline"
        description="Tenant-scoped event trail for prompts, tool calls, evidence, validation, approvals, and sandbox references."
        surfaceKey={`${surfaceKeys.events}.${run.id}`}
        listConfiguration={eventTimeline}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Claim validation"
        description="Claim-level evidence checks recorded during Truth Retrieval and tool execution."
        surfaceKey={`${surfaceKeys.claims}.${run.id}`}
        listConfiguration={claimValidationSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
        <GovernedPatternCListSection
          title="Operator feedback"
          surfaceKey={`${surfaceKeys.feedback}.${run.id}`}
          listConfiguration={feedbackSurface}
          parentAccessAllowed
          layout="embedded"
        />

        <SectionPanel
          title="Record feedback"
          description="Attach operator quality feedback to this replayable Lynx run."
        >
          <LynxRunFeedbackForm
            recordFeedbackAction={recordLynxRunFeedbackAction}
            runId={run.id}
          />
        </SectionPanel>
      </div>
    </div>
  );
}
