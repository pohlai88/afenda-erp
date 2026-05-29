import { systemAdminSecurityUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminSecurityPageModel,
  requireSystemAdminSecurityRead,
  SystemAdminSecurityAccessDenied,
  SystemAdminSecuritySection,
  updateSystemAdminSecuritySettingsAction,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — System admin",
  description: systemAdminSecurityUiCopy.page.description,
};

export default async function SystemAdminSecurityPage() {
  let organization: Awaited<
    ReturnType<typeof requireSystemAdminSecurityRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminSecurityRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminSecurityRead());
  } catch {
    return <SystemAdminSecurityAccessDenied />;
  }

  const canMutate =
    hasExecutionPermission(context, "system-admin.security.manage") ||
    hasExecutionPermission(context, "system-admin.settings.write");

  const { security, readiness, recentChanges } =
    await buildSystemAdminSecurityPageModel({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
    });

  return (
    <SystemAdminSecuritySection
      security={security}
      readiness={readiness}
      recentChanges={recentChanges}
      canMutate={canMutate}
      updateSecuritySettingsAction={updateSystemAdminSecuritySettingsAction}
    />
  );
}
