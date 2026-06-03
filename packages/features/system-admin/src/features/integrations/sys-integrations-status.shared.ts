import type { ListSurfaceRow } from "@afenda/governed-surface/schemas";
import type {
  SystemAdminApiCredentialListRow,
  SystemAdminWebhookDeliveryListRow,
  SystemAdminWebhookListRow,
} from "../contracts/system-admin.integrations-list.contract";

type BadgeKind = NonNullable<ListSurfaceRow["cellKinds"]>[string];

export const API_CREDENTIAL_STATUS_LABEL: Record<
  SystemAdminApiCredentialListRow["status"],
  string
> = {
  active: "Active",
  revoked: "Revoked",
  expired: "Expired",
};

export const API_CREDENTIAL_STATUS_BADGE: Record<
  SystemAdminApiCredentialListRow["status"],
  BadgeKind
> = {
  active: { kind: "badge", tone: "positive" },
  revoked: { kind: "badge", tone: "critical" },
  expired: { kind: "badge", tone: "attention" },
};

export const WEBHOOK_STATUS_LABEL: Record<
  SystemAdminWebhookListRow["status"],
  string
> = {
  enabled: "Enabled",
  disabled: "Disabled",
};

export const WEBHOOK_STATUS_BADGE: Record<
  SystemAdminWebhookListRow["status"],
  BadgeKind
> = {
  enabled: { kind: "badge", tone: "positive" },
  disabled: { kind: "badge", tone: "default" },
};

export const WEBHOOK_DELIVERY_STATUS_LABEL: Record<
  SystemAdminWebhookDeliveryListRow["status"],
  string
> = {
  delivered: "Delivered",
  failed: "Failed",
  pending: "Pending",
};

export const WEBHOOK_DELIVERY_STATUS_BADGE: Record<
  SystemAdminWebhookDeliveryListRow["status"],
  BadgeKind
> = {
  delivered: { kind: "badge", tone: "positive" },
  failed: { kind: "badge", tone: "critical" },
  pending: { kind: "badge", tone: "attention" },
};

export function formatApiCredentialStatusLabel(
  status: SystemAdminApiCredentialListRow["status"],
) {
  return API_CREDENTIAL_STATUS_LABEL[status];
}

export function formatWebhookStatusLabel(
  status: SystemAdminWebhookListRow["status"],
) {
  return WEBHOOK_STATUS_LABEL[status];
}

export function formatWebhookDeliveryStatusLabel(
  status: SystemAdminWebhookDeliveryListRow["status"],
) {
  return WEBHOOK_DELIVERY_STATUS_LABEL[status];
}
