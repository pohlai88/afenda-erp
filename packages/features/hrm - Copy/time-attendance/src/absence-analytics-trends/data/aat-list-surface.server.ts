import "server-only"

import {
  buildGovernedListSurface,
  governedWorkbenchFocusPresentationPatch,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import { formatAbsenceRatePercent } from "./aat-analytics-engine.shared"
import type { AatRiskTier } from "../schemas/aat.schema"
import type {
  AatDepartmentRankingRow,
  AatExceptionTrendRow,
  AatHighRiskEmployeeRow,
  AatLeaveTypeBreakdownRow,
} from "./aat-analytics.queries.server"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import { AAT_LIST_SURFACE_IDS } from "./aat-surface-metadata.shared"

const AAT_READ_PERMISSION = {
  module: "hrm" as const,
  object: "absence_analytics" as const,
  function: "read" as const,
}

function riskToneForAatTier(
  tier: AatRiskTier
): "default" | "attention" | "critical" {
  if (tier === "critical") return "critical"
  if (tier === "high_risk") return "attention"
  return "default"
}

type DepartmentRankingCopy = {
  empty: string
  colDepartment: string
  colEmployees: string
  colLostDays: string
  colRate: string
  colRisk: string
  riskLabelFor: (tier: AatRiskTier) => string
}

export function buildAatDepartmentRankingListSurface(
  rows: readonly AatDepartmentRankingRow[],
  copy: DepartmentRankingCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: AAT_READ_PERMISSION,
    presentationProfile: "erp-operational-table",
    surface: {
      header: { title: AAT_LIST_SURFACE_IDS.departmentRanking },
      columnsId: AAT_LIST_SURFACE_IDS.departmentRanking,
      rowKey: "departmentId",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "department", header: copy.colDepartment },
      { id: "employees", header: copy.colEmployees, align: "end" },
      { id: "lostDays", header: copy.colLostDays, align: "end" },
      { id: "rate", header: copy.colRate, align: "end" },
      { id: "risk", header: copy.colRisk, align: "center" },
    ],
    rows: rows.map((row) => ({
      id: row.departmentId ?? "unassigned",
      rowTone: riskToneForAatTier(row.riskTier),
      cells: {
        department: row.departmentName,
        employees: String(row.employeeCount),
        lostDays: row.lostWorkdays.toFixed(1),
        rate: formatAbsenceRatePercent(row.absenceRate),
        risk: copy.riskLabelFor(row.riskTier),
      },
    })),
  })
}

type HighRiskCopy = {
  empty: string
  colEmployee: string
  colDepartment: string
  colFrequency: string
  colLostDays: string
  colRate: string
  colRisk: string
  colPatterns: string
  colReason: string
  riskLabelFor: (tier: AatRiskTier) => string
  exportReportLabel: string
}

function aatHighRiskExportPresentation(exportLabel: string) {
  return {
    tableDensity: "comfortable" as const,
    toolbar: {
      export: {
        actionId: "aat.export.analytics.csv",
        label: exportLabel,
        formats: ["csv"] as ["csv"],
        triggerElementId: "aat-export-report-trigger",
      },
    },
  }
}

function aatHighRiskAnalyticalPresentation(
  rows: readonly AatHighRiskEmployeeRow[],
  exportLabel: string
) {
  const totalLostDays = rows.reduce((sum, row) => sum + row.lostWorkdays, 0)
  const averageAbsenceRate =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + row.absenceRate, 0) / rows.length
      : 0

  return {
    ...aatHighRiskExportPresentation(exportLabel),
    primaryColumnId: "employee",
    ...(rows.length > 0
      ? {
          grouping: {
            groups: [
              {
                id: "aat-high-risk-employees",
                label: "High risk employees",
                rowIds: rows.map((row) => row.employeeId),
              },
            ],
          },
          summary: {
            rows: [
              {
                id: "aat-high-risk-summary",
                label: "Total",
                cells: {
                  employee: `${rows.length} employees`,
                  lostDays: totalLostDays.toFixed(1),
                  rate: formatAbsenceRatePercent(averageAbsenceRate),
                  risk: `${rows.filter((row) => row.riskTier === "critical").length} critical`,
                },
              },
            ],
          },
        }
      : {}),
  }
}

export function buildAatHighRiskEmployeesListSurface(
  rows: readonly AatHighRiskEmployeeRow[],
  orgSlug: string,
  copy: HighRiskCopy,
  options?: {
    workbenchFocusSearch?: {
      label: string
      placeholder?: string
      value?: string | null
    }
  }
): ListSurfaceRendererConfigurationInput {
  const exportPresentation = aatHighRiskAnalyticalPresentation(
    rows,
    copy.exportReportLabel
  )
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: AAT_READ_PERMISSION,
    presentationProfile: "erp-analytical-table",
    presentation: options?.workbenchFocusSearch
      ? governedWorkbenchFocusPresentationPatch(
          options.workbenchFocusSearch,
          exportPresentation
        )
      : exportPresentation,
    surface: {
      header: { title: AAT_LIST_SURFACE_IDS.highRiskEmployees },
      columnsId: AAT_LIST_SURFACE_IDS.highRiskEmployees,
      rowKey: "employeeId",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
      },
      { id: "department", header: copy.colDepartment, priority: "secondary" },
      { id: "frequency", header: copy.colFrequency, align: "end" },
      {
        id: "lostDays",
        header: copy.colLostDays,
        align: "end",
        summary: "sum",
      },
      { id: "rate", header: copy.colRate, align: "end", summary: "average" },
      { id: "risk", header: copy.colRisk, align: "center" },
      { id: "patterns", header: copy.colPatterns, wrap: true },
      { id: "reason", header: copy.colReason, wrap: true, clip: true },
    ],
    rows: rows.map((row) => ({
      id: row.employeeId,
      rowTone: riskToneForAatTier(row.riskTier),
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      decisionLedger: {
        reason: row.recentAbsenceReason,
        policyLabel: "Absence analytics risk rules",
        actorLabel: "AAT analytics engine",
        riskTone: riskToneForAatTier(row.riskTier),
        nextActionLabel: "Review employee absence pattern",
      },
      cells: {
        employee: row.employeeLabel,
        department: row.departmentName,
        frequency: String(row.absenceFrequency),
        lostDays: row.lostWorkdays.toFixed(1),
        rate: formatAbsenceRatePercent(row.absenceRate),
        risk: copy.riskLabelFor(row.riskTier),
        patterns: row.patternFlags.join(", ") || "—",
        reason: row.recentAbsenceReason,
      },
    })),
  })
}

type LeaveTypeBreakdownCopy = {
  empty: string
  colLeaveType: string
  colLostDays: string
  colFrequency: string
  labelFor: (code: string) => string
}

export function buildAatLeaveTypeBreakdownListSurface(
  rows: readonly AatLeaveTypeBreakdownRow[],
  copy: LeaveTypeBreakdownCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: AAT_READ_PERMISSION,
    presentationProfile: "erp-operational-table",
    surface: {
      header: { title: AAT_LIST_SURFACE_IDS.leaveTypeBreakdown },
      columnsId: AAT_LIST_SURFACE_IDS.leaveTypeBreakdown,
      rowKey: "leaveTypeCode",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "leaveType", header: copy.colLeaveType },
      { id: "lostDays", header: copy.colLostDays, align: "end" },
      { id: "frequency", header: copy.colFrequency, align: "end" },
    ],
    rows: rows.map((row) => ({
      id: row.leaveTypeCode,
      cells: {
        leaveType: copy.labelFor(row.leaveTypeCode),
        lostDays: row.lostWorkdays.toFixed(1),
        frequency: String(row.absenceFrequency),
      },
    })),
  })
}

type ExceptionTrendCopy = {
  empty: string
  colKind: string
  colCount: string
  labelFor: (kind: string) => string
}

export function buildAatExceptionTrendsListSurface(
  rows: readonly AatExceptionTrendRow[],
  copy: ExceptionTrendCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: AAT_READ_PERMISSION,
    presentationProfile: "erp-operational-table",
    surface: {
      header: { title: AAT_LIST_SURFACE_IDS.exceptionTrends },
      columnsId: AAT_LIST_SURFACE_IDS.exceptionTrends,
      rowKey: "exceptionKind",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "kind", header: copy.colKind },
      { id: "count", header: copy.colCount, align: "end" },
    ],
    rows: rows.map((row) => ({
      id: row.exceptionKind,
      cells: {
        kind: copy.labelFor(row.exceptionKind),
        count: String(row.count),
      },
    })),
  })
}
