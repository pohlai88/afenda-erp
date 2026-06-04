import { hasExecutionPermission } from "@afenda/kernel/execution";

import {
  createApiCredentialFormAction,
  createWebhookFormAction,
  upsertSsoConnectionFormAction,
} from "../actions";
import { buildSystemAdminIntegrationsPageModel } from "../data";
import { requireSystemAdminIntegrationsRead } from "./sys-integrations.policy.server";
import {
  SystemAdminIntegrationsAccessDenied,
  SystemAdminIntegrationsSection,
} from "./system-admin.integrations-section.component.server";

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
