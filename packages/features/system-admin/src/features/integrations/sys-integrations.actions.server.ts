"use server";

import {
  createApiCredential,
  createWebhook,
  revokeApiCredential,
  setWebhookEnabled,
  upsertSsoConnection,
} from "@afenda/db";
import {
  writeExecutionAuditEvent,
  type ExecutionActorType,
} from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability/server";
import { revalidatePath } from "next/cache";
import { systemAdminRoutePaths } from "../overview/sys-route-paths.contract";
import {
  assertSystemAdminFormActionResult,
  systemAdminActionFailure,
  systemAdminActionSuccess,
  toSystemAdminVoidFormAction,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../tenant-execution/sys-action-result.contract";
import type {
  CreateApiCredentialActionData,
  CreateWebhookActionData,
} from "./sys-integrations-action-dtos.contract";
import {
  isSystemAdminApiScope,
  isSystemAdminWebhookEvent,
  type SystemAdminApiScope,
  type SystemAdminWebhookEvent,
} from "./sys-integrations-catalog.contract";
import { requireSystemAdminIntegrationsWrite } from "./sys-integrations.policy.server";
import {
  systemAdminApiCredentialActionSchema,
  systemAdminSsoConnectionActionSchema,
  systemAdminWebhookActionSchema,
} from "./sys-integrations-action.schema";
import {
  systemAdminIntegrationsAuditActions,
  systemAdminIntegrationsWebhookEvents,
} from "./sys-integrations.event";
import { dispatchSystemAdminWebhook } from "./sys-webhook-dispatch.event";

const [
  apiCredentialCreatedWebhookEvent,
  apiCredentialRevokedWebhookEvent,
  webhookCreatedWebhookEvent,
  webhookEnabledWebhookEvent,
  webhookDisabledWebhookEvent,
  ssoUpdatedWebhookEvent,
] = systemAdminIntegrationsWebhookEvents;

function splitCatalogValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function logIntegrationMutation(input: {
  operation: string;
  organizationId: string;
  userId: string;
  result: "success" | "failure";
  metadata?: Record<string, unknown>;
}) {
  logServerEvent(
    input.result === "success" ? "info" : "warn",
    `System admin integration mutation ${input.result}.`,
    {
      organizationId: input.organizationId,
      userId: input.userId,
      module: "system-admin",
      operation: input.operation,
    },
    input.metadata ?? {},
  );
}

async function writeIntegrationAudit(input: {
  organizationId: string;
  actorId: string;
  actorType: ExecutionActorType;
  action: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: input.action,
    targetType: "organization_integrations",
    targetId: input.targetId,
    metadata: input.metadata,
  });
}

export async function createApiCredentialAction(
  formData: FormData,
): Promise<SystemAdminActionResult<CreateApiCredentialActionData>> {
  const { session, organization, context } =
    await requireSystemAdminIntegrationsWrite();

  const parsed = systemAdminApiCredentialActionSchema.safeParse({
    label: formData.get("label"),
    scopes: formData.get("scopes"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const scopes = splitCatalogValues(parsed.data.scopes);
  const invalidScope = scopes.find((scope) => !isSystemAdminApiScope(scope));
  if (invalidScope) {
    logIntegrationMutation({
      operation: "integrations.api-credential.create",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: { reason: "invalid-scope", scope: invalidScope },
    });
    return systemAdminActionFailure("Select API scopes from the catalog.", {
      scopes: `Unsupported scope: ${invalidScope}`,
    });
  }

  const result = await createApiCredential({
    organizationId: organization.id,
    label: parsed.data.label,
    scopes: scopes as SystemAdminApiScope[],
    createdByAuthUserId: session.id,
  });

  logIntegrationMutation({
    operation: "integrations.api-credential.create",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: {
      credentialId: result.id,
      keyPrefix: result.keyPrefix,
      scopes,
    },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: apiCredentialCreatedWebhookEvent,
    payload: {
      credentialId: result.id,
      keyPrefix: result.keyPrefix,
      scopes,
    },
  });
  await writeIntegrationAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminIntegrationsAuditActions.apiCredentialCreate,
    targetId: result.id,
    metadata: { keyPrefix: result.keyPrefix, scopes },
  });

  revalidatePath(systemAdminRoutePaths.integrations);
  return systemAdminActionSuccess(result);
}

export async function createApiCredentialFormAction(
  _previous: SystemAdminActionResult<CreateApiCredentialActionData> | undefined,
  formData: FormData,
) {
  return createApiCredentialAction(formData);
}

export async function revokeApiCredentialAction(
  credentialId: string,
): Promise<SystemAdminActionResult> {
  const { session, organization, context } =
    await requireSystemAdminIntegrationsWrite();

  if (!credentialId.trim()) {
    return systemAdminActionFailure("Credential id is required.", {
      credentialId: "Credential id is required.",
    });
  }

  try {
    await revokeApiCredential({
      organizationId: organization.id,
      credentialId,
      actorAuthUserId: session.id,
    });
  } catch (error) {
    logIntegrationMutation({
      operation: "integrations.api-credential.revoke",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: {
        credentialId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "API credential revoke failed.",
    );
  }

  logIntegrationMutation({
    operation: "integrations.api-credential.revoke",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: { credentialId },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: apiCredentialRevokedWebhookEvent,
    payload: { credentialId },
  });
  await writeIntegrationAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminIntegrationsAuditActions.apiCredentialRevoke,
    targetId: credentialId,
  });

  revalidatePath(systemAdminRoutePaths.integrations);
  return systemAdminActionSuccess(undefined);
}

export async function revokeApiCredentialForm(formData: FormData) {
  const credentialId = String(formData.get("credentialId") ?? "").trim();

  return revokeApiCredentialAction(credentialId);
}

export async function createWebhookAction(
  formData: FormData,
): Promise<SystemAdminActionResult<CreateWebhookActionData>> {
  const { session, organization, context } =
    await requireSystemAdminIntegrationsWrite();

  const parsed = systemAdminWebhookActionSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    eventFilters: formData.get("eventFilters"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const eventFilters = splitCatalogValues(parsed.data.eventFilters);
  const invalidEvent = eventFilters.find(
    (event) => !isSystemAdminWebhookEvent(event),
  );
  if (invalidEvent) {
    logIntegrationMutation({
      operation: "integrations.webhook.create",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: { reason: "invalid-event", event: invalidEvent },
    });
    return systemAdminActionFailure("Select webhook events from the catalog.", {
      eventFilters: `Unsupported event: ${invalidEvent}`,
    });
  }

  const result = await createWebhook({
    organizationId: organization.id,
    label: parsed.data.label,
    url: parsed.data.url,
    eventFilters: eventFilters as SystemAdminWebhookEvent[],
    createdByAuthUserId: session.id,
  });

  logIntegrationMutation({
    operation: "integrations.webhook.create",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: {
      webhookId: result.id,
      url: parsed.data.url,
      eventFilters,
    },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: webhookCreatedWebhookEvent,
    payload: {
      webhookId: result.id,
      url: parsed.data.url,
      eventFilters,
    },
  });
  await writeIntegrationAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminIntegrationsAuditActions.webhookCreate,
    targetId: result.id,
    metadata: { url: parsed.data.url, eventFilters },
  });

  revalidatePath(systemAdminRoutePaths.integrations);
  return systemAdminActionSuccess(result);
}

export async function createWebhookFormAction(
  _previous: SystemAdminActionResult<CreateWebhookActionData> | undefined,
  formData: FormData,
) {
  return createWebhookAction(formData);
}

export async function setWebhookEnabledAction(input: {
  webhookId: string;
  enabled: boolean;
}): Promise<SystemAdminActionResult> {
  const { session, organization, context } =
    await requireSystemAdminIntegrationsWrite();

  const webhookId = input.webhookId.trim();
  if (!webhookId) {
    return systemAdminActionFailure("Webhook id is required.");
  }

  try {
    await setWebhookEnabled({
      organizationId: organization.id,
      webhookId,
      enabled: input.enabled,
      actorAuthUserId: session.id,
    });
  } catch (error) {
    logIntegrationMutation({
      operation: "integrations.webhook.set-enabled",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: {
        webhookId,
        enabled: input.enabled,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Webhook update failed.",
    );
  }

  logIntegrationMutation({
    operation: "integrations.webhook.set-enabled",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: { webhookId, enabled: input.enabled },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: input.enabled
      ? webhookEnabledWebhookEvent
      : webhookDisabledWebhookEvent,
    payload: { webhookId, enabled: input.enabled },
  });
  await writeIntegrationAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: input.enabled
      ? systemAdminIntegrationsAuditActions.webhookEnable
      : systemAdminIntegrationsAuditActions.webhookDisable,
    targetId: webhookId,
    metadata: { enabled: input.enabled },
  });

  revalidatePath(systemAdminRoutePaths.integrations);
  return systemAdminActionSuccess(undefined);
}

export async function upsertSsoConnectionAction(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization, context } =
    await requireSystemAdminIntegrationsWrite();

  const parsed = systemAdminSsoConnectionActionSchema.safeParse({
    provider: formData.get("provider"),
    idpMetadataUrl: formData.get("idpMetadataUrl") || "",
    audience: formData.get("audience") || "",
    enabled: formData.get("enabled"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertSsoConnection({
    organizationId: organization.id,
    provider: parsed.data.provider,
    idpMetadataUrl: parsed.data.idpMetadataUrl || null,
    audience: parsed.data.audience || null,
    enabled: parsed.data.enabled,
    actorAuthUserId: session.id,
  });

  logIntegrationMutation({
    operation: "integrations.sso.upsert",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: {
      provider: parsed.data.provider,
      enabled: parsed.data.enabled,
      activation: "staged",
    },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: ssoUpdatedWebhookEvent,
    payload: {
      provider: parsed.data.provider,
      enabled: parsed.data.enabled,
      activation: "staged",
    },
  });
  await writeIntegrationAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminIntegrationsAuditActions.ssoUpdate,
    targetId: parsed.data.provider,
    metadata: {
      provider: parsed.data.provider,
      enabled: parsed.data.enabled,
    },
  });

  revalidatePath(systemAdminRoutePaths.integrations);
  return systemAdminActionSuccess(undefined);
}

export const createApiCredentialForm = toSystemAdminVoidFormAction(
  createApiCredentialAction,
);

export async function revokeApiCredentialFormAction(
  formData: FormData,
): Promise<void> {
  assertSystemAdminFormActionResult(await revokeApiCredentialForm(formData));
}

export const createWebhookForm =
  toSystemAdminVoidFormAction(createWebhookAction);

export async function upsertSsoConnectionFormAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
) {
  return upsertSsoConnectionAction(formData);
}

export const upsertSsoConnectionForm = toSystemAdminVoidFormAction(
  upsertSsoConnectionAction,
);
