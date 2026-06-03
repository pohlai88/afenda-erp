import { SectionPanel } from "@afenda/ui";
import { systemAdminDiagnosticsUiCopy } from "../surface/system-admin.diagnostics-ui.copy.shared";

export function SystemAdminDiagnosticsAccessDenied() {
  const copy = systemAdminDiagnosticsUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <SectionPanel title={copy.accessDenied.title}>
        <p className="type-muted">{copy.accessDenied.description}</p>
      </SectionPanel>
    </div>
  );
}
