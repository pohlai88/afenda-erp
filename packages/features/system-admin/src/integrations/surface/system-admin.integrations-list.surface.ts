import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { formatMaskedCredentialPrefix } from "../contracts/system-admin.credential-visibility.shared";
import { catalogStatusBadge } from "../../overview/surfaces/system-admin.control-list.shared";
import {
  API_CREDENTIAL_STATUS_BADGE,
  formatApiCredentialStatusLabel,
  formatWebhookDeliveryStatusLabel,
  formatWebhookStatusLabel,
  WEBHOOK_DELIVERY_STATUS_BADGE,
  WEBHOOK_STATUS_BADGE,
} from "./system-admin.integrations-status.shared";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../../overview/surfaces/system-admin.list-surface.shared";
import type {
  SystemAdminApiCredentialListRow,
  SystemAdminSsoConnectionListRow,
  SystemAdminWebhookDeliveryListRow,
  SystemAdminWebhookListRow,
} from "../contracts/system-admin.integrations-list.contract";
import {
  resolveSystemAdminApiCredentialRowTrailingAction,
  resolveSystemAdminWebhookRowTrailingAction,
} from "./system-admin.integrations-list-trailing.shared";
import { systemAdminIntegrationsUiCopy } from "./system-admin.integrations-ui.copy.shared";

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
  { id: "keyPrefix", header: "Masked prefix" },
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

export function buildApiCredentialsListSurface(input: {
  credentials: readonly SystemAdminApiCredentialListRow[];
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
      header: { title: systemAdminIntegrationsUiCopy.apiCredentials.title },
      columnsId: "system-admin-api-credentials",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: systemAdminIntegrationsUiCopy.apiCredentials.emptyTitle,
        description: systemAdminIntegrationsUiCopy.apiCredentials.emptyDescription,
      },
    },
    columns: API_KEY_COLUMNS,
    rows: input.credentials.map((credential) => ({
      id: credential.id,
      cells: {
        label: credential.label,
        keyPrefix: formatMaskedCredentialPrefix(credential.keyPrefix),
        scopes: credential.scopes.join(", "),
        status: formatApiCredentialStatusLabel(credential.status),
        lastUsedAt: formatErpDateTime(credential.lastUsedAt, {
          fallback: "Never",
        }),
      },
      cellKinds: {
        status: API_CREDENTIAL_STATUS_BADGE[credential.status],
      },
      trailingAction:
        credential.status === "active"
          ? resolveSystemAdminApiCredentialRowTrailingAction({ canMutate })
          : undefined,
    })),
  });
}

export function buildWebhooksListSurface(input: {
  webhooks: readonly SystemAdminWebhookListRow[];
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
      header: { title: systemAdminIntegrationsUiCopy.webhooks.title },
      columnsId: "system-admin-webhooks",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: systemAdminIntegrationsUiCopy.webhooks.emptyTitle,
        description: systemAdminIntegrationsUiCopy.webhooks.emptyDescription,
      },
    },
    columns: WEBHOOK_COLUMNS,
    rows: input.webhooks.map((webhook) => {
      const isEnabled = webhook.status === "enabled";

      return {
        id: webhook.id,
        cells: {
          label: webhook.label,
          url: webhook.url,
          status: formatWebhookStatusLabel(webhook.status),
          eventFilters: webhook.eventFilters.join(", "),
        },
        cellKinds: {
          status: WEBHOOK_STATUS_BADGE[webhook.status],
        },
        trailingAction: resolveSystemAdminWebhookRowTrailingAction({
          enabled: isEnabled,
          canMutate,
        }),
      };
    }),
  });
}

export function buildWebhookDeliveriesListSurface(input: {
  deliveries: readonly SystemAdminWebhookDeliveryListRow[];
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
      header: { title: systemAdminIntegrationsUiCopy.deliveries.title },
      columnsId: "system-admin-webhook-deliveries",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: systemAdminIntegrationsUiCopy.deliveries.emptyTitle,
        description: systemAdminIntegrationsUiCopy.deliveries.emptyDescription,
      },
    },
    columns: DELIVERY_COLUMNS,
    rows: input.deliveries.map((delivery) => ({
      id: delivery.id,
      cells: {
        eventType: delivery.eventType,
        status: formatWebhookDeliveryStatusLabel(delivery.status),
        attemptCount: String(delivery.attemptCount ?? 1),
        retryOutcome: delivery.retryOutcome ?? "-",
        responseCode:
          delivery.responseCode === null ? "-" : String(delivery.responseCode),
        createdAt: formatErpDateTime(delivery.createdAt),
      },
      cellKinds: {
        status: WEBHOOK_DELIVERY_STATUS_BADGE[delivery.status],
      },
    })),
  });
}

export function buildSsoConnectionsListSurface(input: {
  connections: readonly SystemAdminSsoConnectionListRow[];
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
      header: { title: systemAdminIntegrationsUiCopy.sso.title },
      columnsId: "system-admin-sso",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: systemAdminIntegrationsUiCopy.sso.emptyTitle,
        description: systemAdminIntegrationsUiCopy.sso.emptyDescription,
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
      cellKinds: {
        enabled: catalogStatusBadge(
          connection.enabled ? "active" : "disabled",
        ),
      },
    })),
  });
}
