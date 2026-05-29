import "server-only"

import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import {
  MSC_LIST_SURFACE_IDS,
  MSC_STAT_SURFACE_KEY,
} from "./msc-surface-metadata.shared"
import type { MscEvidenceLinkRow } from "./msc-evidence.server"
import type { MscOrgComplianceSummary } from "./msc-overview.server"
import type {
  MscCertificationRow,
  MscCorrectiveActionRow,
  MscEmployeeObligationRow,
  MscHazardAssessmentRow,
  MscIncidentRow,
  MscMachineRow,
  MscRegulatoryReferenceRow,
  MscRequirementRuleRow,
  MscSiteMasterRow,
  MscWorkRestrictionRow,
} from "./msc.types.shared"

const MSC_READ_PERMISSION = {
  module: "hrm" as const,
  object: "manufacturing_safety" as const,
  function: "read" as const,
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

export function buildMscRequirementRulesListSurfaceConfiguration(
  rows: readonly MscRequirementRuleRow[],
  copy: {
    empty: string
    colSite: string
    colCountry: string
    colRole: string
    colDepartment: string
    colRisk: string
    colRequirements: string
    colActive: string
    anyLabel: string
    yesNo: (value: boolean) => string
    formatRequirements: (row: MscRequirementRuleRow) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.requirements
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "site", header: copy.colSite },
      { id: "country", header: copy.colCountry },
      { id: "role", header: copy.colRole },
      { id: "department", header: copy.colDepartment },
      { id: "risk", header: copy.colRisk },
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
        site: row.siteLabel ?? copy.anyLabel,
        country: row.countryCode ?? copy.anyLabel,
        role: row.roleRef ?? copy.anyLabel,
        department: row.departmentRef ?? copy.anyLabel,
        risk: row.riskCategory ?? copy.anyLabel,
        requirements: copy.formatRequirements(row),
        active: copy.yesNo(row.active),
      },
    })),
  })
}

export function buildMscObligationsListSurfaceConfiguration(
  rows: readonly MscEmployeeObligationRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colSite: string
    colStatus: string
    colComputed: string
    colCertExpiry: string
    statusLabelFor: (status: string) => string
    notComputed: string
    notRecorded: string
  },
  context?: { canManage?: boolean }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.obligations
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "site", header: copy.colSite },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "computed",
        header: copy.colComputed,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "certExpiry", header: copy.colCertExpiry },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        site: row.siteLabel ?? copy.notRecorded,
        status: copy.statusLabelFor(row.complianceStatus),
        computed: copy.statusLabelFor(row.computedStatus),
        certExpiry: row.certExpiryDate ?? copy.notRecorded,
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

export function buildMscSitesListSurfaceConfiguration(
  rows: readonly MscSiteMasterRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colCountry: string
    colOsha: string
    yesNo: (value: boolean) => string
    notRecorded: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.sites
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "country", header: copy.colCountry },
      {
        id: "osha",
        header: copy.colOsha,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        country: row.countryCode ?? copy.notRecorded,
        osha: copy.yesNo(row.oshaRecordkeepingEnabled),
      },
    })),
  })
}

export function buildMscMachinesListSurfaceConfiguration(
  rows: readonly MscMachineRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colSite: string
    notRecorded: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.machines
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "site", header: copy.colSite },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        site: row.siteLabel ?? copy.notRecorded,
      },
    })),
  })
}

export function buildMscEvidenceListSurfaceConfiguration(
  rows: readonly MscEvidenceLinkRow[],
  copy: {
    empty: string
    colSubjectKind: string
    colSubjectId: string
    colDocument: string
    colEmployee: string
    colCreated: string
    notRecorded: string
    formatCreatedAt: (date: Date) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.evidence
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "subjectKind", header: copy.colSubjectKind },
      { id: "subjectId", header: copy.colSubjectId },
      { id: "document", header: copy.colDocument },
      { id: "employee", header: copy.colEmployee },
      { id: "created", header: copy.colCreated },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        subjectKind: row.subjectKind,
        subjectId: row.subjectId,
        document: row.documentId,
        employee: row.employeeId ?? copy.notRecorded,
        created: copy.formatCreatedAt(row.createdAt),
      },
    })),
  })
}

export function buildMscComplianceKpiStatConfiguration(
  summary: MscOrgComplianceSummary,
  copy: {
    compliant: string
    pending: string
    missing: string
    expiring: string
    expired: string
    flagged: string
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
        href: "#msc-obligations-section",
      },
      {
        label: copy.pending,
        value: String(summary.pending),
        tone: summary.pending > 0 ? "attention" : "default",
        href: "#msc-obligations-section",
      },
      {
        label: copy.missing,
        value: String(summary.missing),
        tone: summary.missing > 0 ? "attention" : "default",
        href: "#msc-obligations-section",
      },
      {
        label: copy.expiring,
        value: String(summary.expiring),
        tone: summary.expiring > 0 ? "attention" : "default",
        href: "#msc-certifications-section",
      },
      {
        label: copy.expired,
        value: String(summary.expired),
        tone: summary.expired > 0 ? "critical" : "default",
        href: "#msc-certifications-section",
      },
      {
        label: copy.flagged,
        value: String(summary.missingMandatoryTraining),
        tone: summary.missingMandatoryTraining > 0 ? "attention" : "default",
        href: "#msc-obligations-section",
      },
    ],
  })
}

export function buildMscCertificationsListSurfaceConfiguration(
  rows: readonly MscCertificationRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colType: string
    colStatus: string
    colIssue: string
    colExpiry: string
    colRenewal: string
    statusLabelFor: (status: string) => string
    notRecorded: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.certifications
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "type", header: copy.colType },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "issue", header: copy.colIssue },
      { id: "expiry", header: copy.colExpiry },
      { id: "renewal", header: copy.colRenewal },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        type: row.certificationType,
        status: copy.statusLabelFor(row.certStatus),
        issue: row.issueDate ?? copy.notRecorded,
        expiry: row.expiryDate ?? copy.notRecorded,
        renewal: row.renewalDate ?? copy.notRecorded,
      },
    })),
  })
}

export function buildMscHazardAssessmentsListSurfaceConfiguration(
  rows: readonly MscHazardAssessmentRow[],
  copy: {
    empty: string
    colTitle: string
    colType: string
    colStatus: string
    colSite: string
    colExpires: string
    typeLabelFor: (type: string) => string
    statusLabelFor: (status: string) => string
    notRecorded: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.hazardAssessments
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      {
        id: "type",
        header: copy.colType,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "site", header: copy.colSite },
      { id: "expires", header: copy.colExpires },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        type: copy.typeLabelFor(row.assessmentType),
        status: copy.statusLabelFor(row.assessmentStatus),
        site: row.siteLabel ?? copy.notRecorded,
        expires: row.expiresAt ?? copy.notRecorded,
      },
    })),
  })
}

export function buildMscIncidentsListSurfaceConfiguration(
  rows: readonly MscIncidentRow[],
  copy: {
    empty: string
    colDate: string
    colType: string
    colStatus: string
    colSeverity: string
    colSite: string
    colEmployee: string
    typeLabelFor: (type: string) => string
    statusLabelFor: (status: string) => string
    notRecorded: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.incidents
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "date", header: copy.colDate },
      {
        id: "type",
        header: copy.colType,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "severity", header: copy.colSeverity },
      { id: "site", header: copy.colSite },
      { id: "employee", header: copy.colEmployee },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        date: row.incidentDate,
        type: copy.typeLabelFor(row.incidentType),
        status: copy.statusLabelFor(row.incidentStatus),
        severity: row.severity ?? copy.notRecorded,
        site: row.siteLabel ?? copy.notRecorded,
        employee: row.employeeLabel ?? copy.notRecorded,
      },
    })),
  })
}

export function buildMscCorrectiveActionsListSurfaceConfiguration(
  rows: readonly MscCorrectiveActionRow[],
  copy: {
    empty: string
    colTitle: string
    colSource: string
    colPriority: string
    colStatus: string
    colDue: string
    priorityLabelFor: (priority: string) => string
    statusLabelFor: (status: string) => string
    sourceLabelFor: (source: string) => string
    notRecorded: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.correctiveActions
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "source", header: copy.colSource },
      {
        id: "priority",
        header: copy.colPriority,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "due", header: copy.colDue },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        source: copy.sourceLabelFor(row.sourceKind),
        priority: copy.priorityLabelFor(row.priority),
        status: copy.statusLabelFor(row.actionStatus),
        due: row.dueDate ?? copy.notRecorded,
      },
    })),
  })
}

export function buildMscWorkRestrictionsListSurfaceConfiguration(
  rows: readonly MscWorkRestrictionRow[],
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
  const columnsId = MSC_LIST_SURFACE_IDS.workRestrictions
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
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

export function buildMscRegulatoryReferencesListSurfaceConfiguration(
  rows: readonly MscRegulatoryReferenceRow[],
  copy: {
    empty: string
    colFramework: string
    colCode: string
    colLabel: string
    colSite: string
    colNotes: string
    notRecorded: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = MSC_LIST_SURFACE_IDS.regulatoryReferences
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: MSC_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "framework", header: copy.colFramework },
      { id: "code", header: copy.colCode },
      { id: "label", header: copy.colLabel },
      { id: "site", header: copy.colSite },
      { id: "notes", header: copy.colNotes },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        framework: row.framework,
        code: row.referenceCode ?? copy.notRecorded,
        label: row.referenceLabel ?? copy.notRecorded,
        site: row.siteLabel ?? copy.notRecorded,
        notes: row.notes ?? copy.notRecorded,
      },
    })),
  })
}

export { MSC_STAT_SURFACE_KEY }
