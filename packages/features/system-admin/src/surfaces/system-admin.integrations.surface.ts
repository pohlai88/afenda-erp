import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../surfaces/system-admin.list-surface.shared";

export const systemAdminApiCredentialsSurfaceKey =
  "system-admin.api-credentials.list";
export const systemAdminWebhooksSurfaceKey = "system-admin.webhooks.list";
export const systemAdminWebhookDeliveriesSurfaceKey =
  "system-admin.webhook-deliveries.list";
export const systemAdminSsoSurfaceKey = "system-admin.sso.list";

const API_KEY_COLUMNS = [
  {
    id: "label",
    header: "Label",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "keyPrefix", header: "Prefix" },
  { id: "scopes", header: "Scopes" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "lastUsedAt", header: "Last used" },
];

const WEBHOOK_COLUMNS = [
  {
    id: "label",
    header: "Label",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "url", header: "URL" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "eventFilters", header: "Events" },
];

const DELIVERY_COLUMNS = [
  {
    id: "eventType",
    header: "Event",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "attemptCount", header: "Attempts" },
  { id: "retryOutcome", header: "Retry outcome" },
  { id: "responseCode", header: "Response" },
  { id: "createdAt", header: "Recorded" },
];

const SSO_COLUMNS = [
  {
    id: "provider",
    header: "Provider",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "enabled", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "idpMetadataUrl", header: "IdP metadata URL" },
];

const WRITE_REQUIRED_REASON = "Requires system-admin.integrations.write.";

export function buildApiCredentialsListSurface(input: {
  credentials: ReadonlyArray<{
    id: string;
    label: string;
    keyPrefix: string;
    scopes: readonly string[];
    status: string;
    lastUsedAt: Date | null;
  }>;
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "apiCredentials",
        searchPlaceholder: "Search API credentials",
        sortColumn: "label",
        filters: [
          {
            id: "status",
            label: "Status",
            param: "apiCredentialsStatus",
            options: [
              { label: "Active", value: "active" },
              { label: "Revoked", value: "revoked" },
              { label: "Expired", value: "expired" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "api-credentials",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.credentials.length),
    surface: {
      header: { title: "API credentials" },
      columnsId: "system-admin-api-credentials",
      rowKey: "id",
      empty: { variant: "muted", title: "No API credentials issued." },
    },
    columns: API_KEY_COLUMNS,
    rows: input.credentials.map((credential) => ({
      id: credential.id,
      cells: {
        label: credential.label,
        keyPrefix: credential.keyPrefix,
        scopes: credential.scopes.join(", "),
        status: credential.status,
        lastUsedAt: formatErpDateTime(credential.lastUsedAt, {
          fallback: "Never",
        }),
      },
      trailingAction:
        credential.status === "active"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: canMutate,
              disabledReason: WRITE_REQUIRED_REASON,
              descriptor: {
                id: "system-admin.api-credential.revoke",
                label: "Revoke",
                intent: "destructive",
                confirm: {
                  title: "Revoke API credential",
                  description:
                    "This credential will stop authenticating immediately.",
                  confirmLabel: "Revoke",
                },
              },
            })
          : undefined,
    })),
  });
}

export function buildWebhooksListSurface(input: {
  webhooks: ReadonlyArray<{
    id: string;
    label: string;
    url: string;
    status: string;
    eventFilters: readonly string[];
  }>;
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "webhooks",
        searchPlaceholder: "Search webhooks",
        sortColumn: "label",
        filters: [
          {
            id: "status",
            label: "Status",
            param: "webhooksStatus",
            options: [
              { label: "Enabled", value: "enabled" },
              { label: "Disabled", value: "disabled" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "webhooks",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.webhooks.length),
    surface: {
      header: { title: "Webhooks" },
      columnsId: "system-admin-webhooks",
      rowKey: "id",
      empty: { variant: "muted", title: "No webhooks registered." },
    },
    columns: WEBHOOK_COLUMNS,
    rows: input.webhooks.map((webhook) => {
      const isEnabled = webhook.status === "enabled";

      return {
        id: webhook.id,
        cells: {
          label: webhook.label,
          url: webhook.url,
          status: webhook.status,
          eventFilters: webhook.eventFilters.join(", "),
        },
        trailingAction: resolveListSurfaceRowTrailingAction({
          visible: true,
          allowed: canMutate,
          disabledReason: WRITE_REQUIRED_REASON,
          descriptor: isEnabled
            ? {
                id: "system-admin.webhook.disable",
                label: "Disable",
                intent: "destructive",
                confirm: {
                  title: "Disable webhook",
                  description:
                    "Delivery stops immediately until this endpoint is enabled again.",
                  confirmLabel: "Disable",
                },
              }
            : {
                id: "system-admin.webhook.enable",
                label: "Enable",
                intent: "default",
              },
        }),
      };
    }),
  });
}

export function buildWebhookDeliveriesListSurface(input: {
  deliveries: ReadonlyArray<{
    id: string;
    eventType: string;
    status: string;
    attemptCount?: number | null;
    retryOutcome?: string | null;
    responseCode: number | null;
    createdAt: Date;
  }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "webhookDeliveries",
        searchPlaceholder: "Search deliveries",
        sortColumn: "createdAt",
        filters: [
          {
            id: "status",
            label: "Status",
            param: "webhookDeliveriesStatus",
            options: [
              { label: "Delivered", value: "delivered" },
              { label: "Failed", value: "failed" },
              { label: "Pending", value: "pending" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "webhook-deliveries",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.deliveries.length),
    surface: {
      header: { title: "Webhook deliveries" },
      columnsId: "system-admin-webhook-deliveries",
      rowKey: "id",
      empty: { variant: "muted", title: "No delivery attempts recorded." },
    },
    columns: DELIVERY_COLUMNS,
    rows: input.deliveries.map((delivery) => ({
      id: delivery.id,
      cells: {
        eventType: delivery.eventType,
        status: delivery.status,
        attemptCount: String(delivery.attemptCount ?? 1),
        retryOutcome: delivery.retryOutcome ?? "-",
        responseCode:
          delivery.responseCode === null ? "-" : String(delivery.responseCode),
        createdAt: formatErpDateTime(delivery.createdAt),
      },
    })),
  });
}

export function buildSsoConnectionsListSurface(input: {
  connections: ReadonlyArray<{
    id: string;
    provider: string;
    enabled: boolean;
    idpMetadataUrl: string | null;
  }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "sso",
        searchPlaceholder: "Search SSO connections",
        sortColumn: "provider",
        filters: [
          {
            id: "status",
            label: "Status",
            param: "ssoStatus",
            options: [
              { label: "Staged", value: "staged" },
              { label: "Disabled", value: "disabled" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "sso",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.connections.length),
    surface: {
      header: { title: "SSO connections" },
      columnsId: "system-admin-sso",
      rowKey: "id",
      empty: {
        variant: "muted",
        title:
          "No SSO connections configured (Neon Auth remains authoritative).",
      },
    },
    columns: SSO_COLUMNS,
    rows: input.connections.map((connection) => ({
      id: connection.id,
      cells: {
        provider: connection.provider,
        enabled: connection.enabled ? "Staged" : "Disabled",
        idpMetadataUrl: connection.idpMetadataUrl ?? "-",
      },
    })),
  });
}
