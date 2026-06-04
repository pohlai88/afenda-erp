import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "../../primitives/badge.server";
import { MetadataUiPrimitiveCard } from "../../primitives/card.server";
import {
  parseMetadataUiApprovalTimeline,
  type MetadataUiApprovalTimelineInput,
  type MetadataUiApprovalTimelineStepStatus,
} from "../../schemas/approval-timeline.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";

export type MetadataUiApprovalTimelineRendererProps = Readonly<{
  metadata: MetadataUiApprovalTimelineInput;
}>;

const APPROVAL_TIMELINE_STATUS_LABEL = {
  "not-started": "Not started",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  skipped: "Skipped",
  blocked: "Blocked",
  failed: "Failed",
} as const satisfies Record<MetadataUiApprovalTimelineStepStatus, string>;

const APPROVAL_TIMELINE_STATUS_TONE = {
  "not-started": "neutral",
  pending: "info",
  approved: "positive",
  rejected: "critical",
  skipped: "neutral",
  blocked: "warning",
  failed: "critical",
} as const satisfies Record<
  MetadataUiApprovalTimelineStepStatus,
  "critical" | "info" | "neutral" | "positive" | "warning"
>;

export function MetadataUiApprovalTimelineRenderer({
  metadata,
}: MetadataUiApprovalTimelineRendererProps) {
  const timeline = parseMetadataUiApprovalTimeline(metadata);

  if (timeline.steps.length === 0) {
    return (
      <MetadataUiEmptyState
        title="No approval steps recorded"
        description="Steps appear here when an approval flow is active for this record."
      />
    );
  }

  const orderedSteps = [...timeline.steps].sort((left, right) => left.order - right.order);

  return (
    <ol
      className={cn("metadata-ui-approval-timeline", ui.layout.sectionStack)}
      data-metadata-ui-approval-timeline={timeline.key}
    >
      {orderedSteps.map((step) => {
        const isCurrent = step.key === timeline.currentStepKey;

        return (
          <li
            key={step.key}
            aria-current={isCurrent ? "step" : undefined}
            data-metadata-ui-approval-step={step.key}
            data-metadata-ui-approval-step-status={step.status}
          >
            <MetadataUiPrimitiveCard contentClassName={cn("grid", ui.surfaceGap.sm)}>
              <div className="flex flex-wrap items-start justify-between gap-surface-sm">
                <div className="grid gap-surface-2xs">
                  <span className={cn(ui.typography.subtitle, ui.color.ink.foreground)}>
                    {step.label}
                  </span>
                  {step.description ? (
                    <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                      {step.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-surface-xs">
                  {isCurrent ? (
                    <MetadataUiPrimitiveBadge tone="info">Current</MetadataUiPrimitiveBadge>
                  ) : null}
                  <MetadataUiPrimitiveBadge tone={APPROVAL_TIMELINE_STATUS_TONE[step.status]}>
                    {APPROVAL_TIMELINE_STATUS_LABEL[step.status]}
                  </MetadataUiPrimitiveBadge>
                </div>
              </div>
              <div className={cn("grid gap-surface-2xs", ui.typography.caption, ui.color.ink.muted)}>
                {step.actor ? (
                  <p>{step.actor.displayName ?? step.actor.actorId}</p>
                ) : null}
                {step.occurredAt ? <time dateTime={step.occurredAt}>{step.occurredAt}</time> : null}
                {step.dueAt ? (
                  <p>
                    Due <time dateTime={step.dueAt}>{step.dueAt}</time>
                  </p>
                ) : null}
                {step.comment ? <p>{step.comment}</p> : null}
                {step.reason ? <p>{step.reason}</p> : null}
              </div>
            </MetadataUiPrimitiveCard>
          </li>
        );
      })}
    </ol>
  );
}

export default MetadataUiApprovalTimelineRenderer;
