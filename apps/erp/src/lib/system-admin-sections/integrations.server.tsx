import {
  buildApiCredentialsListSurface,
  buildSsoConnectionsListSurface,
  buildWebhookDeliveriesListSurface,
  buildWebhooksListSurface,
  systemAdminApiCredentialsSurfaceKey,
  systemAdminSsoSurfaceKey,
  systemAdminWebhookDeliveriesSurfaceKey,
  systemAdminWebhooksSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  createApiCredentialFormAction,
  createWebhookFormAction,
  listApiCredentials,
  listSsoConnections,
  listWebhookDeliveries,
  listWebhooks,
  requireSystemAdminIntegrationsRead,
  upsertSsoConnectionForm,
} from "@afenda/feature-system-admin/server";
import {
  ApiCredentialTrailingCell,
  CreateApiCredentialForm,
  CreateWebhookForm,
  WebhookTrailingCell,
} from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — System admin",
  description: "API credentials, outbound webhooks, and SSO configuration.",
};

export default async function SystemAdminIntegrationsPage() {
  const { organization } = await requireSystemAdminIntegrationsRead();
  const canWrite = organization.capabilities.includes(
    "system-admin.integrations.write",
  );

  const [credentials, webhooks, deliveries, ssoConnections] = await Promise.all(
    [
      listApiCredentials({ organizationId: organization.id, limit: 100 }),
      listWebhooks({ organizationId: organization.id, limit: 100 }),
      listWebhookDeliveries({ organizationId: organization.id, limit: 50 }),
      listSsoConnections({ organizationId: organization.id, limit: 50 }),
    ],
  );

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title="Integrations"
        description="Outbound credentials and SSO metadata. Neon Auth remains the identity authority."
      />

      {canWrite ? (
        <SectionPanel title="Create API credential">
          <CreateApiCredentialForm
            createApiCredentialFormAction={createApiCredentialFormAction}
          />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title="API credentials"
        surfaceKey={systemAdminApiCredentialsSurfaceKey}
        listConfiguration={buildApiCredentialsListSurface({
          credentials,
          canMutate: canWrite,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: ApiCredentialTrailingCell,
        }}
      />

      {canWrite ? (
        <SectionPanel title="Register webhook">
          <CreateWebhookForm
            createWebhookFormAction={createWebhookFormAction}
          />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title="Webhooks"
        surfaceKey={systemAdminWebhooksSurfaceKey}
        listConfiguration={buildWebhooksListSurface({
          canMutate: canWrite,
          webhooks: webhooks.map((webhook) => ({
            id: webhook.id,
            label: webhook.label,
            url: webhook.url,
            status: webhook.enabled ? "enabled" : "disabled",
            eventFilters: webhook.eventFilters,
          })),
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: WebhookTrailingCell,
        }}
      />

      <GovernedPatternCListSection
        title="Webhook deliveries"
        surfaceKey={systemAdminWebhookDeliveriesSurfaceKey}
        listConfiguration={buildWebhookDeliveriesListSurface({
          deliveries: deliveries.map((delivery) => ({
            id: delivery.id,
            eventType: delivery.eventType,
            status: delivery.status,
            attemptCount: delivery.attemptCount,
            retryOutcome: delivery.retryOutcome,
            responseCode: delivery.responseCode,
            createdAt: delivery.createdAt,
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canWrite ? (
        <SectionPanel
          title="SSO connection"
          description="Enabled rows are staged until provider enforcement is activated by auth."
        >
          <form
            action={upsertSsoConnectionForm}
            className="@container grid max-w-xl gap-surface-lg @sm:grid-cols-2"
          >
            <label className="@container flex flex-col gap-1 type-body @sm:col-span-2">
              <span className="text-muted-foreground">Provider</span>
              <Input name="provider" placeholder="okta" required />
            </label>
            <label className="@container flex flex-col gap-1 type-body @sm:col-span-2">
              <span className="text-muted-foreground">IdP metadata URL</span>
              <Input name="idpMetadataUrl" type="url" />
            </label>
            <label className="@container flex flex-col gap-1 type-body @sm:col-span-2">
              <span className="text-muted-foreground">Audience</span>
              <Input name="audience" />
            </label>
            <label className="flex flex-col gap-1 type-body">
              <span className="text-muted-foreground">Staged status</span>
              <NativeSelect
                className="w-full"
                name="enabled"
                defaultValue="false"
              >
                <NativeSelectOption value="false">Disabled</NativeSelectOption>
                <NativeSelectOption value="true">Staged</NativeSelectOption>
              </NativeSelect>
            </label>
            <div className="flex items-end">
              <Button type="submit" variant="outline">
                Save SSO config
              </Button>
            </div>
          </form>
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title="SSO connections"
        surfaceKey={systemAdminSsoSurfaceKey}
        listConfiguration={buildSsoConnectionsListSurface({
          connections: ssoConnections.map((connection) => ({
            id: connection.id,
            provider: connection.provider,
            enabled: connection.enabled,
            idpMetadataUrl: connection.idpMetadataUrl,
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
