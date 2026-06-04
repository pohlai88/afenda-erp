import { SectionPanel } from "@afenda/ui";
import { systemAdminModulesUiCopy } from "./sys-modules-ui.copy.shared";

export function SystemAdminModulesAccessDenied() {
  const copy = systemAdminModulesUiCopy;

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
