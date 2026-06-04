"use server";

import {
  type ActionResult,
  actionSuccess,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";

import {
  buildHrTimeOtmReportCsvExport,
  type HrTimeOtmReportCsvResult,
} from "./hr.time.otm-report.server";
import { emitHrTimeOtmAuditEvent } from "./hr.time.otm-audit.server";
import {
  HrTimeOtmAccessDeniedError,
  requireHrTimeOtmReportExport,
} from "./hr.time.otm-access.policy.server";
import { exportHrTimeOtmReportFormSchema } from "./hr.time.otm.schema";
import { HRM_OTM_AUDIT } from "./hr.time.otm.event";
import {
  HR_TIME_OTM_REVALIDATE_PATH,
  toHrTimeOtmActionFailure,
} from "./hr.time.otm-action-result.shared.server";

function readOtmReportFormField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalIsoDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** HRM-OTM-027 — export overtime report CSV within authorized scope. */
export async function exportHrTimeOtmReportAction(
  formData: FormData,
): Promise<ActionResult<HrTimeOtmReportCsvResult>> {
  let guard: Awaited<ReturnType<typeof requireHrTimeOtmReportExport>>;
  try {
    guard = await requireHrTimeOtmReportExport();
  } catch (error) {
    if (error instanceof HrTimeOtmAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = exportHrTimeOtmReportFormSchema.safeParse({
    groupBy: readOtmReportFormField(formData, "groupBy"),
    periodStartIso: readOtmReportFormField(formData, "periodStartIso"),
    periodEndIso: readOtmReportFormField(formData, "periodEndIso"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds();
    const exportBody = await buildHrTimeOtmReportCsvExport({
      organizationId: guard.organization.id,
      groupBy: parsed.data.groupBy,
      periodStart: parseOptionalIsoDate(parsed.data.periodStartIso),
      periodEnd: parseOptionalIsoDate(parsed.data.periodEndIso),
      visibleEmployeeIds,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.payroll.export,
      targetId: guard.organization.id,
      summary: "Overtime report exported",
      metadata: {
        groupBy: parsed.data.groupBy,
        periodStartIso: parsed.data.periodStartIso,
        periodEndIso: parsed.data.periodEndIso,
        rowCount: exportBody.rowCount,
        filename: exportBody.filename,
        accessRole: guard.accessRole,
        accessScope: guard.accessScope,
      },
    });

    revalidatePath(HR_TIME_OTM_REVALIDATE_PATH);
    return actionSuccess(exportBody);
  } catch (error) {
    return toHrTimeOtmActionFailure<HrTimeOtmReportCsvResult>(error);
  }
}
