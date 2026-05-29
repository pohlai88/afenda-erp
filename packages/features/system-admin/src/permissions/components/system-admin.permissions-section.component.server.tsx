import type { RoleOverrideRow } from "@afenda/db";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Alert, AlertDescription, SectionPanel } from "@afenda/ui";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import {
  buildPermissionsListSurface,
  systemAdminPermissionsSurfaceKey,
} from "../surface/system-admin.permissions-list.surface";
import {
  buildRoleOverridesListSurface,
  systemAdminRoleOverridesSurfaceKey,
} from "../surface/system-admin.role-overrides-list.surface";
import { systemAdminPermissionsUiCopy } from "../surface/system-admin.permissions-ui.copy.shared";
import { RoleOverrideForm } from "./system-admin.role-override-form.component.client";

type PermissionListRow = {
  id: string;
  permission: string;
  module: string;
  group: string;
  label: string;
  description: string;
  capabilityCount: string;
  roleCount: string;
  status: string;
  coverageVerdict: string;
  riskLevel: string;
};

type SetRoleOverrideAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminPermissionsSection({
  permissions,
  roleOverrides,
  searchValue,
  coverageFilter,
  missingPermissionCount,
  canManage,
  setRoleOverrideAction,
}: {
  permissions: readonly PermissionListRow[];
  roleOverrides: readonly RoleOverrideRow[];
  searchValue?: string;
  coverageFilter?: string;
  missingPermissionCount: number;
  canManage: boolean;
  setRoleOverrideAction: SetRoleOverrideAction;
}) {
  const copy = systemAdminPermissionsUiCopy;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      {missingPermissionCount > 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            {copy.missingCatalogAlert(missingPermissionCount)}
          </AlertDescription>
        </Alert>
      ) : null}

      <GovernedPatternCListSection
        title={copy.catalog.title}
        surfaceKey={systemAdminPermissionsSurfaceKey}
        listConfiguration={buildPermissionsListSurface({
          searchValue,
          coverageFilter,
          permissions,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.overrides.title}
        description={copy.overrides.description}
        surfaceKey={systemAdminRoleOverridesSurfaceKey}
        listConfiguration={buildRoleOverridesListSurface({ overrides: roleOverrides })}
        parentAccessAllowed
        layout="embedded"
      />

      {canManage ? (
        <SectionPanel
          title={copy.bundleForm.title}
          description={copy.bundleForm.description}
        >
          <RoleOverrideForm setRoleOverrideAction={setRoleOverrideAction} />
        </SectionPanel>
      ) : null}
    </div>
  );
}

export function SystemAdminPermissionsAccessDenied() {
  const copy = systemAdminPermissionsUiCopy;

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
