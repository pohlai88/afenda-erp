export type SystemAdminApiCredentialStatus = "active" | "revoked" | "expired";

export type SystemAdminWebhookStatus = "enabled" | "disabled";

export type SystemAdminWebhookDeliveryStatus = "delivered" | "failed" | "pending";

export type SystemAdminApiCredentialListRow = {
  id: string;
  label: string;
  keyPrefix: string;
  scopes: readonly string[];
  status: SystemAdminApiCredentialStatus;
  lastUsedAt: Date | null;
};

export type SystemAdminWebhookListRow = {
  id: string;
  label: string;
  url: string;
  status: SystemAdminWebhookStatus;
  eventFilters: readonly string[];
};

export type SystemAdminWebhookDeliveryListRow = {
  id: string;
  eventType: string;
  status: SystemAdminWebhookDeliveryStatus;
  attemptCount?: number | null;
  retryOutcome?: string | null;
  responseCode: number | null;
  createdAt: Date;
};

export type SystemAdminSsoConnectionListRow = {
  id: string;
  provider: string;
  enabled: boolean;
  idpMetadataUrl: string | null;
};

/** Audited integration configuration event row (audit viewer detail link included). */
export type SystemAdminIntegrationsRecentChangeRow = {
  id: string;
  occurredAt: string;
  action: string;
  actionLabel: string;
  actorId: string;
  target: string;
  summary: string;
  href: string;
};
