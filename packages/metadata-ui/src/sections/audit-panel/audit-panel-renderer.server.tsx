import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "../../primitives/badge.server";
import { MetadataUiPrimitiveCard } from "../../primitives/card.server";
import {
  type MetadataUiAuditPanelInput,
  parseMetadataUiAuditPanel,
} from "../../schemas/audit-panel.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";

export type MetadataUiAuditPanelRendererProps = Readonly<{
  metadata: MetadataUiAuditPanelInput;
}>;

const AUDIT_EVENT_TONE_LABEL = {
  neutral: "Neutral",
  info: "Info",
  positive: "Positive",
  warning: "Warning",
  critical: "Critical",
} as const;

export function MetadataUiAuditPanelRenderer({
  metadata,
}: MetadataUiAuditPanelRendererProps) {
  const auditPanel = parseMetadataUiAuditPanel(metadata);

  if (auditPanel.events.length === 0) {
    return (
      <MetadataUiEmptyState
        title="No audit events"
        description="No audit events are available for this record."
      />
    );
  }

  return (
    <ol className={cn("metadata-ui-audit-panel", ui.layout.sectionStack)}>
      {auditPanel.events.map((event) => (
        <li key={event.key}>
          <MetadataUiPrimitiveCard
            contentClassName={cn("grid", ui.surfaceGap.sm)}
          >
            <div className="flex items-center justify-between gap-surface-sm">
              <span
                className={cn(
                  ui.typography.subtitle,
                  ui.color.ink.foreground,
                )}
              >
                {event.action}
              </span>
              <div className="flex items-center gap-surface-xs">
                <MetadataUiPrimitiveBadge tone={event.tone}>
                  {AUDIT_EVENT_TONE_LABEL[event.tone]}
                </MetadataUiPrimitiveBadge>
                <time className={cn(ui.typography.caption, ui.color.ink.muted)}>
                  {event.occurredAt}
                </time>
              </div>
            </div>
            <p className={cn(ui.typography.body, ui.color.ink.muted)}>
              {event.summary}
            </p>
            <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
              {event.actor.displayName ?? event.actor.actorId}
            </p>
          </MetadataUiPrimitiveCard>
        </li>
      ))}
    </ol>
  );
}

export default MetadataUiAuditPanelRenderer;
