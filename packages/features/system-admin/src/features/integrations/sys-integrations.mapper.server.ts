import type {
  SystemAdminApiCredentialListRow,
  SystemAdminApiCredentialStatus,
  SystemAdminSsoConnectionListRow,
  SystemAdminWebhookDeliveryListRow,
  SystemAdminWebhookDeliveryStatus,
  SystemAdminWebhookListRow,
} from "./sys-integrations-list.contract";

function toApiCredentialStatus(status: string): SystemAdminApiCredentialStatus {
  if (status === "revoked" || status === "expired") {
    return status;
  }

  return "active";
}

function toWebhookDeliveryStatus(
  status: string,
): SystemAdminWebhookDeliveryStatus {
  if (status === "failed" || status === "pending") {
    return status;
  }

  return "delivered";
}

export function mapApiCredentialToListRow(
  credential: {
    id: string;
    label: string;
    keyPrefix: string;
    scopes: readonly string[];
    status: string;
    lastUsedAt: Date | null;
  },
): SystemAdminApiCredentialListRow {
  return {
    id: credential.id,
    label: credential.label,
    keyPrefix: credential.keyPrefix,
    scopes: credential.scopes,
    status: toApiCredentialStatus(credential.status),
    lastUsedAt: credential.lastUsedAt,
  };
}

export function mapWebhookToListRow(webhook: {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  eventFilters: readonly string[];
}): SystemAdminWebhookListRow {
  return {
    id: webhook.id,
    label: webhook.label,
    url: webhook.url,
    status: webhook.enabled ? "enabled" : "disabled",
    eventFilters: webhook.eventFilters,
  };
}

export function mapWebhookDeliveryToListRow(delivery: {
  id: string;
  eventType: string;
  status: string;
  attemptCount?: number | null;
  retryOutcome?: string | null;
  responseCode: number | null;
  createdAt: Date;
}): SystemAdminWebhookDeliveryListRow {
  return {
    id: delivery.id,
    eventType: delivery.eventType,
    status: toWebhookDeliveryStatus(delivery.status),
    attemptCount: delivery.attemptCount,
    retryOutcome: delivery.retryOutcome,
    responseCode: delivery.responseCode,
    createdAt: delivery.createdAt,
  };
}

export function mapSsoConnectionToListRow(connection: {
  id: string;
  provider: string;
  enabled: boolean;
  idpMetadataUrl: string | null;
}): SystemAdminSsoConnectionListRow {
  return {
    id: connection.id,
    provider: connection.provider,
    enabled: connection.enabled,
    idpMetadataUrl: connection.idpMetadataUrl,
  };
}
