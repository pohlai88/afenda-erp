"use server";

import { ensureTenantSettings, updateTenantSettings } from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { dispatchSystemAdminWebhook } from "../../integrations/server";
import { requireSystemAdminOrganizationManage } from "../policies/system-admin.organization.policy.server";
import {
  systemAdminOrganizationAuditActions,
  systemAdminOrganizationWebhookEvents,
} from "../events/system-admin.organization.event";
import { systemAdminOrganizationDefaultsActionSchema } from "../schemas/system-admin.organization.schema";

function revalidateSystemAdminPaths(...paths: readonly string[]) {
  revalidatePath(systemAdminRoutePaths.hub);
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function updateSystemAdminOrganizationDefaultsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminOrganizationManage();
  const parsed = systemAdminOrganizationDefaultsActionSchema.safeParse({
    timezone: formData.get("timezone"),
    locale: formData.get("locale"),
    currency: formData.get("currency"),
    fiscalYearStartMonth: formData.get("fiscalYearStartMonth"),
    documentPrefix: formData.get("documentPrefix"),
    numberingPrefix: formData.get("numberingPrefix"),
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
    patch: {
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
      currency: parsed.data.currency,
      fiscalYearStartMonth: parsed.data.fiscalYearStartMonth,
      documentPrefixes: { default: parsed.data.documentPrefix },
      numbering: { defaultPrefix: parsed.data.numberingPrefix },
      dataRegion: parsed.data.dataRegion,
      zdrEnabled: parsed.data.zdrEnabled,
    },
  });
  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminOrganizationAuditActions[0],
    targetType: "organization",
    metadata: parsed.data,
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminOrganizationWebhookEvents[0],
    payload: parsed.data,
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.organization);
  return systemAdminActionSuccess(undefined);
}
