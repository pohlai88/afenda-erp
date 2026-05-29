import { GovernedAuditPanel } from "../../components/governed-audit-panel";
import { GovernedEmpty } from "../../client";
import { parseAuditPanelData } from "../../schemas/audit-panel.schema";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "../registry";

/**
 * governed:audit-panel — IAM / org audit timeline table.
 */
export function AuditPanelRenderer({
  configuration,
  diagnostics = "user",
}: {
  configuration: unknown;
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
        }}
      />
    );
  }

  return <GovernedAuditPanel model={parsed.data} />;
}
