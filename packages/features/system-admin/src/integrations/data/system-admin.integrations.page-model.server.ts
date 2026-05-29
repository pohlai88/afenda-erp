import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  mapApiCredentialToListRow,
  mapSsoConnectionToListRow,
  mapWebhookDeliveryToListRow,
  mapWebhookToListRow,
} from "./system-admin.integrations.mapper.server";
import { evaluateIntegrationsReadiness } from "./system-admin.integrations.readiness.server";
import { listSystemAdminIntegrationsRecentChanges } from "./system-admin.integrations.recent-changes.server";
import {
  listApiCredentials,
  listSsoConnections,
  listWebhookDeliveries,
  listWebhooks,
} from "./system-admin.integrations.repository.server";
import type { IntegrationReadinessReport } from "../contracts/system-admin.integrations-readiness.contract";
import type {
  SystemAdminApiCredentialListRow,
  SystemAdminIntegrationsRecentChangeRow,
  SystemAdminSsoConnectionListRow,
  SystemAdminWebhookDeliveryListRow,
  SystemAdminWebhookListRow,
} from "../contracts/system-admin.integrations-list.contract";
import { systemAdminIntegrationsAuditActions } from "../events/system-admin.integrations.event";

export type SystemAdminIntegrationsPageModel = {
  credentials: readonly SystemAdminApiCredentialListRow[];
  webhooks: readonly SystemAdminWebhookListRow[];
  deliveries: readonly SystemAdminWebhookDeliveryListRow[];
  ssoConnections: readonly SystemAdminSsoConnectionListRow[];
  readiness: IntegrationReadinessReport;
  recentChanges: readonly SystemAdminIntegrationsRecentChangeRow[];
};

export async function buildSystemAdminIntegrationsPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
}) {
  const [credentialRows, webhookRows, deliveryRows, ssoRows, recentChanges] =
    await Promise.all([
      listApiCredentials({ organizationId: input.organizationId, limit: 100 }),
      listWebhooks({ organizationId: input.organizationId, limit: 100 }),
      listWebhookDeliveries({ organizationId: input.organizationId, limit: 50 }),
      listSsoConnections({ organizationId: input.organizationId, limit: 50 }),
      listSystemAdminIntegrationsRecentChanges({
        organizationId: input.organizationId,
      }),
    ]);

  const credentials = credentialRows.map(mapApiCredentialToListRow);
  const webhooks = webhookRows.map(mapWebhookToListRow);
  const deliveries = deliveryRows.map(mapWebhookDeliveryToListRow);
  const ssoConnections = ssoRows.map(mapSsoConnectionToListRow);
  const readiness = evaluateIntegrationsReadiness({
    credentials,
    webhooks,
    deliveries,
    ssoConnections,
  });

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: systemAdminIntegrationsAuditActions.view,
    targetType: "organization_integrations",
    targetId: input.organizationId,
    metadata: {
      readinessVerdict: readiness.verdict,
      activeCredentialCount: credentials.filter(
        (row) => row.status === "active",
      ).length,
      enabledWebhookCount: webhooks.filter((row) => row.status === "enabled")
        .length,
      failedDeliveryCount: deliveries.filter((row) => row.status === "failed")
        .length,
      recentChangeCount: recentChanges.length,
    },
  });

  const model: SystemAdminIntegrationsPageModel = {
    credentials,
    webhooks,
    deliveries,
    ssoConnections,
    readiness,
    recentChanges,
  };

  return model;
}
