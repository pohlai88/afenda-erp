import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveAuditEventCard } from "../../primitives/audit-event-card.server";
import {
  type MetadataUiAuditPanelInput,
  parseMetadataUiAuditPanel,
} from "../../schemas/audit-panel.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";

export type MetadataUiAuditPanelRendererProps = Readonly<{
  metadata: MetadataUiAuditPanelInput;
}>;

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
    <ol
      className={cn("metadata-ui-audit-panel", ui.layout.sectionStack)}
      role="list"
      aria-label={auditPanel.title}
      data-metadata-ui-audit-event-count={auditPanel.events.length}
    >
      {auditPanel.events.map((event) => (
        <li key={event.key} role="listitem">
          <MetadataUiPrimitiveAuditEventCard event={event} />
        </li>
      ))}
    </ol>
  );
}

export default MetadataUiAuditPanelRenderer;
