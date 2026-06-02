import { hasExecutionPermission } from "@afenda/kernel/execution";
import { isOrganizationDocumentLegalHoldActive } from "@afenda/db";

import { updateSystemAdminSecuritySettingsAction } from "../actions";
import { buildSystemAdminSecurityPageModel } from "../data";
import { requireSystemAdminSecurityRead } from "../policies";
import {
  SystemAdminSecurityAccessDenied,
  SystemAdminSecuritySection,
} from "./system-admin.security-section.component.server";

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

  const [{ security, readiness, recentChanges, quarantineWindow, storageQuota }, organizationLegalHoldActive] =
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
      capabilities={guard.context.capabilities}
      organizationLegalHoldActive={organizationLegalHoldActive}
      canMutate={canMutate}
      updateSecuritySettingsAction={updateSystemAdminSecuritySettingsAction}
    />
  );
}
