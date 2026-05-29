import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { OrganizationSecuritySettings } from "../contracts/system-admin.security-settings.contract";
import type { SecurityReadinessReport } from "../contracts/system-admin.security-readiness.contract";
import type { SystemAdminDiagnosticsRecentChangeRow } from "../../diagnostics/contracts/system-admin.diagnostics-coverage.contract";
import {
  buildSystemAdminSecurityRecentChangesListSurface,
  buildSystemAdminSecuritySettingsListSurface,
  systemAdminSecurityRecentChangesSurfaceKey,
  systemAdminSecuritySurfaceKey,
  systemAdminSecurityUiCopy,
} from "../surface";
import { SystemAdminSecurityForm } from "./system-admin.security-form.component.client";

type UpdateSecuritySettingsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminSecuritySection({
  security,
  readiness,
  recentChanges,
  canMutate,
  updateSecuritySettingsAction,
}: {
  security: OrganizationSecuritySettings | null;
  readiness: SecurityReadinessReport;
  recentChanges: readonly SystemAdminDiagnosticsRecentChangeRow[];
  canMutate: boolean;
  updateSecuritySettingsAction: UpdateSecuritySettingsAction;
}) {
  const copy = systemAdminSecurityUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      <GovernedPatternCListSection
        title={copy.posture.title}
        surfaceKey={systemAdminSecuritySurfaceKey}
        listConfiguration={buildSystemAdminSecuritySettingsListSurface({
          security,
          readiness,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.recentChanges.title}
        description={copy.recentChanges.description}
        surfaceKey={systemAdminSecurityRecentChangesSurfaceKey}
        listConfiguration={buildSystemAdminSecurityRecentChangesListSurface({
          rows: recentChanges,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate && security ? (
        <SectionPanel
          title={copy.form.title}
          description={copy.form.description}
        >
          <SystemAdminSecurityForm
            security={security}
            updateSecuritySettingsAction={updateSecuritySettingsAction}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}

export function SystemAdminSecurityAccessDenied() {
  const copy = systemAdminSecurityUiCopy;

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
