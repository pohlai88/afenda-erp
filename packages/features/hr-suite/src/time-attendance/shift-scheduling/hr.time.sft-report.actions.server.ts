"use server";

import {
  type ActionResult,
  actionSuccess,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import {
  buildHrSftScheduleReport,
  buildHrSftScheduleReportCsv,
  hrSftReportFilterSchema,
  saveHrSftReportDefinition,
  saveHrSftReportDefinitionFormSchema,
  toHrSftReportActionFailure,
  type HrSftReportCsvResult,
  type HrSftReportResult,
} from "../data/hr.time.sft-report.server";
import { emitHrSftAuditEvent } from "../data/hr.time.sft-audit.server";
import {
  HrSftAccessDeniedError,
  requireHrSftManage,
  requireHrSftReportExport,
  requireHrSftRead,
} from "./hr.time.sft-access.policy.server";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";

function readSftReportFormField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseSftReportFormData(formData: FormData) {
  return {
    groupBy: readSftReportFormField(formData, "groupBy"),
    periodStartIso: readSftReportFormField(formData, "periodStartIso"),
    periodEndIso: readSftReportFormField(formData, "periodEndIso"),
    employeeId: readSftReportFormField(formData, "employeeId"),
    departmentId: readSftReportFormField(formData, "departmentId"),
    managerEmployeeId: readSftReportFormField(formData, "managerEmployeeId"),
    locationCode: readSftReportFormField(formData, "locationCode"),
    legalEntityCode: readSftReportFormField(formData, "legalEntityCode"),
    grade: readSftReportFormField(formData, "grade"),
    positionId: readSftReportFormField(formData, "positionId"),
    templateId: readSftReportFormField(formData, "templateId"),
  };
}

async function buildSftReportInput(
  guard: Awaited<ReturnType<typeof requireHrSftRead>>,
  filter: Awaited<ReturnType<typeof hrSftReportFilterSchema.parse>>,
) {
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds();
  return {
    organizationId: guard.organization.id,
    filter,
    visibleEmployeeIds,
  };
}

/** HRM-SFT-028 — generate shift schedule report within authorized scope. */
export async function generateHrSftScheduleReportAction(
  formData: FormData,
): Promise<ActionResult<HrSftReportResult>> {
  let guard: Awaited<ReturnType<typeof requireHrSftRead>>;
  try {
    guard = await requireHrSftRead();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = hrSftReportFilterSchema.safeParse(parseSftReportFormData(formData));
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const report = await buildHrSftScheduleReport(
      await buildSftReportInput(guard, parsed.data),
    );

    await emitHrSftAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: hrTimeSftAuditActions.report.generated,
      storeAction: "report_exported",
      targetType: "hr_sft_report",
      targetId: guard.organization.id,
      summary: `Shift schedule report generated (${report.rowCount} rows).`,
      metadata: {
        groupBy: parsed.data.groupBy,
        periodStartIso: parsed.data.periodStartIso,
        periodEndIso: parsed.data.periodEndIso,
        rowCount: report.rowCount,
        accessRole: guard.organization.role,
        accessScope: guard.accessScope,
      },
    });

    return actionSuccess(report);
  } catch (error) {
    return toHrSftReportActionFailure(error) as ActionResult<HrSftReportResult>;
  }
}

/** HRM-SFT-028 — export shift schedule report CSV. */
export async function exportHrSftScheduleReportAction(
  formData: FormData,
): Promise<ActionResult<HrSftReportCsvResult>> {
  let guard: Awaited<ReturnType<typeof requireHrSftReportExport>>;
  try {
    guard = await requireHrSftReportExport();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = hrSftReportFilterSchema.safeParse(parseSftReportFormData(formData));
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const exportBody = await buildHrSftScheduleReportCsv(
      await buildSftReportInput(guard, parsed.data),
    );

    await emitHrSftAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: hrTimeSftAuditActions.report.exported,
      storeAction: "report_exported",
      targetType: "hr_sft_report",
      targetId: guard.organization.id,
      summary: `Shift schedule report exported (${exportBody.rowCount} rows).`,
      metadata: {
        groupBy: parsed.data.groupBy,
        periodStartIso: parsed.data.periodStartIso,
        periodEndIso: parsed.data.periodEndIso,
        rowCount: exportBody.rowCount,
        filename: exportBody.filename,
        accessRole: guard.organization.role,
        accessScope: guard.accessScope,
      },
    });

    return actionSuccess(exportBody);
  } catch (error) {
    return toHrSftReportActionFailure(error) as ActionResult<HrSftReportCsvResult>;
  }
}

/** HRM-SFT-028 — save shift report definition preset. */
export async function saveHrSftReportDefinitionAction(
  formData: FormData,
): Promise<ActionResult<{ definitionId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = saveHrSftReportDefinitionFormSchema.safeParse({
    code: readSftReportFormField(formData, "code"),
    name: readSftReportFormField(formData, "name"),
    description: readSftReportFormField(formData, "description"),
    filterPayloadJson: readSftReportFormField(formData, "filterPayloadJson"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const filterParsed = hrSftReportFilterSchema.safeParse(
    parsed.data.filterPayloadJson
      ? JSON.parse(parsed.data.filterPayloadJson)
      : parseSftReportFormData(formData),
  );

  if (!filterParsed.success) {
    return zodActionFailure(filterParsed.error);
  }

  try {
    const result = await saveHrSftReportDefinition({
      organizationId: guard.organization.id,
      createdByAuthUserId: guard.session.id,
      code: parsed.data.code,
      name: parsed.data.name,
      description: parsed.data.description,
      filter: filterParsed.data,
    });

    await emitHrSftAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: hrTimeSftAuditActions.report.definitionSaved,
      storeAction: "report_definition_saved",
      targetType: "hr_sft_report_definition",
      targetId: result.definitionId,
      summary: `Saved shift report definition ${parsed.data.code}.`,
      metadata: {
        code: parsed.data.code,
        name: parsed.data.name,
      },
    });

    return actionSuccess(result);
  } catch (error) {
    return toHrSftReportActionFailure(error) as ActionResult<{ definitionId: string }>;
  }
}

/** HRM-SFT-025 — publish roster and notify employees. */
export async function publishHrSftRosterAction(
  formData: FormData,
): Promise<
  ActionResult<{
    publicationId: string;
    publishedAssignmentCount: number;
    enqueuedCount: number;
  }>
> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const periodStartIso = readSftReportFormField(formData, "periodStartIso");
  const periodEndIso = readSftReportFormField(formData, "periodEndIso");
  const notes = readSftReportFormField(formData, "notes");

  if (!periodStartIso || !periodEndIso) {
    return { ok: false, error: "period_range_required" };
  }

  const periodStart = new Date(periodStartIso);
  const periodEnd = new Date(periodEndIso);

  if (
    Number.isNaN(periodStart.getTime()) ||
    Number.isNaN(periodEnd.getTime()) ||
    periodStart > periodEnd
  ) {
    return { ok: false, error: "invalid_period_range" };
  }

  try {
    const { publishHrSftRoster } = await import(
      "../data/hr.time.sft-publication.server"
    );

    const result = await publishHrSftRoster({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      periodStart,
      periodEnd,
      notes,
    });

    return actionSuccess(result);
  } catch (error) {
    return toHrSftReportActionFailure(error) as ActionResult<{
      publicationId: string;
      publishedAssignmentCount: number;
      enqueuedCount: number;
    }>;
  }
}
