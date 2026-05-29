import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import { RWS_LIST_SURFACE_IDS } from "./rws-surface-metadata.shared"
import type { RwsAttendanceReconcileRow } from "./rws-integration.server"
import type { RwsPayrollScheduleReferenceRow } from "./rws-integration.server"
import type {
  RwsCoverageGapRow,
  RwsLaborBudgetSnapshotRow,
  RwsLaborDemandReferenceRow,
  RwsOpenShiftOfferRow,
  RwsOrgOverviewSummary,
  RwsSchedulePeriodRow,
  RwsStoreRow,
} from "./rws.types.shared"

const RWS_READ_PERMISSION = {
  module: "hrm" as const,
  object: "retail_schedule" as const,
  function: "read" as const,
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

export function buildRwsOrgOverviewStatConfiguration(
  summary: RwsOrgOverviewSummary,
  copy: {
    activeStores: string
    draftPeriods: string
    publishedPeriods: string
    openShiftOffers: string
    understaffedSlots: string
  }
): StatCardConfigurationInput {
  return {
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    density: "compact",
    stats: [
      {
        label: copy.activeStores,
        value: String(summary.activeStores),
        tone: "default",
        href: "#rws-stores-section",
        icon: "activity",
      },
      {
        label: copy.draftPeriods,
        value: String(summary.draftPeriods),
        tone: "default",
        href: "#rws-periods-section",
        icon: "calendar",
      },
      {
        label: copy.publishedPeriods,
        value: String(summary.publishedPeriods),
        tone: "default",
        href: "#rws-periods-section",
        icon: "shield",
      },
      {
        label: copy.openShiftOffers,
        value: String(summary.openShiftOffers),
        tone: "default",
        href: "#rws-open-shifts-section",
        icon: "users",
      },
      {
        label: copy.understaffedSlots,
        value: String(summary.understaffedSlots),
        tone: summary.understaffedSlots > 0 ? "attention" : "default",
        href: "#rws-coverage-gaps-section",
        icon: "alert",
      },
    ],
  }
}

export function buildRwsStoresListSurfaceConfiguration(
  rows: readonly RwsStoreRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colBranch: string
    colActive: string
    activeLabel: (active: boolean) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.stores
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "branch", header: copy.colBranch },
      {
        id: "active",
        header: copy.colActive,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        branch: row.branchRef ?? "—",
        active: copy.activeLabel(row.active),
      },
    })),
  })
}

export function buildRwsPeriodsListSurfaceConfiguration(
  rows: readonly RwsSchedulePeriodRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colStore: string
    colKind: string
    colState: string
    colRange: string
    stateLabel: (state: RwsSchedulePeriodRow["state"]) => string
    kindLabel: (kind: RwsSchedulePeriodRow["periodKind"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.periods
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "store", header: copy.colStore },
      { id: "kind", header: copy.colKind },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "range", header: copy.colRange },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        store: row.storeLabel,
        kind: copy.kindLabel(row.periodKind),
        state: copy.stateLabel(row.state),
        range: `${row.periodStartDate} → ${row.periodEndDate}`,
      },
    })),
  })
}

export function buildRwsCoverageGapsListSurfaceConfiguration(
  rows: readonly RwsCoverageGapRow[],
  copy: {
    empty: string
    colDate: string
    colHour: string
    colRole: string
    colRequired: string
    colScheduled: string
    colStatus: string
    statusLabel: (status: RwsCoverageGapRow["status"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.coverageGaps
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "coverageSlotId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "date", header: copy.colDate },
      { id: "hour", header: copy.colHour },
      { id: "role", header: copy.colRole },
      { id: "required", header: copy.colRequired },
      { id: "scheduled", header: copy.colScheduled },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.coverageSlotId,
      cells: {
        date: row.slotDate,
        hour: String(row.hourOfDay),
        role: row.retailRole,
        required: String(row.requiredHeadcount),
        scheduled: String(row.scheduledHeadcount),
        status: copy.statusLabel(row.status),
      },
    })),
  })
}

function isRwsOpenShiftClaimable(
  status: RwsOpenShiftOfferRow["status"]
): boolean {
  return status === "open" || status === "pending_approval"
}

export function buildRwsOpenShiftsListSurfaceConfiguration(
  rows: readonly RwsOpenShiftOfferRow[],
  copy: {
    empty: string
    colStore: string
    colDate: string
    colRole: string
    colClaimMode: string
    colStatus: string
    statusLabel: (status: RwsOpenShiftOfferRow["status"]) => string
    claimActionLabel: string
    canClaim: boolean
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.openShifts
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "store", header: copy.colStore },
      { id: "date", header: copy.colDate },
      { id: "role", header: copy.colRole },
      { id: "claimMode", header: copy.colClaimMode },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        store: row.storeLabel,
        date: row.slotDate,
        role: row.retailRole,
        claimMode: row.claimMode,
        status: copy.statusLabel(row.status),
      },
      trailingAction:
        copy.canClaim && isRwsOpenShiftClaimable(row.status)
          ? resolveListSurfaceRowTrailingAction({
              allowed: true,
              descriptor: {
                id: `rws-open-shift-claim:${row.id}`,
                label: copy.claimActionLabel,
                intent: "default",
              },
            })
          : undefined,
    })),
  })
}

export function buildRwsAttendanceReconcileListSurfaceConfiguration(
  rows: readonly RwsAttendanceReconcileRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colDate: string
    colScheduled: string
    colActual: string
    colVariance: string
    formatMinutes: (minutes: number | null) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.attendanceCompare
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "rowKey",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "date", header: copy.colDate },
      { id: "scheduled", header: copy.colScheduled },
      { id: "actual", header: copy.colActual },
      { id: "variance", header: copy.colVariance },
    ],
    rows: rows.map((row) => ({
      id: `${row.employeeId}:${row.attendanceDate}`,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeNumber
          ? `${row.employeeFullName} · ${row.employeeNumber}`
          : row.employeeFullName,
        date: row.attendanceDate,
        scheduled: copy.formatMinutes(row.scheduledMinutes),
        actual: copy.formatMinutes(row.actualMinutes),
        variance: copy.formatMinutes(row.varianceMinutes),
      },
    })),
  })
}

export function buildRwsPayrollReferencesListSurfaceConfiguration(
  rows: readonly RwsPayrollScheduleReferenceRow[],
  copy: {
    empty: string
    colEmployee: string
    colDate: string
    colShift: string
    colMinutes: string
    colHoliday: string
    formatMinutes: (minutes: number) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.payrollReferences
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "rowKey",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "date", header: copy.colDate },
      { id: "shift", header: copy.colShift },
      { id: "minutes", header: copy.colMinutes },
      { id: "holiday", header: copy.colHoliday },
    ],
    rows: rows.map((row) => ({
      id: `${row.employeeId}:${row.attendanceDate}:${row.templateCode}`,
      cells: {
        employee: row.employeeId,
        date: row.attendanceDate,
        shift: `${row.templateCode} · ${row.templateName}`,
        minutes: copy.formatMinutes(row.scheduledMinutes),
        holiday: row.holidayBehavior,
      },
    })),
  })
}

export function buildRwsDemandReferencesListSurfaceConfiguration(
  rows: readonly RwsLaborDemandReferenceRow[],
  copy: {
    empty: string
    colStore: string
    colKind: string
    colExternal: string
    colNotes: string
    kindLabel: (kind: RwsLaborDemandReferenceRow["referenceKind"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.demandReferences
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "store", header: copy.colStore },
      { id: "kind", header: copy.colKind },
      { id: "external", header: copy.colExternal },
      { id: "notes", header: copy.colNotes },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        store: row.storeLabel,
        kind: copy.kindLabel(row.referenceKind),
        external: row.externalRef ?? "—",
        notes: row.notes ?? "—",
      },
    })),
  })
}

export function buildRwsBudgetSnapshotsListSurfaceConfiguration(
  rows: readonly RwsLaborBudgetSnapshotRow[],
  copy: {
    empty: string
    colStore: string
    colAmount: string
    colCurrency: string
    colNotes: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = RWS_LIST_SURFACE_IDS.budgetSnapshots
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: RWS_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "store", header: copy.colStore },
      { id: "amount", header: copy.colAmount },
      { id: "currency", header: copy.colCurrency },
      { id: "notes", header: copy.colNotes },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        store: row.storeLabel,
        amount: row.approvedBudgetAmount,
        currency: row.currencyCode ?? "—",
        notes: row.notes ?? "—",
      },
    })),
  })
}
