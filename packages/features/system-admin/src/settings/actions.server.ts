"use server";

import { requireCapability } from "@afenda/auth/server";
import { ensureTenantSettings, updateTenantSettings } from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../action-results";
import { dispatchSystemAdminWebhook } from "../webhooks.server";

const settingsSchema = z.object({
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: z.string().length(3),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
  dataRegion: z.string().min(2).max(32),
  zdrEnabled: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
});

export async function updateTenantSettingsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireCapability(
    "system-admin.settings.write",
  );

  const parsed = settingsSchema.safeParse({
    timezone: formData.get("timezone"),
    locale: formData.get("locale"),
    currency: formData.get("currency"),
    fiscalYearStartMonth: formData.get("fiscalYearStartMonth"),
    dataRegion: formData.get("dataRegion"),
    zdrEnabled: formData.get("zdrEnabled"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await ensureTenantSettings({ organizationId: organization.id });
  await updateTenantSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    patch: parsed.data,
  });

  logServerEvent(
    "info",
    "System admin tenant settings updated.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "settings.update",
    },
    {
      fields: Object.keys(parsed.data),
    },
  );
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "tenant.settings.updated",
    payload: {
      fields: Object.keys(parsed.data),
      dataRegion: parsed.data.dataRegion,
      zdrEnabled: parsed.data.zdrEnabled,
    },
  });

  revalidatePath("/system-admin/settings");
  return systemAdminActionSuccess(undefined);
}

export const updateTenantSettingsForm = async (
  formData: FormData,
): Promise<void> => {
  const result = await updateTenantSettingsAction(undefined, formData);
  if (!result.ok) {
    throw new Error(result.error);
  }
};
