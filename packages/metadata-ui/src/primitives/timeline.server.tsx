import "server-only";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiApprovalTimelineInput,
  MetadataUiApprovalTimelineStep,
  MetadataUiApprovalTimelineStepStatus,
} from "../schemas/approval-timeline.schema";
import { parseMetadataUiApprovalTimeline } from "../schemas/approval-timeline.schema";
import { MetadataUiPrimitiveBadge } from "./badge.server";
import { MetadataUiPrimitiveEmptyState } from "./empty.server";

export type MetadataUiPrimitiveTimelineProps = Readonly<{
  timeline: MetadataUiApprovalTimelineInput;
  className?: string;
}>;

const TIMELINE_STATUS_TONE = {
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

const TIMELINE_ACTOR_TYPE_LABEL = {
  user: "User",
  group: "Group",
  system: "System",
  integration: "Integration",
} as const;

function renderMetadataUiTimelineStepActor(step: MetadataUiApprovalTimelineStep) {
  if (!step.actor) {
    return null;
  }

  return step.actor.displayName ?? step.actor.actorId;
}

function formatMetadataUiTimelineDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMetadataUiTimelineStatusLabel(
  status: MetadataUiApprovalTimelineStepStatus,
) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function MetadataUiPrimitiveTimeline({
  timeline,
  className,
}: MetadataUiPrimitiveTimelineProps) {
  const resolvedTimeline = parseMetadataUiApprovalTimeline(timeline);

  if (resolvedTimeline.steps.length === 0) {
    return (
      <MetadataUiPrimitiveEmptyState
        title="No timeline entries"
        description="Timeline entries appear when the workflow advances."
      />
    );
  }

  const orderedSteps = [...resolvedTimeline.steps].sort((left, right) => left.order - right.order);

  return (
    <ol
      className={cn("metadata-ui-timeline grid gap-surface-sm", className)}
      role="list"
      aria-label={resolvedTimeline.title}
      data-metadata-ui-timeline-step-count={orderedSteps.length}
      data-metadata-ui-timeline-current-step-key={resolvedTimeline.currentStepKey}
    >
      {orderedSteps.map((step) => {
        const isCurrent = step.key === resolvedTimeline.currentStepKey;
        const metadataFieldCount = step.metadata ? Object.keys(step.metadata).length : 0;

        return (
          <li
            key={step.key}
            role="listitem"
            aria-current={isCurrent ? "step" : undefined}
            data-metadata-ui-timeline-step={step.key}
            data-metadata-ui-timeline-step-status={step.status}
            data-metadata-ui-timeline-step-current={isCurrent}
            data-metadata-ui-timeline-step-actor-type={step.actor?.actorType}
            data-metadata-ui-timeline-step-has-metadata={metadataFieldCount > 0}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-surface-sm">
                  <div className="grid min-w-0 gap-surface-2xs">
                    <CardTitle>{step.label}</CardTitle>
                    {step.description ? <CardDescription>{step.description}</CardDescription> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-surface-xs">
                    {isCurrent ? <MetadataUiPrimitiveBadge tone="info">Current</MetadataUiPrimitiveBadge> : null}
                    <MetadataUiPrimitiveBadge tone={TIMELINE_STATUS_TONE[step.status]}>
                      {formatMetadataUiTimelineStatusLabel(step.status)}
                    </MetadataUiPrimitiveBadge>
                    {step.actor ? (
                      <MetadataUiPrimitiveBadge tone="muted">
                        {TIMELINE_ACTOR_TYPE_LABEL[step.actor.actorType]}
                      </MetadataUiPrimitiveBadge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cn("grid gap-surface-2xs", ui.typography.caption, ui.color.ink.muted)}>
                {renderMetadataUiTimelineStepActor(step) ? <p>{renderMetadataUiTimelineStepActor(step)}</p> : null}
                {step.occurredAt ? (
                  <time dateTime={step.occurredAt}>{formatMetadataUiTimelineDate(step.occurredAt)}</time>
                ) : null}
                {step.dueAt ? (
                  <p>
                    Due <time dateTime={step.dueAt}>{formatMetadataUiTimelineDate(step.dueAt)}</time>
                  </p>
                ) : null}
                {step.comment ? <p>{step.comment}</p> : null}
                {step.reason ? <p>{step.reason}</p> : null}
                {metadataFieldCount > 0 ? (
                  <p>
                    Metadata:{" "}
                    <span className={ui.color.ink.foreground}>
                      {metadataFieldCount} field{metadataFieldCount === 1 ? "" : "s"}
                    </span>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
