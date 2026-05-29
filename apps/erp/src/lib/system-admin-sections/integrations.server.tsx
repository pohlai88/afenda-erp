import { systemAdminIntegrationsUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminIntegrationsPageModel,
  createApiCredentialFormAction,
  createWebhookFormAction,
  requireSystemAdminIntegrationsRead,
  SystemAdminIntegrationsAccessDenied,
  SystemAdminIntegrationsSection,
  upsertSsoConnectionFormAction,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — System admin",
  description: systemAdminIntegrationsUiCopy.page.description,
};

export default async function SystemAdminIntegrationsPage() {
  try {
    const { organization, context } = await requireSystemAdminIntegrationsRead();
    const canMutate =
      hasExecutionPermission(context, "system-admin.integrations.write") ||
      hasExecutionPermission(context, "system-admin.settings.write");

    const pageModel = await buildSystemAdminIntegrationsPageModel({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
    });

    return (
      <SystemAdminIntegrationsSection
        {...pageModel}
        canMutate={canMutate}
        createApiCredentialFormAction={createApiCredentialFormAction}
        createWebhookFormAction={createWebhookFormAction}
        upsertSsoConnectionFormAction={upsertSsoConnectionFormAction}
      />
    );
  } catch {
    return <SystemAdminIntegrationsAccessDenied />;
  }
}
