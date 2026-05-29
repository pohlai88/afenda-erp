import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminMembershipRow } from "../contracts";
import {
  buildMembersListSurface,
  systemAdminMembersSurfaceKey,
} from "../surface/system-admin.memberships-list.surface";
import { systemAdminMembershipsUiCopy } from "../surface/system-admin.memberships-ui.copy.shared";
import { SystemAdminMembershipTrailingCell } from "./system-admin.memberships-trailing-cells.component.client";

export function SystemAdminMembershipsSection({
  memberships,
  canMutate,
  canManageRoles,
  searchValue,
  totalCount,
}: {
  memberships: readonly SystemAdminMembershipRow[];
  canMutate: boolean;
  canManageRoles: boolean;
  searchValue?: string;
  totalCount?: number;
}) {
  const listConfiguration = buildMembersListSurface({
    memberships,
    canMutate,
    canManageRoles,
    searchValue,
    totalCount,
  });

  const copy = systemAdminMembershipsUiCopy.section;

  return (
    <GovernedPatternCListSection
      title={copy.title}
      description={copy.description}
      surfaceKey={systemAdminMembersSurfaceKey}
      listConfiguration={listConfiguration}
      parentAccessAllowed
      layout="embedded"
      trailingColumn={{
        header: copy.trailingHeader,
        Cell: SystemAdminMembershipTrailingCell,
      }}
    />
  );
}

export function SystemAdminMembershipsAccessDenied() {
  const pageCopy = systemAdminMembershipsUiCopy.page;
  const deniedCopy = systemAdminMembershipsUiCopy.accessDenied;

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
