"use server";

import { requireCapability } from "@afenda/auth/server";
import { updateLynxOutcomeMonitorSetting } from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  toSystemAdminVoidFormAction,
  type SystemAdminActionResult,
} from "../action-results";
import { getSystemAdminLynxOutcomeMonitorThresholdCatalog } from "../catalogs";

const severityModes = ["standard", "observe", "critical"] as const;

function parseCatalogThresholds(formData: FormData, monitorId: string) {
  const catalog = getSystemAdminLynxOutcomeMonitorThresholdCatalog(monitorId);
  if (!catalog) {
    return null;
  }

  return Object.fromEntries(
    catalog.fields.map((field) => {
      const raw = formData.get(`threshold.${field.key}`);
      const value =
        typeof raw === "string" && raw.trim() !== ""
          ? Number(raw)
          : field.defaultValue;
      return [
        field.key,
        Number.isFinite(value) && value >= 0 ? value : field.defaultValue,
      ];
    }),
  );
}

export async function updateLynxOutcomeMonitorSettingAction(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireCapability(
    "system-admin.machine-layer.approve",
  );
  const monitorId = formData.get("monitorId");
  const enabled = formData.get("enabled");
  const ownerAuthUserId = formData.get("ownerAuthUserId");
  const severityMode = String(formData.get("severityMode") ?? "standard");

  if (typeof monitorId !== "string" || monitorId.trim() === "") {
    return systemAdminActionFailure("Monitor id is required.", {
      monitorId: "Monitor id is required.",
    });
  }
  const thresholds = parseCatalogThresholds(formData, monitorId);
  if (!thresholds) {
    return systemAdminActionFailure("Unknown Lynx outcome monitor.", {
      monitorId: "Unknown Lynx outcome monitor.",
    });
  }

  await updateLynxOutcomeMonitorSetting({
    organizationId: organization.id,
    monitorId,
    enabled: enabled === "true",
    ownerAuthUserId:
      typeof ownerAuthUserId === "string" && ownerAuthUserId.trim()
        ? ownerAuthUserId.trim()
        : null,
    thresholds,
    severityPolicy: {
      mode: severityModes.includes(
        severityMode as (typeof severityModes)[number],
      )
        ? severityMode
        : "standard",
    },
    updatedByAuthUserId: session.id,
  });

  logServerEvent(
    "info",
    "Lynx outcome monitor setting updated.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "lynx.outcome-monitor.update",
    },
    {
      monitorId,
      enabled: enabled === "true",
      thresholdKeys: Object.keys(thresholds),
      severityMode,
    },
  );

  revalidatePath("/system-admin/machine-layer");
  revalidatePath("/solution-console/runs");
  revalidatePath("/solution-console/workflows");
  return systemAdminActionSuccess(undefined);
}

export const updateLynxOutcomeMonitorSettingForm =
  toSystemAdminVoidFormAction(updateLynxOutcomeMonitorSettingAction);
