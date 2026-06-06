import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "./badge.server";
import { MetadataUiPrimitiveCard } from "./card.server";
import type { MetadataUiAuditEvent } from "../schemas/audit-panel.schema";

export type MetadataUiPrimitiveAuditEventCardProps = Readonly<{
  event: MetadataUiAuditEvent;
  className?: string;
}>;

const AUDIT_EVENT_TONE_LABEL = {
  neutral: "Neutral",
  info: "Info",
  positive: "Positive",
  warning: "Warning",
  critical: "Critical",
} as const;

const AUDIT_ACTOR_TYPE_LABEL = {
  user: "User",
  system: "System",
  integration: "Integration",
  service: "Service",
} as const;

function formatMetadataUiAuditEventTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MetadataUiPrimitiveAuditEventCard({
  event,
  className,
}: MetadataUiPrimitiveAuditEventCardProps) {
  const sourceMarkers = [
    event.source?.moduleKey,
    event.source?.featureKey,
    event.source?.requestId,
    event.source?.correlationId,
  ].filter(Boolean) as string[];
  const metadataFieldCount = event.metadata
    ? Object.keys(event.metadata).length
    : 0;

  return (
    <MetadataUiPrimitiveCard
      className={cn("metadata-ui-audit-event-card", className)}
      eyebrow={event.actor.displayName ?? event.actor.actorId}
      title={event.action}
      description={event.summary}
      meta={
        <div className="flex flex-wrap items-center gap-surface-xs">
          <MetadataUiPrimitiveBadge tone={event.tone}>
            {AUDIT_EVENT_TONE_LABEL[event.tone]}
          </MetadataUiPrimitiveBadge>
          <MetadataUiPrimitiveBadge tone="muted">
            {AUDIT_ACTOR_TYPE_LABEL[event.actor.actorType]}
          </MetadataUiPrimitiveBadge>
          <time className={cn(ui.typography.caption, ui.color.ink.muted)} dateTime={event.occurredAt}>
            {formatMetadataUiAuditEventTimestamp(event.occurredAt)}
          </time>
        </div>
      }
      contentClassName="grid gap-surface-sm"
      data-metadata-ui-audit-event={event.key}
      data-metadata-ui-audit-event-actor-type={event.actor.actorType}
      data-metadata-ui-audit-event-target-type={event.target?.targetType}
      data-metadata-ui-audit-event-has-metadata={metadataFieldCount > 0}
    >
      <div className="grid gap-surface-xs">
        {event.target ? (
          <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
            Target:{" "}
            <span className={ui.color.ink.foreground}>
              {event.target.label ?? event.target.targetId}
            </span>
          </p>
        ) : null}
        {event.reason ? (
          <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
            Reason: <span className={ui.color.ink.foreground}>{event.reason}</span>
          </p>
        ) : null}
        {sourceMarkers.length > 0 ? (
          <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
            Source:{" "}
            <span className={ui.color.ink.foreground}>
              {sourceMarkers.join(" · ")}
            </span>
          </p>
        ) : null}
        {metadataFieldCount > 0 ? (
          <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
            Metadata:{" "}
            <span className={ui.color.ink.foreground}>
              {metadataFieldCount} field{metadataFieldCount === 1 ? "" : "s"}
            </span>
          </p>
        ) : null}
      </div>
    </MetadataUiPrimitiveCard>
  );
}
 
