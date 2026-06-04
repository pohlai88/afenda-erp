import { hasExecutionPermission } from "@afenda/kernel/execution";

import { createApiCredentialFormAction, createWebhookFormAction, upsertSsoConnectionFormAction } from "./sys-integrations.actions.server";
import { buildSystemAdminIntegrationsPageModel } from "./sys-integrations.page-model.server";
import { requireSystemAdminIntegrationsRead } from "./sys-integrations.policy.server";
import {
  SystemAdminIntegrationsAccessDenied,
  SystemAdminIntegrationsSection,
} from "./sys-integrations-section.component.server";

export async function SystemAdminIntegrationsPage() {
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
