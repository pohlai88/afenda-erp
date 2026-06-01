import { SectionPanel } from "@afenda/ui";
import { systemAdminCapabilitiesUiCopy } from "../surface/system-admin.capabilities-ui.copy.shared";

export function SystemAdminCapabilitiesAccessDenied() {
  const copy = systemAdminCapabilitiesUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={2}
        title={copy.page.title}
        description={copy.page.description}
      />
      <SectionPanel title={copy.accessDenied.title}>
        <p className="type-muted">{copy.accessDenied.description}</p>
      </SectionPanel>
    </div>
  );
}
