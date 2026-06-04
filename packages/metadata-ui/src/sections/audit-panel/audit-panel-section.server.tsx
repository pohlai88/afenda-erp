import "server-only";

import type { ReactNode } from "react";

import { type MetadataUiAuditPanelInput, parseMetadataUiAuditPanel } from "../../schemas/audit-panel.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiAuditPanelRenderer } from "./audit-panel-renderer.server";

export type MetadataUiAuditPanelSectionProps = Readonly<{
  metadata: MetadataUiAuditPanelInput;
  children?: ReactNode;
}>;

export function MetadataUiAuditPanelSection({
  metadata,
  children,
}: MetadataUiAuditPanelSectionProps) {
  const auditPanel = parseMetadataUiAuditPanel(metadata);

  return (
    <MetadataUiSectionShell
      id={auditPanel.key}
      sectionKind="audit-panel"
      title={auditPanel.title}
      description={auditPanel.description}
      presentation={auditPanel.presentation}
      diagnostics={auditPanel.diagnostics}
    >
      {children ?? <MetadataUiAuditPanelRenderer metadata={auditPanel} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiAuditPanelSection;
