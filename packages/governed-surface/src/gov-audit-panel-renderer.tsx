import { GovernedAuditPanel } from "./gov-governed-audit-panel";
import { GovernedEmpty } from "./gov-governed-empty";
import { parseAuditPanelData } from "./gov-audit-panel-schema";
import { governedParseErrorCopy } from "./gov-governed-renderer-copy-shared";

import type { RendererProps } from "./gov-governed-renderer-dispatch";
import type { GovernedComponentRendererDiagnostics } from "./gov-registry";

/**
 * governed:audit-panel — IAM / org audit timeline table.
 */
export function AuditPanelRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: RendererProps & {
  diagnostics?: GovernedComponentRendererDiagnostics;
}) {
  const parsed = parseAuditPanelData(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "auditPanel");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
          emptyId: "audit-panel-parse-error",
        }}
      />
    );
  }

  return (
    <GovernedAuditPanel
      model={parsed.data}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey ?? sectionKey ?? surfaceKey ?? "audit-panel"}
    />
  );
}
