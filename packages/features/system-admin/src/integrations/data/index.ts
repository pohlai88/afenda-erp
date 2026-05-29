import {
  listApiCredentials,
  listSsoConnections,
  listWebhookDeliveries,
  listWebhooks,
} from "./system-admin.integrations.repository.server";

export {
  listApiCredentials,
  listSsoConnections,
  listWebhookDeliveries,
  listWebhooks,
};

/** Architecture alias for tenant-scoped integration posture reads. */
export async function listSystemAdminIntegrations(input: {
  organizationId: string;
  limit?: number;
}) {
  const limit = input.limit ?? 100;
  const [credentials, webhooks, deliveries, ssoConnections] = await Promise.all([
    listApiCredentials({ organizationId: input.organizationId, limit }),
    listWebhooks({ organizationId: input.organizationId, limit }),
    listWebhookDeliveries({ organizationId: input.organizationId, limit: 50 }),
    listSsoConnections({ organizationId: input.organizationId, limit: 50 }),
  ]);

  return { credentials, webhooks, deliveries, ssoConnections };
}
export { authenticateSystemAdminApiCredential } from "./system-admin.api-credential-auth.repository.server";
export {
  mapApiCredentialToListRow,
  mapSsoConnectionToListRow,
  mapWebhookDeliveryToListRow,
  mapWebhookToListRow,
} from "./system-admin.integrations.mapper.server";
export { evaluateIntegrationsReadiness } from "./system-admin.integrations.readiness.server";
export {
  buildSystemAdminIntegrationsPageModel,
  type SystemAdminIntegrationsPageModel,
} from "./system-admin.integrations.page-model.server";
export {
  isIntegrationConfigurationAuditAction,
  listSystemAdminIntegrationsRecentChanges,
} from "./system-admin.integrations.recent-changes.server";
