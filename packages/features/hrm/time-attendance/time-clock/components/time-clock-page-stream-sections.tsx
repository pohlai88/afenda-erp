import type { ReactElement } from "react"
import { getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import {
  countTimeClockKpiSummary,
  listTimeClockDevicesForOrg,
  listTimeClockExceptionsForOrg,
  listTimeClockMappingsForOrg,
  listRecentBreakPunchesForOrg,
  listRecentClockInOutPunchesForOrg,
  listTimeClockSyncBatchesForOrg,
  type TimeClockKpiSummary,
} from "../data/tci.queries.server"
import { listActiveEmployeeChoicesForAttendance } from "../../leave-attendance-management/data/attendance.queries.server"

import { TimeClockDevicesSection } from "./tci-devices-section"
import { TimeClockExceptionsSection } from "./tci-exceptions-section"
import { TimeClockKpiSection } from "./tci-kpi-section"
import { TimeClockMappingsSection } from "./tci-mappings-section"
import { TimeClockBreakPunchRecordsSection } from "./tci-break-punch-records-section"
import { TimeClockPunchRecordsSection } from "./tci-punch-records-section"
import { TimeClockSyncBatchesSection } from "./tci-sync-batches-section"
import { TimeClockSyncMonitoringFindingsSection } from "./tci-sync-monitoring-findings-section"
import { listSyncMonitoringRowsForOrg } from "../data/tci-sync-monitoring.server"
import { TimeClockMissingPunchFindingsSection } from "./tci-missing-punch-findings-section"
import { TimeClockDuplicatePunchFindingsSection } from "./tci-duplicate-punch-findings-section"
import { TimeClockAbnormalPunchFindingsSection } from "./tci-abnormal-punch-findings-section"
import { listMissingPunchDayFindingsForOrg } from "../data/tci-missing-punch-detection.server"
import { listDuplicatePunchDayFindingsForOrg } from "../data/tci-duplicate-detection.server"
import { listAbnormalPunchDayFindingsForOrg } from "../data/tci-abnormal-punch-detection.server"
import { TimeClockShiftMatchFindingsSection } from "./tci-shift-match-findings-section"
import { listShiftMatchRowsForOrg } from "../data/tci-shift-matching.server"
import { TimeClockRawVsApprovedFindingsSection } from "./tci-raw-vs-approved-findings-section"
import { listRawVsApprovedFindingsForOrg } from "../data/tci-raw-vs-approved.server"
import { TimeClockAuditTrailSection } from "./tci-audit-trail-section"
import { listTimeClockAuditTrailForOrg } from "../data/tci-audit-trail.server"
import { TimeClockAttendanceHandoffFindingsSection } from "./tci-attendance-handoff-findings-section"
import { listAttendanceHandoffRowsForOrg } from "../data/tci-attendance-handoff.server"
import { TimeClockOvertimeReferenceFindingsSection } from "./tci-overtime-reference-findings-section"
import { listOvertimeReferenceRowsForOrg } from "../data/tci-overtime-reference.server"
import { TimeClockPayrollReferenceFindingsSection } from "./tci-payroll-reference-findings-section"
import { listPayrollReferenceRowsForOrg } from "../data/tci-payroll-reference.server"
import { TimeClockCorrectionWorkflowSection } from "./tci-correction-workflow-section"
import { listCorrectionWorkflowRowsForOrg } from "../data/tci-correction-workflow.server"
import type { TimeClockLoadError } from "../data/tci-load-error.shared"

type QueryResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: unknown }

const EMPTY_KPI_SUMMARY = {
  activeDevices: 0,
  activeMappings: 0,
  pendingExceptions: 0,
  failedSyncDevices: 0,
  punchesToday: 0,
  missingPunchDays: 0,
  duplicatePunchInbox: 0,
  abnormalPunchDays: 0,
  abnormalPunchInbox: 0,
  shiftEvaluatedToday: 0,
  lamExposedToday: 0,
  workHourDaysToday: 0,
  payrollReadyDaysToday: 0,
  correctionQueueOpen: 0,
} as const satisfies TimeClockKpiSummary

const SUBMITTED_EXCEPTIONS_FILTER = { state: "submitted" } as const

async function runTimeClockPageQuery<T>(
  label: string,
  organizationId: string,
  query: () => Promise<T>
): Promise<QueryResult<T>> {
  try {
    return { ok: true, value: await query() }
  } catch (error) {
    logUnexpectedServerError(`time-clock-page: ${label} query failed`, error, {
      organizationId,
    })
    return { ok: false, error }
  }
}

async function loadFailedCopy() {
  const t = await getTranslations("Erp.Hrm.timeClock")
  return { title: t("loadFailed") } as const
}

type TimeClockTierBReadListSectionProps<TRow> = {
  readonly rows: readonly TRow[]
  readonly orgSlug?: string
  readonly parentAccessAllowed?: boolean
  readonly loadError?: TimeClockLoadError
}

/** Shared Tier B loader: permission gate, parallel query + load-failed copy, Pattern B section props. */
async function streamTimeClockTierBReadSection<TRow, TSectionProps>({
  label,
  organizationId,
  accessAllowed,
  orgSlug,
  query,
  Section,
  buildSectionProps,
}: {
  readonly label: string
  readonly organizationId: string
  readonly accessAllowed: boolean
  readonly orgSlug?: string
  readonly query: () => Promise<readonly TRow[]>
  readonly Section: (props: TSectionProps) => Promise<ReactElement>
  readonly buildSectionProps: (
    base: TimeClockTierBReadListSectionProps<TRow>
  ) => TSectionProps
}): Promise<ReactElement> {
  if (!accessAllowed) {
    const loadFailed = await loadFailedCopy()
    return Section(
      buildSectionProps({
        rows: [],
        orgSlug,
        parentAccessAllowed: false,
        loadError: loadFailed,
      })
    )
  }

  const [result, loadFailed] = await Promise.all([
    runTimeClockPageQuery(label, organizationId, query),
    loadFailedCopy(),
  ])

  return Section(
    buildSectionProps({
      rows: result.ok ? result.value : [],
      orgSlug,
      parentAccessAllowed: true,
      loadError: result.ok ? undefined : loadFailed,
    })
  )
}

/** Tier B — KPI stat cards; streamed on the time-clock page. */
export async function TimeClockKpiStreamSection({
  organizationId,
}: {
  readonly organizationId: string
}) {
  const [result, loadFailed] = await Promise.all([
    runTimeClockPageQuery("kpi", organizationId, () =>
      countTimeClockKpiSummary(organizationId)
    ),
    loadFailedCopy(),
  ])

  return (
    <TimeClockKpiSection
      summary={result.ok ? result.value : EMPTY_KPI_SUMMARY}
      loadError={result.ok ? undefined : loadFailed}
    />
  )
}

/** Tier B — device registry; streamed on the time-clock page. */
export async function TimeClockDevicesStreamSection({
  orgSlug,
  organizationId,
  canRead,
  canManageDevices,
  mobileClockEnabled = false,
}: {
  readonly orgSlug: string
  readonly organizationId: string
  readonly canRead: boolean
  readonly canManageDevices: boolean
  readonly mobileClockEnabled?: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "devices",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listTimeClockDevicesForOrg(organizationId),
    Section: TimeClockDevicesSection,
    buildSectionProps: (base) => ({
      rows: base.rows,
      orgSlug,
      canManage: canManageDevices,
      mobileClockEnabled,
      parentAccessAllowed: base.parentAccessAllowed,
      loadError: base.loadError,
    }),
  })
}

/** Tier B — mappings + choice lists; streamed on the time-clock page. */
export async function TimeClockMappingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
  canManageMappings,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
  readonly canManageMappings: boolean
}) {
  if (!canRead) {
    return (
      <TimeClockMappingsSection
        rows={[]}
        canManage={canManageMappings}
        orgSlug={orgSlug}
        employeeChoices={[]}
        deviceChoices={[]}
        parentAccessAllowed={false}
      />
    )
  }

  const [loadFailed, mappingsResult, devicesResult, employeesResult] =
    await Promise.all([
      loadFailedCopy(),
      runTimeClockPageQuery("mappings", organizationId, () =>
        listTimeClockMappingsForOrg(organizationId)
      ),
      runTimeClockPageQuery("devices", organizationId, () =>
        listTimeClockDevicesForOrg(organizationId)
      ),
      canManageMappings
        ? runTimeClockPageQuery("employee choices", organizationId, () =>
            listActiveEmployeeChoicesForAttendance(organizationId)
          )
        : Promise.resolve({ ok: true as const, value: [] }),
    ])

  const employeeChoices = (employeesResult.ok ? employeesResult.value : []).map(
    (row) => ({
      id: row.id,
      label:
        row.employeeNumber != null
          ? `${row.legalName} · ${row.employeeNumber}`
          : row.legalName,
    })
  )

  const deviceChoices = (devicesResult.ok ? devicesResult.value : [])
    .filter((row) => row.state === "active")
    .map((row) => ({
      id: row.id,
      label: `${row.name} (${row.externalDeviceId})`,
    }))

  const mappingsLoadError =
    mappingsResult.ok && devicesResult.ok && employeesResult.ok
      ? undefined
      : loadFailed

  return (
    <TimeClockMappingsSection
      rows={mappingsResult.ok ? mappingsResult.value : []}
      canManage={canManageMappings}
      orgSlug={orgSlug}
      employeeChoices={employeeChoices}
      deviceChoices={deviceChoices}
      parentAccessAllowed={canRead}
      loadError={mappingsLoadError}
    />
  )
}

/** Tier B — raw vs approved separation (HRM-TCI-029). */
export async function TimeClockRawVsApprovedFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "raw-vs-approved",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listRawVsApprovedFindingsForOrg(organizationId),
    Section: TimeClockRawVsApprovedFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — IAM audit trail for time clock mutations (HRM-TCI-030). */
export async function TimeClockAuditTrailStreamSection({
  organizationId,
  canAudit,
}: {
  readonly organizationId: string
  readonly canAudit: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "audit-trail",
    organizationId,
    accessAllowed: canAudit,
    query: () => listTimeClockAuditTrailForOrg(organizationId),
    Section: TimeClockAuditTrailSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — recent clock-in/out device punches (HRM-TCI-006). */
export async function TimeClockPunchRecordsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "punch records",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listRecentClockInOutPunchesForOrg(organizationId),
    Section: TimeClockPunchRecordsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — recent break_start / break_end device punches (HRM-TCI-007). */
export async function TimeClockBreakPunchRecordsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "break punch records",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listRecentBreakPunchesForOrg(organizationId),
    Section: TimeClockBreakPunchRecordsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — ingest batch history; streamed on the time-clock page. */
export async function TimeClockSyncBatchesStreamSection({
  organizationId,
}: {
  readonly organizationId: string
}) {
  const [result, loadFailed] = await Promise.all([
    runTimeClockPageQuery("sync batches", organizationId, () =>
      listTimeClockSyncBatchesForOrg(organizationId)
    ),
    loadFailedCopy(),
  ])

  return (
    <TimeClockSyncBatchesSection
      rows={result.ok ? result.value : []}
      parentAccessAllowed
      loadError={result.ok ? undefined : loadFailed}
    />
  )
}

/** Tier B — devices needing sync attention (HRM-TCI-026). */
export async function TimeClockSyncMonitoringFindingsStreamSection({
  organizationId,
  canRead,
  workbenchFocus,
}: {
  readonly organizationId: string
  readonly canRead: boolean
  readonly workbenchFocus?: string | null
}) {
  return streamTimeClockTierBReadSection({
    label: "sync monitoring findings",
    organizationId,
    accessAllowed: canRead,
    query: () => listSyncMonitoringRowsForOrg(organizationId),
    Section: TimeClockSyncMonitoringFindingsSection,
    buildSectionProps: (base) => ({
      ...base,
      rows: base.rows.filter((row) =>
        matchesGovernedWorkbenchFocus(
          workbenchFocus,
          row.name,
          row.externalDeviceId,
          row.locationRef,
          row.syncStatus,
          row.attentionKind
        )
      ),
      workbenchFocus,
    }),
  })
}

/** Tier B — LAM duplicate sequence days (HRM-TCI-018). */
export async function TimeClockDuplicatePunchFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "duplicate punch findings",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listDuplicatePunchDayFindingsForOrg(organizationId),
    Section: TimeClockDuplicatePunchFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — work-hour records exposed to Overtime Management (HRM-TCI-022). */
export async function TimeClockOvertimeReferenceFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "overtime reference findings",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listOvertimeReferenceRowsForOrg(organizationId),
    Section: TimeClockOvertimeReferenceFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier C — unified correction queue (HRM-TCI-024). */
export async function TimeClockCorrectionWorkflowStreamSection({
  orgSlug,
  organizationId,
  canRead,
  canDecideExceptions,
  canCorrectAttendance,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
  readonly canDecideExceptions: boolean
  readonly canCorrectAttendance: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "correction workflow",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listCorrectionWorkflowRowsForOrg(organizationId),
    Section: TimeClockCorrectionWorkflowSection,
    buildSectionProps: (base) => ({
      ...base,
      canDecide: base.parentAccessAllowed ? canDecideExceptions : false,
      canCorrectAttendance: base.parentAccessAllowed
        ? canCorrectAttendance
        : false,
    }),
  })
}

/** Tier B — approved LAM outcomes exposed to Payroll (HRM-TCI-023). */
export async function TimeClockPayrollReferenceFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "payroll reference findings",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listPayrollReferenceRowsForOrg(organizationId),
    Section: TimeClockPayrollReferenceFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — validated punches exposed to LAM (HRM-TCI-021). */
export async function TimeClockAttendanceHandoffFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "attendance handoff findings",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listAttendanceHandoffRowsForOrg(organizationId),
    Section: TimeClockAttendanceHandoffFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — punch vs assigned shift (HRM-TCI-020). */
export async function TimeClockShiftMatchFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "shift match findings",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listShiftMatchRowsForOrg(organizationId),
    Section: TimeClockShiftMatchFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — LAM abnormal punch days (HRM-TCI-019). */
export async function TimeClockAbnormalPunchFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "abnormal punch findings",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listAbnormalPunchDayFindingsForOrg(organizationId),
    Section: TimeClockAbnormalPunchFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — LAM missing-punch days (HRM-TCI-017). */
export async function TimeClockMissingPunchFindingsStreamSection({
  orgSlug,
  organizationId,
  canRead,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
}) {
  return streamTimeClockTierBReadSection({
    label: "missing punch findings",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () => listMissingPunchDayFindingsForOrg(organizationId),
    Section: TimeClockMissingPunchFindingsSection,
    buildSectionProps: (base) => base,
  })
}

/** Tier B — exception inbox; streamed on the time-clock page. */
export async function TimeClockExceptionsStreamSection({
  orgSlug,
  organizationId,
  canRead,
  canDecideExceptions,
  canCorrectAttendance,
  workbenchFocus,
}: {
  readonly orgSlug?: string
  readonly organizationId: string
  readonly canRead: boolean
  readonly canDecideExceptions: boolean
  readonly canCorrectAttendance: boolean
  readonly workbenchFocus?: string | null
}) {
  return streamTimeClockTierBReadSection({
    label: "exceptions",
    organizationId,
    accessAllowed: canRead,
    orgSlug,
    query: () =>
      listTimeClockExceptionsForOrg(
        organizationId,
        SUBMITTED_EXCEPTIONS_FILTER
      ),
    Section: TimeClockExceptionsSection,
    buildSectionProps: (base) => ({
      ...base,
      rows: base.rows.filter((row) =>
        matchesGovernedWorkbenchFocus(
          workbenchFocus,
          row.employeeLegalName,
          row.employeeNumber,
          row.deviceName,
          row.eventType,
          row.detectionOutcome,
          row.reason
        )
      ),
      canDecide: base.parentAccessAllowed ? canDecideExceptions : false,
      canCorrectAttendance: base.parentAccessAllowed
        ? canCorrectAttendance
        : false,
      workbenchFocus,
    }),
  })
}
