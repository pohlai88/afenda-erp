import "server-only"

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedListSurface,
  governedWorkbenchFocusPresentationPatch,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import {
  hrmEmployeeListRowLinkFields,
  hrmGovernedListRowLinkFields,
  organizationHrmComplianceDetailPath,
} from "@afenda/feature-hrm-core/shared"

import type { ComplianceOverviewRow } from "./compliance-overview.shared"
import type { ComplianceExceptionListRow } from "./compliance-exception.queries.server"
import type { ComplianceFilingListRow } from "./compliance-filing.queries.server"
import type { ComplianceEvidenceRow } from "./compliance.queries.server"
import type { ComplianceHealthSampleRow } from "./compliance-operational-health.queries.server"
import type { ComplianceHealthAttentionBucket } from "./compliance-operational-health.shared"
import type { ComplianceObligationRow } from "./compliance-obligation.queries.server"

const COMPLIANCE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "compliance" as const,
  function: "read" as const,
}

function resolveComplianceExceptionRowTone(
  severity: string,
  status: string
): "default" | "attention" | "critical" {
  const normalizedSeverity = severity.toLowerCase()
  if (
    normalizedSeverity === "critical" ||
    normalizedSeverity === "high" ||
    status === "escalated"
  ) {
    return "critical"
  }
  if (
    normalizedSeverity === "medium" ||
    status === "open" ||
    status === "in_progress"
  ) {
    return "attention"
  }
  return "default"
}

function resolveComplianceFilingRowTone(
  derivedStatus: string
): "default" | "attention" | "critical" {
  if (derivedStatus === "overdue") return "critical"
  if (
    derivedStatus === "due_soon" ||
    derivedStatus === "failing" ||
    derivedStatus === "needs_attention"
  ) {
    return "attention"
  }
  return "default"
}

function resolveComplianceOverviewRowTone(
  overallStatus: ComplianceOverviewRow["overallStatus"]
): "default" | "attention" | "critical" {
  if (overallStatus === "non_compliant" || overallStatus === "expired") {
    return "critical"
  }
  if (
    overallStatus === "at_risk" ||
    overallStatus === "overdue" ||
    overallStatus === "pending"
  ) {
    return "attention"
  }
  return "default"
}

export type ComplianceListTrailingContext = {
  showActionsColumn: boolean
  canUpdate: boolean
}

type ComplianceExceptionsListCopy = {
  empty: string
  colTitle: string
  colArea: string
  colSeverity: string
  colStatus: string
  colSubject: string
}

export function buildComplianceExceptionsListSurfaceConfiguration(
  rows: readonly ComplianceExceptionListRow[],
  orgSlug: string,
  copy: ComplianceExceptionsListCopy,
  context?: ComplianceListTrailingContext,
  options?: {
    workbenchFocusSearch?: {
      label: string
      placeholder?: string
      value?: string | null
    }
  }
): ListSurfaceRendererConfigurationInput {
  const analyticalPresentation = {
    primaryColumnId: "title" as const,
    ...(rows.length > 0
      ? {
          grouping: {
            groups: [
              {
                id: "compliance-open-exceptions",
                label: "Open compliance exceptions",
                rowIds: rows.map((row) => row.id),
              },
            ],
          },
          summary: {
            rows: [
              {
                id: "compliance-exceptions-summary",
                label: "Total",
                cells: {
                  title: `${rows.length} exceptions`,
                  status: `${rows.filter((row) => row.status === "open").length} open`,
                  severity: `${rows.filter((row) => row.severity.toLowerCase() === "critical" || row.severity.toLowerCase() === "high").length} high risk`,
                },
              },
            ],
          },
        }
      : {}),
  }

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    presentation: options?.workbenchFocusSearch
      ? governedWorkbenchFocusPresentationPatch(
          options.workbenchFocusSearch,
          analyticalPresentation
        )
      : analyticalPresentation,
    surface: {
      header: { title: "hrm-compliance-exceptions" },
      columnsId: "hrm-compliance-exceptions",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 260,
        cellKind: { kind: "link" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "area",
        header: copy.colArea,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "severity",
        header: copy.colSeverity,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "subject", header: copy.colSubject },
    ],
    rows: rows.map((row) => {
      const evidenceId =
        row.correctiveActionEvidenceDocumentId ?? row.resolvedEvidenceDocumentId
      const rowTone = resolveComplianceExceptionRowTone(
        row.severity,
        row.status
      )
      return {
        id: row.id,
        rowTone,
        ...hrmGovernedListRowLinkFields({
          orgSlug,
          linkColumnId: "title",
          employeeId: row.employeeId,
          evidenceId,
        }),
        cells: {
          title: row.title,
          status: row.status,
          area: row.complianceArea,
          severity: row.severity,
          subject: row.legalName ?? copy.colSubject,
        },
        decisionLedger: {
          reason:
            row.correctiveActionDescription ??
            row.correctiveActionProgressNote ??
            row.resolutionNote ??
            row.waiverReason ??
            row.title,
          ...(evidenceId
            ? {
                evidenceHref: organizationHrmComplianceDetailPath(
                  orgSlug,
                  evidenceId
                ),
              }
            : {}),
          policyLabel: row.complianceArea,
          actorLabel:
            row.correctiveActionOwnerUserId ??
            row.legalName ??
            "Compliance owner",
          occurredAt: (
            row.correctiveActionUpdatedAt ??
            row.waivedAt ??
            row.createdAt
          ).toISOString(),
          riskTone: rowTone === "critical" ? "critical" : rowTone,
          nextActionLabel: row.status,
        },
        trailingAction:
          context?.showActionsColumn && context.canUpdate
            ? resolveListSurfaceRowTrailingAction({
                visible: true,
                allowed: true,
              })
            : undefined,
      }
    }),
  })
}

type ComplianceFilingsListCopy = {
  empty: string
  colTitle: string
  colCategory: string
  colStatus: string
  colDue: string
  colScope: string
  formatDueDate: (date: Date) => string
}

export function buildComplianceFilingsListSurfaceConfiguration(
  rows: readonly ComplianceFilingListRow[],
  orgSlug: string,
  copy: ComplianceFilingsListCopy,
  context?: ComplianceListTrailingContext
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "title",
      ...(rows.length > 0
        ? {
            grouping: {
              groups: [
                {
                  id: "compliance-filing-deadlines",
                  label: "Filing deadlines",
                  rowIds: rows.map((row) => row.id),
                },
              ],
            },
            summary: {
              rows: [
                {
                  id: "compliance-filings-summary",
                  label: "Total",
                  cells: {
                    title: `${rows.length} filings`,
                    status: `${rows.filter((row) => row.derivedStatus === "overdue").length} overdue`,
                    due: `${rows.filter((row) => row.derivedStatus === "due_soon").length} due soon`,
                  },
                },
              ],
            },
          }
        : {}),
    },
    surface: {
      header: { title: "hrm-compliance-filings" },
      columnsId: "hrm-compliance-filings",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 260,
        cellKind: { kind: "link" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "category",
        header: copy.colCategory,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "due",
        header: copy.colDue,
        cellKind: { kind: "date" },
      },
      { id: "scope", header: copy.colScope },
    ],
    rows: rows.map((row) => {
      const rowTone = resolveComplianceFilingRowTone(row.derivedStatus)
      return {
        id: row.id,
        rowTone,
        ...hrmGovernedListRowLinkFields({
          orgSlug,
          linkColumnId: "title",
          evidenceId: row.evidenceDocumentId,
        }),
        cells: {
          title: row.title,
          status: row.derivedStatus,
          category: row.filingCategory,
          due: copy.formatDueDate(row.dueDate),
          scope: [row.countryCode ?? "Global", row.legalEntityCode ?? null]
            .filter(Boolean)
            .join(" · "),
        },
        decisionLedger: {
          reason: row.coveragePeriod ?? row.referenceCode ?? row.title,
          ...(row.evidenceDocumentId
            ? {
                evidenceHref: organizationHrmComplianceDetailPath(
                  orgSlug,
                  row.evidenceDocumentId
                ),
              }
            : {}),
          policyLabel: row.filingCategory,
          actorLabel:
            row.confirmationReference ??
            row.filingAuthority ??
            "Compliance filing owner",
          occurredAt: (
            row.confirmedAt ??
            row.submittedAt ??
            row.waivedAt ??
            row.createdAt
          ).toISOString(),
          riskTone: rowTone === "critical" ? "critical" : rowTone,
          nextActionLabel: row.derivedStatus,
        },
        trailingAction:
          context?.showActionsColumn && context.canUpdate
            ? resolveListSurfaceRowTrailingAction({
                visible: true,
                allowed: true,
              })
            : undefined,
      }
    }),
  })
}

type ComplianceEmployeeStatusListCopy = {
  empty: string
  groupLabel: string
  summaryLabel: string
  summaryEmployeeCount: (count: number) => string
  summaryAttentionCount: (count: number) => string
  summaryOpenCount: (count: number) => string
  colEmployee: string
  colStatus: string
  colOpen: string
  colScope: string
  colSignals: string
}

type ComplianceEvidenceRegisterListCopy = {
  empty: string
  colPack: string
  colState: string
  colVersion: string
  colGenerated: string
  packLabelFor: (packType: string) => string
  formatGenerated: (value: Date) => string
}

export function buildComplianceEvidenceRegisterListSurfaceConfiguration(
  rows: readonly ComplianceEvidenceRow[],
  copy: ComplianceEvidenceRegisterListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "pack",
      ...(rows.length > 0
        ? {
            grouping: {
              groups: [
                {
                  id: "compliance-evidence-register",
                  label: "Evidence register",
                  rowIds: rows.map((row) => row.id),
                },
              ],
            },
            summary: {
              rows: [
                {
                  id: "compliance-evidence-summary",
                  label: "Total",
                  cells: {
                    pack: `${rows.length} packs`,
                    state: `${rows.filter((row) => row.submissionState === "accepted" || row.submissionState === "submitted").length} submitted`,
                    version: `${new Set(rows.map((row) => row.rulePackVersion)).size} rule versions`,
                  },
                },
              ],
            },
          }
        : {}),
    },
    surface: {
      header: { title: "hrm-compliance-evidence-register" },
      columnsId: "hrm-compliance-evidence-register",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "pack",
        header: copy.colPack,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "version", header: copy.colVersion, priority: "secondary" },
      {
        id: "generated",
        header: copy.colGenerated,
        cellKind: { kind: "date" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        pack: copy.packLabelFor(row.packType),
        state: row.submissionState,
        version: row.rulePackVersion,
        generated: copy.formatGenerated(row.generatedAt),
      },
      decisionLedger: {
        reason: `Evidence pack is ${row.submissionState}`,
        policyLabel: row.rulePackVersion,
        actorLabel: "Compliance evidence builder",
        occurredAt: row.generatedAt.toISOString(),
        riskTone:
          row.submissionState === "accepted" ||
          row.submissionState === "submitted"
            ? "positive"
            : "attention",
        nextActionLabel: "Review evidence pack",
      },
      trailingAction: resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: true,
      }),
    })),
  })
}

type ComplianceHealthSamplesListCopy = {
  empty: string
  colPack: string
  colPeriod: string
  colAge: string
  colTier: string
  packLabelFor: (packType: string) => string
  formatPeriod: (row: ComplianceHealthSampleRow) => string
  ageLabelFor: (ageDays: number) => string
  tierLabelFor: (
    bucket: ComplianceHealthAttentionBucket,
    row: ComplianceHealthSampleRow
  ) => string
}

function complianceHealthSampleRowTone(
  bucket: ComplianceHealthAttentionBucket
): "attention" | "default" {
  return bucket.startsWith("needs_attention_") ? "attention" : "default"
}

export function buildComplianceHealthSamplesListSurfaceConfiguration(
  bucket: ComplianceHealthAttentionBucket,
  rows: readonly ComplianceHealthSampleRow[],
  orgSlug: string,
  copy: ComplianceHealthSamplesListCopy
): ListSurfaceRendererConfigurationInput {
  const rowTone = complianceHealthSampleRowTone(bucket)
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    surface: {
      header: { title: `hrm-compliance-health-${bucket}` },
      columnsId: `hrm-compliance-health-${bucket}`,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "pack", header: copy.colPack },
      { id: "period", header: copy.colPeriod },
      { id: "age", header: copy.colAge },
      {
        id: "tier",
        header: copy.colTier,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      rowHref: organizationHrmComplianceDetailPath(orgSlug, row.id),
      rowTone,
      cells: {
        pack: copy.packLabelFor(row.packType),
        period: copy.formatPeriod(row),
        age: copy.ageLabelFor(row.ageDays),
        tier: copy.tierLabelFor(bucket, row),
      },
      trailingAction: resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: rows.length > 0,
      }),
    })),
  })
}

type ComplianceObligationsListCopy = {
  empty: string
  colCode: string
  colTitle: string
  colKind: string
  colArea: string
  colStatus: string
  colScope: string
  formatScope: (row: ComplianceObligationRow) => string
}

export function buildComplianceObligationsListSurfaceConfiguration(
  rows: readonly ComplianceObligationRow[],
  copy: ComplianceObligationsListCopy,
  context?: ComplianceListTrailingContext
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "title",
      ...(rows.length > 0
        ? {
            grouping: {
              groups: [
                {
                  id: "compliance-obligations-register",
                  label: "Obligation register",
                  rowIds: rows.map((row) => row.id),
                },
              ],
            },
            summary: {
              rows: [
                {
                  id: "compliance-obligations-summary",
                  label: "Total",
                  cells: {
                    code: `${rows.length} obligations`,
                    status: `${rows.filter((row) => row.status === "active").length} active`,
                    scope: `${rows.filter((row) => row.countryCode || row.legalEntityCode || row.workLocationCode).length} scoped`,
                  },
                },
              ],
            },
          }
        : {}),
    },
    surface: {
      header: { title: "hrm-compliance-obligations" },
      columnsId: "hrm-compliance-obligations",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "title", header: copy.colTitle },
      {
        id: "kind",
        header: copy.colKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "area",
        header: copy.colArea,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "scope", header: copy.colScope },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        title: row.title,
        kind: row.requirementKind,
        area: row.complianceArea,
        status: row.status,
        scope: copy.formatScope(row),
      },
      trailingAction:
        context?.showActionsColumn && context.canUpdate
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: row.status !== "archived",
            })
          : undefined,
    })),
  })
}

export function buildComplianceEmployeeStatusListSurfaceConfiguration(
  rows: readonly ComplianceOverviewRow[],
  orgSlug: string,
  copy: ComplianceEmployeeStatusListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      ...(rows.length > 0
        ? {
            grouping: {
              groups: [
                {
                  id: "compliance-employee-status-register",
                  label: copy.groupLabel,
                  rowIds: rows.map((row) => row.employeeId),
                },
              ],
            },
            summary: {
              rows: [
                {
                  id: "compliance-employee-status-summary",
                  label: copy.summaryLabel,
                  cells: {
                    employee: copy.summaryEmployeeCount(rows.length),
                    status: copy.summaryAttentionCount(
                      rows.filter((row) => row.overallStatus !== "compliant")
                        .length
                    ),
                    open: copy.summaryOpenCount(
                      rows.reduce(
                        (count, row) => count + row.openExceptionCount,
                        0
                      )
                    ),
                  },
                },
              ],
            },
          }
        : {}),
    },
    surface: {
      header: { title: "hrm-compliance-employee-status" },
      columnsId: "hrm-compliance-employee-status",
      rowKey: "employeeId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "open",
        header: copy.colOpen,
        align: "end",
      },
      { id: "scope", header: copy.colScope },
      { id: "signals", header: copy.colSignals },
    ],
    rows: rows.map((row) => ({
      id: row.employeeId,
      rowTone: resolveComplianceOverviewRowTone(row.overallStatus),
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} · ${row.legalName}`,
        status: row.overallStatus,
        open: String(row.openExceptionCount),
        scope: [
          row.legalEntityCode ?? "No entity",
          row.workLocationCode ?? "No location",
          row.employmentType ?? "No employment type",
          row.workerCategory ?? "No worker category",
        ].join(" · "),
        signals: `docs ${row.documentMissing}/${row.documentExpired} · training ${row.trainingOverdue} · policy ${row.missingAcknowledgementCount}`,
      },
    })),
  })
}

export type ComplianceEvidenceDetailSummaryRow = {
  id: string
  field: string
  value: string
}

type ComplianceEvidenceDetailSummaryListCopy = {
  empty: string
  colField: string
  colValue: string
}

export function buildComplianceEvidenceDetailSummaryListSurfaceConfiguration(
  rows: readonly ComplianceEvidenceDetailSummaryRow[],
  copy: ComplianceEvidenceDetailSummaryListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "document-lines",
    presentationProfile: "erp-analytical-table",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "field",
      narrowMode: "auto",
    },
    surface: {
      header: { title: "hrm-compliance-evidence-detail-summary" },
      columnsId: "hrm-compliance-evidence-detail-summary",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "field",
        header: copy.colField,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 160,
      },
      { id: "value", header: copy.colValue, wrap: true },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        field: row.field,
        value: row.value,
      },
    })),
  })
}
