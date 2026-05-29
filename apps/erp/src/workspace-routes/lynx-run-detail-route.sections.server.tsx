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
import { recordLynxRunFeedbackAction } from "@/app/(workspace)/lynx/runs/[runId]/feedback-actions";
import {
  getClaimRows,
  summarizeValidation,
} from "@/workspace-routes/lynx-run-detail-route.shared";
import { loadLynxRunDetailContext } from "@/workspace-routes/workspace-route-cache";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";

export async function LynxRunDetailHeroSection({ runId }: { runId: string }) {
  const { run } = await loadLynxRunDetailContext(runId);
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

  return (
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
            className="block type-body font-medium text-foreground underline-offset-4 hover:underline"
            href="/lynx/runs"
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
  );
}

export async function LynxRunDetailTimelineSection({ runId }: { runId: string }) {
  const { run } = await loadLynxRunDetailContext(runId);
  const surfaceKeys = getLynxReadinessSurfaceKeys();
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

  return (
    <GovernedPatternCListSection
      title="Run replay timeline"
      description="Tenant-scoped event trail for prompts, tool calls, evidence, validation, approvals, and sandbox references."
      surfaceKey={`${surfaceKeys.events}.${run.id}`}
      listConfiguration={eventTimeline}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

export async function LynxRunDetailClaimsSection({ runId }: { runId: string }) {
  const { run } = await loadLynxRunDetailContext(runId);
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const claimValidationSurface = buildLynxClaimValidationListSurface({
    rows: getClaimRows(run.events),
  });

  return (
    <GovernedPatternCListSection
      title="Claim validation"
      description="Claim-level evidence checks recorded during Truth Retrieval and tool execution."
      surfaceKey={`${surfaceKeys.claims}.${run.id}`}
      listConfiguration={claimValidationSurface}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

export async function LynxRunDetailFeedbackSection({ runId }: { runId: string }) {
  const { run } = await loadLynxRunDetailContext(runId);
  const surfaceKeys = getLynxReadinessSurfaceKeys();
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
    <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
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
  );
}
