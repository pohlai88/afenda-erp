"use server";

import { updateLynxOutcomeMonitorSetting } from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
} from "../contracts";
import { requireSystemAdminMachineLayerApprove } from "../policies";
import {
  isSystemAdminLynxOutcomeMonitorSeverityMode,
  parseSystemAdminLynxOutcomeMonitorThresholds,
} from "../schemas";

export async function updateLynxOutcomeMonitorSettingAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization } =
    await requireSystemAdminMachineLayerApprove();
  const monitorId = formData.get("monitorId");
  const enabled = formData.get("enabled");
  const ownerAuthUserId = formData.get("ownerAuthUserId");
  const severityMode = String(formData.get("severityMode") ?? "standard");

  if (typeof monitorId !== "string" || monitorId.trim() === "") {
    return systemAdminActionFailure("Monitor id is required.", {
      monitorId: "Monitor id is required.",
    });
  }
  const thresholds = parseSystemAdminLynxOutcomeMonitorThresholds(
    formData,
    monitorId,
  );
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
  if (!isSystemAdminLynxOutcomeMonitorSeverityMode(severityMode)) {
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
  const severityPolicyMode = severityMode;

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
  const result = await updateLynxOutcomeMonitorSettingAction(
    undefined,
    formData,
  );
  if (!result.ok) {
    throw new Error(result.error);
  }
};
