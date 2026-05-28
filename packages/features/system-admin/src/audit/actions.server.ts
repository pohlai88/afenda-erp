"use server";

import { requireCapability } from "@afenda/auth/server";
import { upsertRetentionPolicy } from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../action-results";
import { dispatchSystemAdminWebhook } from "../webhooks.server";

const retentionSchema = z.object({
  entityType: z.enum([
    "organization",
    "membership",
    "user-profile",
    "erp-record",
    "workflow-item",
    "saved-view",
    "document",
    "system",
  ]),
  retentionDays: z.coerce.number().int().min(1).max(3650),
  legalHold: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
});

export async function upsertRetentionPolicyAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireCapability(
    "system-admin.audit.export",
  );

  const parsed = retentionSchema.safeParse({
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
