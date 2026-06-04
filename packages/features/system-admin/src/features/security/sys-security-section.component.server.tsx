import { GovernedPatternBStatSection, GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { AppCapability } from "@afenda/kernel";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import { SystemAdminDocumentQuarantineInboxSection } from "../tenant-execution/sys-document-quarantine-inbox-section.component.server";
import type { SystemAdminDocumentQuarantineInboxWindow } from "../tenant-execution/sys-document-quarantine-inbox.read-model.server";
import type { OrganizationStorageQuotaSnapshot } from "../tenant-execution/sys-organization-storage-quota.read-model.server";
import {
  buildSystemAdminOrganizationStorageQuotaStatGroups,
  systemAdminOrganizationStorageQuotaSurfaceKey,
} from "../tenant-execution/sys-organization-storage-quota-stat.surface";
import type { OrganizationSecuritySettings } from "./sys-security-settings.contract";
import type { SecurityReadinessReport } from "./sys-security-readiness.contract";
import type { SystemAdminDiagnosticsRecentChangeRow } from "../diagnostics/sys-diagnostics-coverage.contract";
import { buildSystemAdminSecurityRecentChangesListSurface, systemAdminSecurityRecentChangesSurfaceKey } from "./sys-security-recent-changes.surface";
import { buildSystemAdminSecuritySettingsListSurface, systemAdminSecuritySurfaceKey } from "./sys-security-list.surface";
import { systemAdminSecurityUiCopy } from "./sys-security-ui.copy.shared";
import { SystemAdminSecurityForm } from "./sys-security-form.component.client";
import { SystemAdminObjectStorageProviderForm } from "./sys-object-storage-provider-form.component.client";
import { SystemAdminObjectStorageEncryptionForm } from "./sys-object-storage-encryption-form.component.client";

type UpdateSecuritySettingsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminSecuritySection({
  security,
  readiness,
  recentChanges,
  quarantineWindow,
  storageQuota,
  objectStorageProvider,
  deploymentProvider,
  encryptionSettings,
  capabilities,
  organizationLegalHoldActive,
  canMutate,
  updateSecuritySettingsAction,
  updateObjectStorageProviderAction,
  updateEncryptionSettingsAction,
}: {
  security: OrganizationSecuritySettings | null;
  readiness: SecurityReadinessReport;
  recentChanges: readonly SystemAdminDiagnosticsRecentChangeRow[];
  quarantineWindow: SystemAdminDocumentQuarantineInboxWindow;
  storageQuota: OrganizationStorageQuotaSnapshot;
  objectStorageProvider: "vercel-blob" | "r2" | "s3" | null;
  deploymentProvider: "vercel-blob" | "r2" | "s3";
  encryptionSettings: {
    mode: "platform" | "customer-managed";
    kmsAdapter: "vault-transit" | "aws-kms" | null;
    kmsKeyRef: string | null;
  };
  capabilities: readonly AppCapability[];
  organizationLegalHoldActive: boolean;
  canMutate: boolean;
  updateSecuritySettingsAction: UpdateSecuritySettingsAction;
  updateObjectStorageProviderAction: (
    state: SystemAdminActionResult | undefined,
    payload: FormData,
  ) => Promise<SystemAdminActionResult | undefined>;
  updateEncryptionSettingsAction: (
    state: SystemAdminActionResult | undefined,
    payload: FormData,
  ) => Promise<SystemAdminActionResult | undefined>;
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
          objectStorageProvider,
          deploymentProvider,
          encryptionSettings,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternBStatSection
        title={copy.storage.title}
        description={copy.storage.description}
        surfaceKey={systemAdminOrganizationStorageQuotaSurfaceKey}
        layout="embedded"
        statGroups={buildSystemAdminOrganizationStorageQuotaStatGroups({
          snapshot: storageQuota,
        })}
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

      <SystemAdminDocumentQuarantineInboxSection
        quarantineWindow={quarantineWindow}
        capabilities={capabilities}
        organizationLegalHoldActive={organizationLegalHoldActive}
      />

      {canMutate ? (
        <SectionPanel
          title={copy.objectStorageProvider.title}
          description={copy.objectStorageProvider.description}
        >
          <SystemAdminObjectStorageProviderForm
            objectStorageProvider={objectStorageProvider}
            deploymentProvider={deploymentProvider}
            updateObjectStorageProviderAction={updateObjectStorageProviderAction}
          />
        </SectionPanel>
      ) : null}

      {canMutate ? (
        <SectionPanel
          title={copy.objectStorageEncryption.title}
          description={copy.objectStorageEncryption.description}
        >
          <SystemAdminObjectStorageEncryptionForm
            encryptionMode={encryptionSettings.mode}
            kmsAdapter={encryptionSettings.kmsAdapter}
            kmsKeyRef={encryptionSettings.kmsKeyRef}
            updateEncryptionSettingsAction={updateEncryptionSettingsAction}
          />
        </SectionPanel>
      ) : null}

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
