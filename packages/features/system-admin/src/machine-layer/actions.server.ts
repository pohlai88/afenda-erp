"use server";

import { executeApprovedSandbox } from "@afenda/ai";
import { requireCapability } from "@afenda/auth/server";
import {
  createAuditLog,
  transitionAiActionSandbox,
  upsertAiFeatureEntitlement,
  type AiFeature,
} from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import { dispatchSystemAdminWebhook } from "../webhooks.server";

async function resolveMachineLayerApprover() {
  return requireCapability("system-admin.machine-layer.approve");
}

export async function approveSandbox(sandboxId: string): Promise<void> {
  const { session, organization } = await resolveMachineLayerApprover();

  await transitionAiActionSandbox({
    id: sandboxId,
    organizationId: organization.id,
    to: "approved",
    actorAuthUserId: session.id,
  });

  let execution: { createdRowIds: readonly string[] };
  try {
    execution = await executeApprovedSandbox({
      sandboxId,
      organizationId: organization.id,
      actorAuthUserId: session.id,
    });
  } catch (error) {
    logServerEvent(
      "error",
      "Lynx sandbox domain executor failed after approval.",
      {
        organizationId: organization.id,
        userId: session.id,
        module: "system-admin",
        operation: "lynx-sandbox.execute",
      },
      {
        sandboxId,
        error: error instanceof Error ? error.message : String(error),
      },
    );
    throw error;
  }

  await createAuditLog({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    entityType: "system",
    entityId: sandboxId,
    action: "lynx.sandbox.approved",
    summary: `Lynx action sandbox ${sandboxId} approved by operator.`,
    metadata: {
      sandboxId,
      createdRowIds: execution.createdRowIds,
    },
  });

  logServerEvent(
    "info",
    "Lynx sandbox approved by operator.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "lynx-sandbox.approve",
    },
    { sandboxId },
  );
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "lynx.sandbox.approved",
    payload: {
      sandboxId,
      createdRowIds: execution.createdRowIds,
    },
  });

  revalidatePath("/system-admin/machine-layer");
}

export async function rejectSandbox(
  sandboxId: string,
  reason?: string,
): Promise<void> {
  const { session, organization } = await resolveMachineLayerApprover();

  await transitionAiActionSandbox({
    id: sandboxId,
    organizationId: organization.id,
    to: "rejected",
    reason,
    actorAuthUserId: session.id,
  });

  await createAuditLog({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    entityType: "system",
    entityId: sandboxId,
    action: "lynx.sandbox.rejected",
    summary: `Lynx action sandbox ${sandboxId} rejected by operator.`,
    metadata: { sandboxId, reason: reason ?? null },
  });

  logServerEvent(
    "info",
    "Lynx sandbox rejected by operator.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "lynx-sandbox.reject",
    },
    { sandboxId, reason },
  );
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "lynx.sandbox.rejected",
    payload: { sandboxId, reason: reason ?? null },
  });

  revalidatePath("/system-admin/machine-layer");
}

export async function discardSandbox(sandboxId: string): Promise<void> {
  const { session, organization } = await resolveMachineLayerApprover();

  await transitionAiActionSandbox({
    id: sandboxId,
    organizationId: organization.id,
    to: "discarded",
    actorAuthUserId: session.id,
  });

  await createAuditLog({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    entityType: "system",
    entityId: sandboxId,
    action: "lynx.sandbox.discarded",
    summary: `Lynx action sandbox ${sandboxId} discarded by operator.`,
    metadata: { sandboxId },
  });

  logServerEvent(
    "info",
    "Lynx sandbox discarded by operator.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "lynx-sandbox.discard",
    },
    { sandboxId },
  );

  revalidatePath("/system-admin/machine-layer");
}

export async function updateAiFeatureEntitlement(input: {
  feature: AiFeature;
  enabled: boolean;
}): Promise<void> {
  const { session, organization } = await resolveMachineLayerApprover();

  await upsertAiFeatureEntitlement({
    organizationId: organization.id,
    feature: input.feature,
    enabled: input.enabled,
    actorAuthUserId: session.id,
  });

  await createAuditLog({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    entityType: "system",
    entityId: input.feature,
    action: "machine-feature.entitlement.updated",
    summary: `Machine feature ${input.feature} set to ${input.enabled ? "enabled" : "disabled"}.`,
    metadata: {
      feature: input.feature,
      enabled: input.enabled,
    },
  });

  logServerEvent(
    "info",
    "Machine feature entitlement updated.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "machine-feature.entitlement.update",
    },
    input,
  );

  revalidatePath("/system-admin/machine-layer");
}
