"use server";

import { upsertRetentionPolicy } from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../contracts";
import { requireSystemAdminAuditExport } from "../policies";
import { systemAdminRetentionPolicyActionSchema } from "../schemas";
import { dispatchSystemAdminWebhook } from "../events";

export async function upsertRetentionPolicyAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireSystemAdminAuditExport();

  const parsed = systemAdminRetentionPolicyActionSchema.safeParse({
    entityType: formData.get("entityType"),
    retentionDays: formData.get("retentionDays"),
    legalHold: formData.get("legalHold"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertRetentionPolicy({
    organizationId: organization.id,
    entityType: parsed.data.entityType,
    retentionDays: parsed.data.retentionDays,
    legalHold: parsed.data.legalHold,
    actorAuthUserId: session.id,
  });

  logServerEvent(
    "info",
    "System admin retention policy updated.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "audit.retention.update",
    },
    {
      entityType: parsed.data.entityType,
      legalHold: parsed.data.legalHold,
    },
  );
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "tenant.retention.updated",
    payload: {
      entityType: parsed.data.entityType,
      retentionDays: parsed.data.retentionDays,
      legalHold: parsed.data.legalHold,
    },
  });

  revalidatePath("/system-admin/audit");
  return systemAdminActionSuccess(undefined);
}

export const upsertRetentionPolicyForm = async (
  formData: FormData,
): Promise<void> => {
  const result = await upsertRetentionPolicyAction(undefined, formData);
  if (!result.ok) {
    throw new Error(result.error);
  }
};
