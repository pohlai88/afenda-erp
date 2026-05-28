import "server-only"

import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import {
  FHC_LIST_SURFACE_IDS,
  FHC_STAT_SURFACE_KEY,
} from "./fhc-surface-metadata.shared"
import type { FhcOrgComplianceSummary } from "./fhc-overview.server"
import type { FhcVerificationQueueRow } from "./fhc-verification.server"
import type { FhcHealthRecordRow } from "./fhc.types.shared"
import type {
  FhcDutyRestrictionRow,
  FhcEmployeeObligationRow,
  FhcRequirementRuleRow,
} from "./fhc.types.shared"

const FHC_READ_PERMISSION = {
  module: "hrm" as const,
  object: "food_handler_compliance" as const,
  function: "read" as const,
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

export function buildFhcRequirementRulesListSurfaceConfiguration(
  rows: readonly FhcRequirementRuleRow[],
  copy: {
    empty: string
    colOutlet: string
    colCountry: string
    colEntity: string
    colRole: string
    colDepartment: string
    colCategory: string
    colRequirements: string
    colActive: string
    anyLabel: string
    yesNo: (value: boolean) => string
    formatRequirements: (row: FhcRequirementRuleRow) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FHC_LIST_SURFACE_IDS.requirementRules
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: FHC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "outlet", header: copy.colOutlet },
      { id: "country", header: copy.colCountry },
      { id: "entity", header: copy.colEntity },
      { id: "role", header: copy.colRole },
      { id: "department", header: copy.colDepartment },
      { id: "category", header: copy.colCategory },
      { id: "requirements", header: copy.colRequirements },
      {
        id: "active",
        header: copy.colActive,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        outlet: row.outletLabel ?? copy.anyLabel,
        country: row.countryCode ?? copy.anyLabel,
        entity: row.legalEntityRef ?? copy.anyLabel,
        role: row.roleRef ?? copy.anyLabel,
        department: row.departmentRef ?? copy.anyLabel,
        category: row.employeeCategoryRef ?? copy.anyLabel,
        requirements: copy.formatRequirements(row),
        active: copy.yesNo(row.active),
      },
    })),
  })
}

export function buildFhcObligationsListSurfaceConfiguration(
  rows: readonly FhcEmployeeObligationRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colOutlet: string
    colStatus: string
    colComputed: string
    anyLabel: string
    statusLabelFor: (status: string) => string
    formatComputedAt: (date: Date | null) => string
  },
  context?: { canManage?: boolean }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FHC_LIST_SURFACE_IDS.obligations
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: FHC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "outlet", header: copy.colOutlet },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "computed", header: copy.colComputed },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeNumber
          ? `${row.employeeLabel} · ${row.employeeNumber}`
          : row.employeeLabel,
        outlet: row.outletLabel ?? copy.anyLabel,
        status: copy.statusLabelFor(row.computedStatus),
        computed: copy.formatComputedAt(row.computedAt),
      },
      trailingAction:
        context?.canManage === true
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
            })
          : undefined,
    })),
  })
}

export function buildFhcComplianceKpiStatConfiguration(
  summary: FhcOrgComplianceSummary,
  copy: {
    compliant: string
    pending: string
    missing: string
    expiring: string
    expired: string
    queue: string
  }
): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.compliant,
        value: String(summary.compliant),
        tone: "default",
        href: "#fhc-obligations-section",
      },
      {
        label: copy.pending,
        value: String(summary.pending),
        tone: summary.pending > 0 ? "attention" : "default",
        href: "#fhc-obligations-section",
      },
      {
        label: copy.missing,
        value: String(summary.missing),
        tone: summary.missing > 0 ? "attention" : "default",
        href: "#fhc-obligations-section",
      },
      {
        label: copy.expiring,
        value: String(summary.expiring),
        tone: summary.expiring > 0 ? "attention" : "default",
        href: "#fhc-expiry-alerts-section",
      },
      {
        label: copy.expired,
        value: String(summary.expired),
        tone: summary.expired > 0 ? "critical" : "default",
        href: "#fhc-expiry-alerts-section",
      },
      {
        label: copy.queue,
        value: String(summary.rejected),
        tone: summary.rejected > 0 ? "attention" : "default",
        href: "#fhc-verification-queue-section",
      },
    ],
  })
}

export function buildFhcVerificationQueueListSurfaceConfiguration(
  rows: readonly FhcVerificationQueueRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colSubject: string
    colState: string
    colSubmitted: string
    formatSubmitted: (date: Date) => string
  },
  context?: { canVerify?: boolean }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FHC_LIST_SURFACE_IDS.verificationQueue
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: FHC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "subject", header: copy.colSubject },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "submitted", header: copy.colSubmitted },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        subject: `${row.subjectKind} · ${row.subjectId.slice(0, 8)}`,
        state: row.verificationState,
        submitted: copy.formatSubmitted(row.createdAt),
      },
      trailingAction:
        context?.canVerify === true
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
            })
          : undefined,
    })),
  })
}

export function buildFhcDutyRestrictionsListSurfaceConfiguration(
  rows: readonly FhcDutyRestrictionRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colScope: string
    colFrom: string
    colTo: string
    colReason: string
    scopeLabelFor: (scope: string) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FHC_LIST_SURFACE_IDS.dutyRestrictions
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: FHC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      {
        id: "scope",
        header: copy.colScope,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "from", header: copy.colFrom },
      { id: "to", header: copy.colTo },
      { id: "reason", header: copy.colReason },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        scope: copy.scopeLabelFor(row.restrictionScope),
        from: row.effectiveFrom,
        to: row.effectiveTo ?? "—",
        reason: row.reason ?? "—",
      },
    })),
  })
}

export function buildFhcHealthRecordsListSurfaceConfiguration(
  rows: readonly FhcHealthRecordRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colStatus: string
    colRenewal: string
    colIssued: string
    colExpires: string
    colCertificateRef: string
    statusLabelFor: (status: string) => string
    renewalLabelFor: (state: string) => string
    notRecorded: string
  },
  context?: { canViewDetails?: boolean }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FHC_LIST_SURFACE_IDS.healthRecords
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: FHC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "renewal",
        header: copy.colRenewal,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "issued", header: copy.colIssued },
      { id: "expires", header: copy.colExpires },
      { id: "certificateRef", header: copy.colCertificateRef },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        status: copy.statusLabelFor(row.healthStatus),
        renewal: copy.renewalLabelFor(row.renewalState),
        issued: row.issuedAt ?? copy.notRecorded,
        expires: row.expiresAt ?? copy.notRecorded,
        certificateRef: row.certificateRefDisplay ?? copy.notRecorded,
      },
      trailingAction:
        context?.canViewDetails === true
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
            })
          : undefined,
    })),
  })
}

export { FHC_STAT_SURFACE_KEY }
