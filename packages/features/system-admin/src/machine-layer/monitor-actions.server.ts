"use server";

import { requireCapability } from "@afenda/auth/server";
import { updateLynxOutcomeMonitorSetting } from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
} from "../action-results";
import { getSystemAdminLynxOutcomeMonitorThresholdCatalog } from "../catalogs";

const severityModes = ["standard", "observe", "critical"] as const;

function parseCatalogThresholds(formData: FormData, monitorId: string) {
  const catalog = getSystemAdminLynxOutcomeMonitorThresholdCatalog(monitorId);
  if (!catalog) {
    return { ok: false as const, reason: "unknown-monitor" as const };
  }

  const fieldErrors: Record<string, string> = {};
  const thresholds = Object.fromEntries(
    catalog.fields.map((field) => {
      const fieldName = `threshold.${field.key}`;
      const raw = formData.get(fieldName);
      if (typeof raw !== "string" || raw.trim() === "") {
        return [field.key, field.defaultValue];
      }

      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        fieldErrors[fieldName] = `${field.label} must be zero or greater.`;
        return [field.key, field.defaultValue];
      }

      return [field.key, value];
    }),
  );

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false as const,
      reason: "invalid-threshold" as const,
      fieldErrors,
    };
  }

  return { ok: true as const, thresholds };
}

export async function updateLynxOutcomeMonitorSettingAction(
  _previous: SystemAdminActionResult | undefined,
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
  if (!thresholds.ok && thresholds.reason === "unknown-monitor") {
    logServerEvent(
      "warn",
      "Lynx outcome monitor setting update rejected.",
      {
        organizationId: organization.id,
        userId: session.id,
        module: "system-admin",
        operation: "lynx.outcome-monitor.update",
      },
      { monitorId, reason: "unknown-monitor" },
    );
    return systemAdminActionFailure("Unknown Lynx outcome monitor.", {
      monitorId: "Unknown Lynx outcome monitor.",
    });
  }
  if (!thresholds.ok) {
    logServerEvent(
      "warn",
      "Lynx outcome monitor setting update rejected.",
      {
        organizationId: organization.id,
        userId: session.id,
        module: "system-admin",
        operation: "lynx.outcome-monitor.update",
      },
      { monitorId, reason: thresholds.reason },
    );
    return systemAdminActionFailure(
      "Enter valid numeric thresholds from the catalog.",
      thresholds.fieldErrors,
    );
  }
  if (!severityModes.includes(severityMode as (typeof severityModes)[number])) {
    logServerEvent(
      "warn",
      "Lynx outcome monitor setting update rejected.",
      {
        organizationId: organization.id,
        userId: session.id,
        module: "system-admin",
        operation: "lynx.outcome-monitor.update",
      },
      { monitorId, reason: "invalid-severity-mode" },
    );
    return systemAdminActionFailure("Select a supported severity mode.", {
      severityMode: "Select a supported severity mode.",
    });
  }
  const severityPolicyMode = severityMode as (typeof severityModes)[number];

  await updateLynxOutcomeMonitorSetting({
    organizationId: organization.id,
    monitorId,
    enabled: enabled === "true",
    ownerAuthUserId:
      typeof ownerAuthUserId === "string" && ownerAuthUserId.trim()
        ? ownerAuthUserId.trim()
        : null,
    thresholds: thresholds.thresholds,
    severityPolicy: {
      mode: severityPolicyMode,
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
      thresholdKeys: Object.keys(thresholds.thresholds),
      severityMode: severityPolicyMode,
    },
  );

  revalidatePath("/system-admin/machine-layer");
  revalidatePath("/solution-console/runs");
  revalidatePath("/solution-console/workflows");
  return systemAdminActionSuccess(undefined);
}

export const updateLynxOutcomeMonitorSettingForm = async (
  formData: FormData,
): Promise<void> => {
  const result = await updateLynxOutcomeMonitorSettingAction(undefined, formData);
  if (!result.ok) {
    throw new Error(result.error);
  }
};
