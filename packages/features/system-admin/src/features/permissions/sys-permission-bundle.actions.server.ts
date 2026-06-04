"use server";

import type { OrganizationRole } from "@afenda/kernel";
import { upsertRoleOverride } from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability/server";
import { revalidatePath } from "next/cache";
import { dispatchSystemAdminWebhook } from "../integrations/sys-webhook-dispatch.event";
import { requireSystemAdminPermissionsManage } from "./sys-permissions.policy.server";
import {
  assertSystemAdminFormActionResult,
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../tenant-execution/sys-action-result.contract";
import { systemAdminPermissionBundleWebhookEvents } from "./sys-permissions.event";
import { assertRolePermissionBundleChangeAllowed } from "./sys-permission-bundle.policy.server";
import { systemAdminRoleOverrideActionSchema } from "./sys-role-override.schema";

function logPermissionBundleMutation(input: {
  operation: string;
  organizationId: string;
  userId: string;
  result: "success" | "failure";
  metadata?: Record<string, unknown>;
}) {
  logServerEvent(
    input.result === "success" ? "info" : "warn",
    `System admin permission bundle mutation ${input.result}.`,
    {
      organizationId: input.organizationId,
      userId: input.userId,
      module: "system-admin",
      operation: input.operation,
    },
    input.metadata ?? {},
  );
}

export async function setRoleOverride(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, session, organization } =
    await requireSystemAdminPermissionsManage();

  const parsed = systemAdminRoleOverrideActionSchema.safeParse({
    role: formData.get("role"),
    permissionKey: formData.get("permissionKey"),
    enabled: formData.get("enabled") === "true",
    confirmHighRisk: formData.get("confirmHighRisk") ?? undefined,
  });
  if (!parsed.success) {
    logPermissionBundleMutation({
      operation: "permission_bundle.update",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: { reason: "validation" },
    });
    return zodActionFailure(parsed.error);
  }

  try {
    assertRolePermissionBundleChangeAllowed({
      role: parsed.data.role,
      permissionKey: parsed.data.permissionKey,
      enabled: parsed.data.enabled,
      confirmHighRisk: parsed.data.confirmHighRisk === "true",
    });
  } catch (error) {
    logPermissionBundleMutation({
      operation: "permission_bundle.update",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: {
        reason: "policy",
        message:
          error instanceof Error ? error.message : "Policy rejected change.",
      },
    });
    return systemAdminActionFailure(
      error instanceof Error
        ? error.message
        : "Permission bundle change rejected.",
    );
  }

  await upsertRoleOverride({
    organizationId: organization.id,
    role: parsed.data.role as OrganizationRole,
    permissionKey: parsed.data.permissionKey,
    enabled: parsed.data.enabled,
    actorAuthUserId: session.id,
  });

  logPermissionBundleMutation({
    operation: "permission_bundle.update",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: {
      role: parsed.data.role,
      permissionKey: parsed.data.permissionKey,
      enabled: parsed.data.enabled,
    },
  });
  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.permission_bundle.update",
    targetType: "role",
    targetId: parsed.data.role,
    metadata: {
      permissionKey: parsed.data.permissionKey,
      enabled: parsed.data.enabled,
    },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminPermissionBundleWebhookEvents[0],
    payload: {
      role: parsed.data.role,
      permissionKey: parsed.data.permissionKey,
      enabled: parsed.data.enabled,
    },
  });

  revalidatePath("/system-admin/identity");
  revalidatePath("/system-admin/permissions");
  revalidatePath("/system-admin/roles");
  return systemAdminActionSuccess(undefined);
}

export async function setRoleOverrideAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
) {
  return setRoleOverride(formData);
}

export async function setRoleOverrideForm(formData: FormData): Promise<void> {
  assertSystemAdminFormActionResult(await setRoleOverride(formData));
}
