import { SectionPanel } from "@afenda/ui";
import { systemAdminReliabilityUiCopy } from "./sys-reliability-ui.copy.shared";

export function SystemAdminReliabilityAccessDenied() {
  const copy = systemAdminReliabilityUiCopy;

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
