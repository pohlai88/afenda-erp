import { hasExecutionPermission } from "@afenda/kernel/execution";
import { isOrganizationDocumentLegalHoldActive } from "@afenda/db";

import { updateSystemAdminSecuritySettingsAction } from "./sys-security.actions.server";
import { updateOrganizationObjectStorageProviderAction } from "./sys-object-storage-provider.actions.server";
import { updateOrganizationEncryptionSettingsAction } from "./sys-object-storage-encryption.actions.server";
import { buildSystemAdminSecurityPageModel } from "./sys-security.page-model.server";
import { requireSystemAdminSecurityRead } from "./sys-security.policy.server";
import {
  SystemAdminSecurityAccessDenied,
  SystemAdminSecuritySection,
} from "./sys-security-section.component.server";

export async function SystemAdminSecurityPage() {
  let guard: Awaited<ReturnType<typeof requireSystemAdminSecurityRead>>;

  try {
    guard = await requireSystemAdminSecurityRead();
  } catch {
    return <SystemAdminSecurityAccessDenied />;
  }

  const canMutate =
    hasExecutionPermission(guard.context, "system-admin.security.manage") ||
    hasExecutionPermission(guard.context, "system-admin.settings.write");

  const [{ security, readiness, recentChanges, quarantineWindow, storageQuota, objectStorageProvider, deploymentProvider, encryptionSettings }, organizationLegalHoldActive] =
    await Promise.all([
      buildSystemAdminSecurityPageModel({
        organizationId: guard.organization.id,
        actorId: guard.context.userId,
        actorType: guard.context.actorType,
      }),
      isOrganizationDocumentLegalHoldActive(guard.organization.id),
    ]);

  return (
    <SystemAdminSecuritySection
      security={security}
      readiness={readiness}
      recentChanges={recentChanges}
      quarantineWindow={quarantineWindow}
      storageQuota={storageQuota}
      objectStorageProvider={objectStorageProvider}
      deploymentProvider={deploymentProvider}
      encryptionSettings={encryptionSettings}
      capabilities={guard.context.capabilities}
      organizationLegalHoldActive={organizationLegalHoldActive}
      canMutate={canMutate}
      updateSecuritySettingsAction={updateSystemAdminSecuritySettingsAction}
      updateObjectStorageProviderAction={updateOrganizationObjectStorageProviderAction}
      updateEncryptionSettingsAction={updateOrganizationEncryptionSettingsAction}
    />
  );
}
