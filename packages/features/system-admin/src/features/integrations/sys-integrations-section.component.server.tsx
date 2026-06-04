import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { IntegrationReadinessReport } from "./sys-integrations-readiness.contract";
import type {
  SystemAdminApiCredentialListRow,
  SystemAdminIntegrationsRecentChangeRow,
  SystemAdminSsoConnectionListRow,
  SystemAdminWebhookDeliveryListRow,
  SystemAdminWebhookListRow,
} from "./sys-integrations-list.contract";
import { buildApiCredentialsListSurface, buildSsoConnectionsListSurface, buildWebhookDeliveriesListSurface, buildWebhooksListSurface, systemAdminApiCredentialsSurfaceKey, systemAdminSsoSurfaceKey, systemAdminWebhookDeliveriesSurfaceKey, systemAdminWebhooksSurfaceKey } from "./sys-integrations-list.surface";
import { buildIntegrationsGovernanceListSurface, systemAdminIntegrationsGovernanceSurfaceKey } from "./sys-integrations-governance.surface";
import { buildSystemAdminIntegrationsRecentChangesListSurface, systemAdminIntegrationsRecentChangesSurfaceKey } from "./sys-integrations-recent-changes.surface";
import { systemAdminIntegrationsUiCopy } from "./sys-integrations-ui.copy.shared";
import { CreateApiCredentialForm } from "./sys-create-api-credential-form.component.client";
import { CreateWebhookForm } from "./sys-create-webhook-form.component.client";
import {
  ApiCredentialTrailingCell,
  WebhookTrailingCell,
} from "./sys-integration-trailing-cells.component.client";
import { SystemAdminSsoConnectionForm } from "./sys-sso-connection-form.component.client";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import type { CreateApiCredentialActionData, CreateWebhookActionData } from "./sys-integrations-action-dtos.contract";

type CreateApiCredentialFormAction = (
  state: SystemAdminActionResult<CreateApiCredentialActionData> | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult<CreateApiCredentialActionData> | undefined>;

type CreateWebhookFormAction = (
  state: SystemAdminActionResult<CreateWebhookActionData> | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult<CreateWebhookActionData> | undefined>;

type UpsertSsoConnectionFormAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminIntegrationsSection({
  credentials,
  webhooks,
  deliveries,
  ssoConnections,
  readiness,
  recentChanges,
  canMutate,
  createApiCredentialFormAction,
  createWebhookFormAction,
  upsertSsoConnectionFormAction,
}: {
  credentials: readonly SystemAdminApiCredentialListRow[];
  webhooks: readonly SystemAdminWebhookListRow[];
  deliveries: readonly SystemAdminWebhookDeliveryListRow[];
  ssoConnections: readonly SystemAdminSsoConnectionListRow[];
  readiness: IntegrationReadinessReport;
  recentChanges: readonly SystemAdminIntegrationsRecentChangeRow[];
  canMutate: boolean;
  createApiCredentialFormAction: CreateApiCredentialFormAction;
  createWebhookFormAction: CreateWebhookFormAction;
  upsertSsoConnectionFormAction: UpsertSsoConnectionFormAction;
}) {
  const copy = systemAdminIntegrationsUiCopy;
  const activeCredentialCount = credentials.filter(
    (row) => row.status === "active",
  ).length;
  const enabledWebhookCount = webhooks.filter(
    (row) => row.status === "enabled",
  ).length;
  const failedDeliveryCount = deliveries.filter(
    (row) => row.status === "failed",
  ).length;
  const stagedSsoCount = ssoConnections.filter((row) => row.enabled).length;

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      <GovernedPatternCListSection
        title={copy.governance.title}
        surfaceKey={systemAdminIntegrationsGovernanceSurfaceKey}
        listConfiguration={buildIntegrationsGovernanceListSurface({
          readiness,
          activeCredentialCount,
          enabledWebhookCount,
          failedDeliveryCount,
          stagedSsoCount,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <SectionPanel
        title={copy.credentialPolicy.title}
        description={copy.credentialPolicy.description}
      />

      {canMutate ? (
        <SectionPanel title={copy.apiCredentials.createTitle}>
          <CreateApiCredentialForm
            createApiCredentialFormAction={createApiCredentialFormAction}
          />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title={copy.apiCredentials.title}
        surfaceKey={systemAdminApiCredentialsSurfaceKey}
        listConfiguration={buildApiCredentialsListSurface({
          credentials,
          canMutate,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: ApiCredentialTrailingCell,
        }}
      />

      {canMutate ? (
        <SectionPanel title={copy.webhooks.registerTitle}>
          <CreateWebhookForm
            createWebhookFormAction={createWebhookFormAction}
          />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title={copy.webhooks.title}
        surfaceKey={systemAdminWebhooksSurfaceKey}
        listConfiguration={buildWebhooksListSurface({
          canMutate,
          webhooks,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: WebhookTrailingCell,
        }}
      />

      <GovernedPatternCListSection
        title={copy.deliveries.title}
        description={copy.deliveries.description}
        surfaceKey={systemAdminWebhookDeliveriesSurfaceKey}
        listConfiguration={buildWebhookDeliveriesListSurface({
          deliveries,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.recentChanges.title}
        description={copy.recentChanges.description}
        surfaceKey={systemAdminIntegrationsRecentChangesSurfaceKey}
        listConfiguration={buildSystemAdminIntegrationsRecentChangesListSurface({
          rows: recentChanges,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel
          title={copy.sso.formTitle}
          description={copy.sso.formDescription}
        >
          <SystemAdminSsoConnectionForm
            upsertSsoConnectionFormAction={upsertSsoConnectionFormAction}
          />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title={copy.sso.title}
        surfaceKey={systemAdminSsoSurfaceKey}
        listConfiguration={buildSsoConnectionsListSurface({
          connections: ssoConnections,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function SystemAdminIntegrationsAccessDenied() {
  const copy = systemAdminIntegrationsUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <SectionPanel title={copy.accessDenied.title}>
        <p className="type-muted">{copy.accessDenied.description}</p>
      </SectionPanel>
    </div>
  );
}
