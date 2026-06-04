"use server";

import { type ActionResult, actionSuccess, zodActionFailure } from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import {
  buildHrAatTrendReport,
  buildHrAatTrendReportCsv,
  toHrAatReportActionFailure,
} from "./hrs-hr-time-aat-report-server";
import {
  HrAatAccessDeniedError,
  requireHrAatReportExport,
  requireHrAatReportRead,
} from "./hr.time.aat-access.policy.server";
import {
  exportHrAatTrendReportFormSchema,
  generateHrAatTrendReportFormSchema,
  type HrAatTrendReportCsvResult,
  type HrAatTrendReportResult,
} from "./hr.time.aat-report.schema";
import { hrTimeAatAuditActions } from "./hr.time.aat.event";

function readAatReportFormField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseAatReportFormData(formData: FormData) {
  return {
    groupBy: readAatReportFormField(formData, "groupBy"),
    periodGranularity: readAatReportFormField(formData, "periodGranularity"),
    periodStartIso: readAatReportFormField(formData, "periodStartIso"),
    periodEndIso: readAatReportFormField(formData, "periodEndIso"),
    employeeId: readAatReportFormField(formData, "employeeId"),
    departmentId: readAatReportFormField(formData, "departmentId"),
    managerEmployeeId: readAatReportFormField(formData, "managerEmployeeId"),
    locationCode: readAatReportFormField(formData, "locationCode"),
    legalEntityCode: readAatReportFormField(formData, "legalEntityCode"),
    leaveType: readAatReportFormField(formData, "leaveType"),
  };
}

async function buildAatReportInput(
  guard: Awaited<ReturnType<typeof requireHrAatReportRead>>,
  filter: Awaited<ReturnType<typeof generateHrAatTrendReportFormSchema.parse>>,
) {
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds();
  return {
    ...filter,
    organizationId: guard.organization.id,
    visibleEmployeeIds,
    canViewSensitiveReasons: guard.canViewSensitiveReasons,
    actorEmployeeIds: guard.actorEmployeeIds,
  };
}

/** HRM-AAT-023 — generate absence trend report within authorized scope. */
export async function generateHrAatTrendReportAction(
  formData: FormData,
): Promise<ActionResult<HrAatTrendReportResult>> {
  let guard: Awaited<ReturnType<typeof requireHrAatReportRead>>;
  try {
    guard = await requireHrAatReportRead();
  } catch (error) {
    if (error instanceof HrAatAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = generateHrAatTrendReportFormSchema.safeParse(
    parseAatReportFormData(formData),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const report = await buildHrAatTrendReport(
      await buildAatReportInput(guard, parsed.data),
    );

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action: hrTimeAatAuditActions.report.generated,
      targetType: "hr_aat_report",
      targetId: guard.organization.id,
      metadata: {
        groupBy: parsed.data.groupBy,
        periodGranularity: parsed.data.periodGranularity,
        periodStartIso: parsed.data.periodStartIso,
        periodEndIso: parsed.data.periodEndIso,
        rowCount: report.rowCount,
        accessRole: guard.accessRole,
        accessScope: guard.accessScope,
      },
    });

    return actionSuccess(report);
  } catch (error) {
    return toHrAatReportActionFailure(error) as ActionResult<HrAatTrendReportResult>;
  }
}

/** HRM-AAT-024 — export absence trend report CSV for authorized users. */
export async function exportHrAatTrendReportAction(
  formData: FormData,
): Promise<ActionResult<HrAatTrendReportCsvResult>> {
  let guard: Awaited<ReturnType<typeof requireHrAatReportExport>>;
  try {
    guard = await requireHrAatReportExport();
  } catch (error) {
    if (error instanceof HrAatAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = exportHrAatTrendReportFormSchema.safeParse(
    parseAatReportFormData(formData),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const exportBody = await buildHrAatTrendReportCsv(
      await buildAatReportInput(guard, parsed.data),
    );

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action: hrTimeAatAuditActions.report.exported,
      targetType: "hr_aat_report",
      targetId: guard.organization.id,
      metadata: {
        groupBy: parsed.data.groupBy,
        periodGranularity: parsed.data.periodGranularity,
        periodStartIso: parsed.data.periodStartIso,
        periodEndIso: parsed.data.periodEndIso,
        rowCount: exportBody.rowCount,
        filename: exportBody.filename,
        accessRole: guard.accessRole,
        accessScope: guard.accessScope,
      },
    });

    return actionSuccess(exportBody);
  } catch (error) {
    return toHrAatReportActionFailure(error) as ActionResult<HrAatTrendReportCsvResult>;
  }
}
