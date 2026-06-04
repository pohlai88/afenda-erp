import { SectionPanel } from "@afenda/ui";
import { systemAdminUsersUiCopy } from "./sys-users-ui.copy.shared";

export function SystemAdminIdentityAccessDenied() {
  const copy = systemAdminUsersUiCopy.identity;

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
