import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminUserRow } from "../contracts";
import { registerSystemAdminUsersGovernedActions } from "../actions/system-admin.users-governed-actions.server";
import {
  buildUsersListSurface,
  systemAdminUsersSurfaceKey,
} from "../surface/system-admin.users-list.surface";
import { systemAdminUsersUiCopy } from "../surface/system-admin.users-ui.copy.shared";
import { SystemAdminUserTrailingCell } from "./system-admin.users-trailing-cells.component.client";

export function SystemAdminUsersSection({
  users,
  canMutate,
  searchValue,
  totalCount,
}: {
  users: readonly SystemAdminUserRow[];
  canMutate: boolean;
  searchValue?: string;
  totalCount?: number;
}) {
  const copy = systemAdminUsersUiCopy.section;
  registerSystemAdminUsersGovernedActions();
  const listConfiguration = buildUsersListSurface({
    users,
    canMutate,
    searchValue,
    totalCount,
  });

  return (
    <GovernedPatternCListSection
      title={copy.title}
      description={copy.description}
      surfaceKey={systemAdminUsersSurfaceKey}
      listConfiguration={listConfiguration}
      parentAccessAllowed
      layout="embedded"
      trailingColumn={{
        header: copy.trailingHeader,
        Cell: SystemAdminUserTrailingCell,
      }}
    />
  );
}

export function SystemAdminUsersAccessDenied() {
  const pageCopy = systemAdminUsersUiCopy.page;
  const deniedCopy = systemAdminUsersUiCopy.accessDenied;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={pageCopy.title}
        description={pageCopy.description}
      />
      <SectionPanel title={deniedCopy.title}>
        <p className="type-muted">{deniedCopy.description}</p>
      </SectionPanel>
    </div>
  );
}
