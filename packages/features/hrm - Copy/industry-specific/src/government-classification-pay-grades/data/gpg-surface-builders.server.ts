import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
  resolveListSurfaceRowTrailingAction,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import { formatGpgGsSesRefs } from "./gpg-display.shared"
import { GPG_LIST_SURFACE_IDS } from "./gpg-surface-metadata.shared"
import type {
  GpgAdjustmentReferenceRow,
  GpgClassificationRow,
  GpgEmployeeAssignmentRow,
  GpgLocalityRuleRow,
  GpgPayBandRow,
  GpgPayGradeRow,
  GpgSalaryTableRowRow,
  GpgSalaryTableVersionRow,
  GpgStepEligibleRow,
  GpgAssignmentHistoryRow,
  GpgGradeMovementRow,
  GpgOrgOverviewSummary,
  GpgReclassificationRequestRow,
  GpgStepIncreaseEventRow,
  GpgStepIncreaseRuleRow,
  GpgStepIncreaseSummary,
} from "./gpg.types.shared"

const GPG_READ_PERMISSION = {
  module: "hrm" as const,
  object: "government_pay_grade" as const,
  function: "read" as const,
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

export function buildGpgClassificationsListSurfaceConfiguration(
  rows: readonly GpgClassificationRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colScheme: string
    colDimensions: string
    colState: string
    colEffective: string
    schemeLabel: (scheme: GpgClassificationRow["scheme"]) => string
    stateLabel: (state: GpgClassificationRow["state"]) => string
    formatDimensions: (row: GpgClassificationRow) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.classifications
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "scheme", header: copy.colScheme },
      { id: "dimensions", header: copy.colDimensions },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "effective", header: copy.colEffective },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        scheme: copy.schemeLabel(row.scheme),
        dimensions: copy.formatDimensions(row),
        state: copy.stateLabel(row.state),
        effective: row.effectiveDate,
      },
    })),
  })
}

export function buildGpgPayGradesListSurfaceConfiguration(
  rows: readonly GpgPayGradeRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colClassification: string
    colGsSes: string
    colState: string
    colEffective: string
    stateLabel: (state: GpgPayGradeRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.payGrades
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "classification", header: copy.colClassification },
      { id: "gsSes", header: copy.colGsSes },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "effective", header: copy.colEffective },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        classification: row.classificationLabel,
        gsSes: formatGpgGsSesRefs(row),
        state: copy.stateLabel(row.state),
        effective: row.effectiveDate,
      },
    })),
  })
}

export function buildGpgPayBandsListSurfaceConfiguration(
  rows: readonly GpgPayBandRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colPayGrade: string
    colMin: string
    colMax: string
    colCurrency: string
    colState: string
    stateLabel: (state: GpgPayBandRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.payBands
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "payGrade", header: copy.colPayGrade },
      { id: "min", header: copy.colMin },
      { id: "max", header: copy.colMax },
      { id: "currency", header: copy.colCurrency },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        payGrade: row.payGradeLabel,
        min: row.minRate ?? "—",
        max: row.maxRate ?? "—",
        currency: row.currencyCode ?? "—",
        state: copy.stateLabel(row.state),
      },
    })),
  })
}

export function buildGpgSalaryTableVersionsListSurfaceConfiguration(
  rows: readonly GpgSalaryTableVersionRow[],
  copy: {
    empty: string
    colCode: string
    colVersion: string
    colEffective: string
    colState: string
    colRows: string
    stateLabel: (state: GpgSalaryTableVersionRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.salaryTables
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "version", header: copy.colVersion },
      { id: "effective", header: copy.colEffective },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "rows", header: copy.colRows },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        version: String(row.versionNumber),
        effective: row.effectiveDate,
        state: copy.stateLabel(row.state),
        rows: String(row.rowCount),
      },
    })),
  })
}

export function buildGpgSalaryTableRowsListSurfaceConfiguration(
  rows: readonly GpgSalaryTableRowRow[],
  copy: {
    empty: string
    colPayGrade: string
    colStep: string
    colBase: string
    colMin: string
    colMax: string
    colCurrency: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.salaryTableRows
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "payGrade", header: copy.colPayGrade },
      { id: "step", header: copy.colStep },
      { id: "base", header: copy.colBase },
      { id: "min", header: copy.colMin },
      { id: "max", header: copy.colMax },
      { id: "currency", header: copy.colCurrency },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        payGrade: row.payGradeLabel,
        step: String(row.step),
        base: row.baseRate,
        min: row.minRate ?? "—",
        max: row.maxRate ?? "—",
        currency: row.currencyCode ?? "—",
      },
    })),
  })
}

export function buildGpgEmployeeAssignmentsListSurfaceConfiguration(
  rows: readonly GpgEmployeeAssignmentRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colClassification: string
    colPayGrade: string
    colStep: string
    colBase: string
    colAdjusted: string
    colEffective: string
    colState: string
    stateLabel: (state: GpgEmployeeAssignmentRow["state"]) => string
    formatMoney: (amount: string | null, currency: string | null) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.assignments
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "classification", header: copy.colClassification },
      { id: "payGrade", header: copy.colPayGrade },
      { id: "step", header: copy.colStep },
      { id: "base", header: copy.colBase },
      { id: "adjusted", header: copy.colAdjusted },
      { id: "effective", header: copy.colEffective },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        classification: row.classificationLabel,
        payGrade: row.payGradeLabel,
        step: String(row.step),
        base: copy.formatMoney(row.baseRate, row.currencyCode),
        adjusted: copy.formatMoney(row.adjustedPayReference, row.currencyCode),
        effective: row.effectiveFrom,
        state: copy.stateLabel(row.state),
      },
    })),
  })
}

export function buildGpgLocalityRulesListSurfaceConfiguration(
  rows: readonly GpgLocalityRuleRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colType: string
    colPercent: string
    colEffective: string
    colState: string
    typeLabel: (type: GpgLocalityRuleRow["localityType"]) => string
    stateLabel: (state: GpgLocalityRuleRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.localityRules
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "type", header: copy.colType },
      { id: "percent", header: copy.colPercent },
      { id: "effective", header: copy.colEffective },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        type: copy.typeLabel(row.localityType),
        percent: row.adjustmentPercent ?? "—",
        effective: row.effectiveDate,
        state: copy.stateLabel(row.state),
      },
    })),
  })
}

export function buildGpgAdjustmentReferencesListSurfaceConfiguration(
  rows: readonly GpgAdjustmentReferenceRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colType: string
    colLocality: string
    colAmount: string
    colPercent: string
    colEffective: string
    typeLabel: (type: GpgAdjustmentReferenceRow["adjustmentType"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.adjustmentReferences
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "type", header: copy.colType },
      { id: "locality", header: copy.colLocality },
      { id: "amount", header: copy.colAmount },
      { id: "percent", header: copy.colPercent },
      { id: "effective", header: copy.colEffective },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        type: copy.typeLabel(row.adjustmentType),
        locality: row.localityRuleLabel ?? "—",
        amount: row.amount ?? "—",
        percent: row.percent ?? "—",
        effective: row.effectiveDate,
      },
    })),
  })
}

export function buildGpgStepIncreaseKpiStatConfiguration(
  summary: GpgStepIncreaseSummary,
  copy: {
    eligible: string
    pending: string
    activeRules: string
  }
): StatCardConfigurationInput {
  return {
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    density: "compact",
    stats: [
      {
        label: copy.eligible,
        value: String(summary.eligibleCount),
        tone: summary.eligibleCount > 0 ? "attention" : "default",
        href: "#gpg-step-eligible-section",
        icon: "users",
        progress: {
          value: summary.eligibleCount,
          max: Math.max(
            summary.eligibleCount + summary.pendingApprovalCount,
            1
          ),
          label: "Eligible step queue",
        },
      },
      {
        label: copy.pending,
        value: String(summary.pendingApprovalCount),
        tone: summary.pendingApprovalCount > 0 ? "attention" : "default",
        href: "#gpg-step-increase-events-section",
        icon: "alert",
        comparison: {
          priorValue: String(summary.pendingApprovalCount),
          label: "pending approval",
          direction: summary.pendingApprovalCount > 0 ? "up" : "flat",
        },
      },
      {
        label: copy.activeRules,
        value: String(summary.activeRuleCount),
        tone: "default",
        href: "#gpg-step-increase-rules-section",
        icon: "shield",
      },
    ],
  }
}

export function buildGpgStepIncreaseRulesListSurfaceConfiguration(
  rows: readonly GpgStepIncreaseRuleRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colWaitingMonths: string
    colApproval: string
    colState: string
    approvalLabel: (requiresApproval: boolean) => string
    stateLabel: (state: GpgStepIncreaseRuleRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.stepIncreaseRules
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "waiting", header: copy.colWaitingMonths },
      { id: "approval", header: copy.colApproval },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        waiting: String(row.waitingPeriodMonths),
        approval: copy.approvalLabel(row.requiresApproval),
        state: copy.stateLabel(row.state),
      },
    })),
  })
}

export function buildGpgStepEligibleListSurfaceConfiguration(
  rows: readonly GpgStepEligibleRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colPayGrade: string
    colStep: string
    colNextStep: string
    colEligibility: string
    colRule: string
    colReady: string
    colPerformance: string
    formatDaysUntil: (days: number) => string
    formatPerformance: (row: GpgStepEligibleRow) => string
  },
  options?: { canManage?: boolean; queueLabel?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.stepEligible
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "assignmentId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "payGrade", header: copy.colPayGrade },
      { id: "step", header: copy.colStep },
      { id: "nextStep", header: copy.colNextStep },
      { id: "eligibility", header: copy.colEligibility },
      { id: "rule", header: copy.colRule },
      { id: "performance", header: copy.colPerformance },
      {
        id: "ready",
        header: copy.colReady,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.assignmentId,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        payGrade: row.payGradeLabel,
        step: String(row.step),
        nextStep: String(row.nextStep),
        eligibility: row.eligibilityDate,
        rule: row.ruleCode,
        performance: copy.formatPerformance(row),
        ready: copy.formatDaysUntil(row.daysUntilEligible),
      },
      rowTone: row.daysUntilEligible <= 0 ? "attention" : "default",
      decisionLedger: {
        reason: `${row.ruleCode} -> step ${row.nextStep}`,
        policyLabel: "Step increase rule",
        actorLabel: row.employeeLabel,
        occurredAt: row.eligibilityDate,
        riskTone: row.daysUntilEligible <= 0 ? "attention" : "default",
        nextActionLabel: copy.formatDaysUntil(row.daysUntilEligible),
      },
      trailingAction:
        options?.canManage === true
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
              descriptor: options.queueLabel
                ? {
                    id: "erp.hrm.government_pay_grade.step_increase.queue",
                    label: options.queueLabel,
                    intent: "default",
                  }
                : undefined,
            })
          : undefined,
    })),
  })
}

export function buildGpgStepIncreaseEventsListSurfaceConfiguration(
  rows: readonly GpgStepIncreaseEventRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colRule: string
    colPayGrade: string
    colFromStep: string
    colToStep: string
    colEligibility: string
    colState: string
    stateLabel: (state: GpgStepIncreaseEventRow["state"]) => string
  },
  options?: { canManage?: boolean; decideLabel?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.stepIncreaseEvents
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      toolbar: {
        search: {
          param: "gpgStepEventSearch",
          label: "Search step events",
          placeholder: "Search employee, grade, rule, or state",
        },
        filters: [
          {
            id: "gpg-step-event-state",
            label: copy.colState,
            param: "gpgStepEventState",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.state)))
                    .sort()
                    .map((value) => ({
                      label: copy.stateLabel(value),
                      value,
                    }))
                : [{ label: "All states", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "gpgStepEventSort",
          options: [
            {
              label: copy.colEligibility,
              value: "eligibility-asc",
              columnId: "eligibility",
              direction: "asc",
            },
            {
              label: copy.colState,
              value: "state-asc",
              columnId: "state",
              direction: "asc",
            },
          ],
        },
        savedView: {
          label: "Step event view",
          activeLabel: "Pending step events",
          href: "?gpgStepEventState=pending",
        },
      },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "rule", header: copy.colRule },
      { id: "payGrade", header: copy.colPayGrade },
      { id: "fromStep", header: copy.colFromStep },
      { id: "toStep", header: copy.colToStep },
      { id: "eligibility", header: copy.colEligibility },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        rule: row.ruleCode,
        payGrade: row.payGradeLabel,
        fromStep: String(row.fromStep),
        toStep: String(row.toStep),
        eligibility: row.eligibilityDate ?? "—",
        state: copy.stateLabel(row.state),
      },
      rowTone: row.state === "pending" ? "attention" : "default",
      decisionLedger: {
        reason: `${row.ruleCode} ${row.fromStep} -> ${row.toStep}`,
        policyLabel: "Step increase event",
        actorLabel: row.employeeLabel,
        occurredAt: row.eligibilityDate ?? row.id,
        riskTone: row.state === "pending" ? "attention" : "default",
        nextActionLabel: copy.stateLabel(row.state),
      },
      trailingAction:
        options?.canManage === true && row.state === "pending"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
              descriptor: options.decideLabel
                ? {
                    id: "erp.hrm.government_pay_grade.step_increase.decide",
                    label: options.decideLabel,
                    intent: "default",
                  }
                : undefined,
            })
          : undefined,
    })),
  })
}

export function buildGpgGradeMovementsListSurfaceConfiguration(
  rows: readonly GpgGradeMovementRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colType: string
    colFrom: string
    colTo: string
    colEffective: string
    colRetention: string
    colState: string
    typeLabel: (type: GpgGradeMovementRow["movementType"]) => string
    stateLabel: (state: GpgGradeMovementRow["state"]) => string
    formatFromTo: (gradeLabel: string | null, step: number | null) => string
  },
  options?: { canManage?: boolean; applyLabel?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.gradeMovements
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      toolbar: {
        search: {
          param: "gpgGradeMovementSearch",
          label: "Search grade movements",
          placeholder: "Search employee, movement, grade, or state",
        },
        filters: [
          {
            id: "gpg-grade-movement-state",
            label: copy.colState,
            param: "gpgGradeMovementState",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.state)))
                    .sort()
                    .map((value) => ({
                      label: copy.stateLabel(value),
                      value,
                    }))
                : [{ label: "All states", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "gpgGradeMovementSort",
          options: [
            {
              label: copy.colEffective,
              value: "effective-desc",
              columnId: "effective",
              direction: "desc",
            },
            {
              label: copy.colEmployee,
              value: "employee-asc",
              columnId: "employee",
              direction: "asc",
            },
          ],
        },
        savedView: {
          label: "Movement view",
          activeLabel: "Grade movement decisions",
          href: "?gpgGradeMovementState=draft",
        },
      },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "type", header: copy.colType },
      { id: "from", header: copy.colFrom },
      { id: "to", header: copy.colTo },
      { id: "effective", header: copy.colEffective },
      { id: "retention", header: copy.colRetention },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        type: copy.typeLabel(row.movementType),
        from: copy.formatFromTo(row.fromPayGradeLabel, row.fromStep),
        to: copy.formatFromTo(row.toPayGradeLabel, row.toStep),
        effective: row.effectiveDate,
        retention: row.retentionAmount ?? "—",
        state: copy.stateLabel(row.state),
      },
      rowTone: row.state === "draft" ? "attention" : "default",
      decisionLedger: {
        reason: copy.typeLabel(row.movementType),
        policyLabel: "Grade movement policy",
        actorLabel: row.employeeLabel,
        occurredAt: row.effectiveDate,
        riskTone: row.state === "draft" ? "attention" : "default",
        nextActionLabel: copy.stateLabel(row.state),
      },
      trailingAction:
        options?.canManage === true && row.state === "draft"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
              descriptor: options.applyLabel
                ? {
                    id: "erp.hrm.government_pay_grade.movement.apply",
                    label: options.applyLabel,
                    intent: "default",
                  }
                : undefined,
            })
          : undefined,
    })),
  })
}

export function buildGpgOrgOverviewStatConfiguration(
  summary: GpgOrgOverviewSummary,
  copy: {
    activeAssignments: string
    distinctPayGrades: string
    activeLocalityRules: string
    pendingStepEvents: string
    appliedMovements: string
  }
): StatCardConfigurationInput {
  return {
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    density: "compact",
    stats: [
      {
        label: copy.activeAssignments,
        value: String(summary.activeAssignments),
        tone: "default",
        href: "#gpg-assignments-section",
        icon: "users",
      },
      {
        label: copy.distinctPayGrades,
        value: String(summary.distinctPayGrades),
        tone: "default",
        href: "#gpg-pay-grades-section",
        icon: "shield",
      },
      {
        label: copy.activeLocalityRules,
        value: String(summary.activeLocalityRules),
        tone: "default",
        href: "#gpg-locality-rules-section",
        icon: "activity",
      },
      {
        label: copy.pendingStepEvents,
        value: String(summary.pendingStepEvents),
        tone:
          summary.pendingStepEvents > 0
            ? ("attention" as const)
            : ("default" as const),
        href: "#gpg-step-increase-events-section",
        icon: "alert",
        comparison: {
          priorValue: String(summary.pendingStepEvents),
          label: "pending step events",
          direction: summary.pendingStepEvents > 0 ? "up" : "flat",
        },
      },
      {
        label: copy.appliedMovements,
        value: String(summary.appliedMovements),
        tone: "default",
        href: "#gpg-grade-movements-section",
        icon: "calendar",
        progress: {
          value: summary.appliedMovements,
          max: Math.max(
            summary.appliedMovements + summary.pendingStepEvents,
            1
          ),
          label: "Applied movement share",
        },
      },
    ],
  }
}

export function buildGpgAssignmentHistoryListSurfaceConfiguration(
  rows: readonly GpgAssignmentHistoryRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colAsOf: string
    colClassification: string
    colPayGrade: string
    colStep: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.assignmentHistory
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "asOf", header: copy.colAsOf },
      { id: "classification", header: copy.colClassification },
      { id: "payGrade", header: copy.colPayGrade },
      { id: "step", header: copy.colStep },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...(row.employeeId
        ? hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee")
        : {}),
      cells: {
        employee: row.employeeLabel,
        asOf: row.asOfDate,
        classification: row.classificationLabel,
        payGrade: row.payGradeLabel,
        step: String(row.step),
      },
    })),
  })
}

export function buildGpgReclassificationRequestsListSurfaceConfiguration(
  rows: readonly GpgReclassificationRequestRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colFrom: string
    colTo: string
    colState: string
    colReason: string
    stateLabel: (state: GpgReclassificationRequestRow["state"]) => string
  },
  options?: {
    canManage?: boolean
    approveLabel?: string
    rejectLabel?: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = GPG_LIST_SURFACE_IDS.reclassificationRequests
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: GPG_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "from", header: copy.colFrom },
      { id: "to", header: copy.colTo },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "reason", header: copy.colReason },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        from: row.fromClassificationLabel ?? "—",
        to: row.toClassificationLabel ?? "—",
        state: copy.stateLabel(row.state),
        reason: row.reason ?? "—",
      },
      trailingAction:
        options?.canManage === true && row.state === "submitted"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
              descriptor: options.approveLabel
                ? {
                    id: "erp.hrm.government_pay_grade.reclassification.approve",
                    label: options.approveLabel,
                    intent: "default",
                  }
                : undefined,
            })
          : undefined,
    })),
  })
}
