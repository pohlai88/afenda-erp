"use server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { requireHrmPermission } from "../../../_core/governance"
import { hrmActionFailure } from "../../../_core/governance"
import type { TimeClockReportExportFormState } from "../../../_core/shared"
import { HRM_TCI_AUDIT } from "../tci.contract"
import { buildTimeClockReportCsv } from "../data/tci-report.server"
import { exportTimeClockReportFormSchema } from "../schemas/tci.schema"

const REPORT_FILTER_ALL = "__all__"

function normalizeReportFilterValue(
  value: FormDataEntryValue | null
): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed || trimmed === REPORT_FILTER_ALL) return null
  return trimmed
}

export async function exportTimeClockReportAction(
  _prev: TimeClockReportExportFormState | undefined,
  formData: FormData
): Promise<TimeClockReportExportFormState> {
  const gate = await requireHrmPermission({
    object: "time_clock",
    function: "audit",
    errorMessage: "Time clock audit permission required to export reports.",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })
  const { organizationId, userId, sessionId } = gate.session

  const rowKindEntries = formData
    .getAll("rowKinds")
    .filter((entry): entry is string => typeof entry === "string")

  const parsed = exportTimeClockReportFormSchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    employeeId: normalizeReportFilterValue(formData.get("employeeId")),
    deviceId: normalizeReportFilterValue(formData.get("deviceId")),
    departmentId: normalizeReportFilterValue(formData.get("departmentId")),
    locationRef: normalizeReportFilterValue(formData.get("locationRef")),
    detectionOutcome: normalizeReportFilterValue(
      formData.get("detectionOutcome")
    ),
    syncStatus: normalizeReportFilterValue(formData.get("syncStatus")),
    rowKinds: rowKindEntries.length > 0 ? rowKindEntries : undefined,
    onlyExceptions:
      formData.get("onlyExceptions") === "on" ||
      formData.get("onlyExceptions") === "true",
  })
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      startDate: errs.startDate?.[0],
      endDate: errs.endDate?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  const report = await buildTimeClockReportCsv({
    organizationId,
    filters: parsed.data,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_TCI_AUDIT.reportExport,
    actorUserId: userId,
    actorSessionId: sessionId,
    organizationId,
    resourceType: "hrm_time_clock_report",
    resourceId: report.filename,
    metadata: {
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      rowCount: report.rowCount,
      onlyExceptions: parsed.data.onlyExceptions ?? false,
      employeeId: parsed.data.employeeId ?? null,
      deviceId: parsed.data.deviceId ?? null,
      departmentId: parsed.data.departmentId ?? null,
      locationRef: parsed.data.locationRef ?? null,
      detectionOutcome: parsed.data.detectionOutcome ?? null,
      syncStatus: parsed.data.syncStatus ?? null,
      rowKinds: parsed.data.rowKinds ?? [],
    },
  })

  return {
    ok: true,
    csv: report.csv,
    filename: report.filename,
    rowCount: report.rowCount,
  }
}
