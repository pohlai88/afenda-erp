import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import { UCB_LIST_SURFACE_IDS, UCB_STAT_SURFACE_KEY } from "./ucb-surface-metadata.shared"
import type {
  UcbCollectiveAgreementRow,
  UcbComplianceFindingRow,
  UcbCbaRuleRow,
  UcbDuesReferenceRow,
  UcbGrievanceRow,
  UcbLrMeetingRow,
  UcbMembershipRow,
  UcbOrgOverviewSummary,
  UcbRepresentativeRow,
  UcbSeniorityProfileRow,
  UcbUnionRow,
} from "./ucb.types.shared"

export { UCB_STAT_SURFACE_KEY }

const UCB_READ_PERMISSION = {
  module: "hrm" as const,
  object: "union_collective_bargaining" as const,
  function: "read" as const,
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

export function buildUcbOverviewStatConfiguration(
  summary: UcbOrgOverviewSummary,
  copy: {
    activeUnions: string
    activeAgreements: string
    activeMemberships: string
    openGrievances: string
    expiringAgreements: string
    unresolvedCompliance: string
  }
): StatCardConfigurationInput {
  return {
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    density: "compact",
    stats: [
      {
        label: copy.activeUnions,
        value: String(summary.activeUnions),
        tone: "default",
        href: "#ucb-unions-section",
        icon: "users",
      },
      {
        label: copy.activeAgreements,
        value: String(summary.activeAgreements),
        tone: "default",
        href: "#ucb-agreements-section",
        icon: "activity",
      },
      {
        label: copy.activeMemberships,
        value: String(summary.activeMemberships),
        tone: "default",
        href: "#ucb-memberships-section",
        icon: "shield",
      },
      {
        label: copy.openGrievances,
        value: String(summary.openGrievances),
        tone: summary.openGrievances > 0 ? "attention" : "default",
        href: "#ucb-grievances-section",
        icon: "alert",
      },
      {
        label: copy.expiringAgreements,
        value: String(summary.expiringAgreements),
        tone: summary.expiringAgreements > 0 ? "attention" : "default",
        href: "#ucb-agreements-section",
        icon: "calendar",
      },
      {
        label: copy.unresolvedCompliance,
        value: String(summary.unresolvedComplianceFindings),
        tone:
          summary.unresolvedComplianceFindings > 0 ? "critical" : "default",
        href: "#ucb-compliance-section",
        icon: "shield",
      },
    ],
  }
}

export function buildUcbUnionsListSurfaceConfiguration(
  rows: readonly UcbUnionRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colStatus: string
    colRep: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.unions
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "status", header: copy.colStatus },
      { id: "rep", header: copy.colRep },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        status: row.status,
        rep: row.representativeRef ?? "—",
      },
    })),
  })
}

export function buildUcbAgreementsListSurfaceConfiguration(
  rows: readonly UcbCollectiveAgreementRow[],
  copy: {
    empty: string
    colTitle: string
    colUnion: string
    colVersion: string
    colStatus: string
    colEffective: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.agreements
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "union", header: copy.colUnion },
      { id: "version", header: copy.colVersion },
      { id: "status", header: copy.colStatus },
      { id: "effective", header: copy.colEffective },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        union: row.unionLabel,
        version: row.versionLabel,
        status: row.status,
        effective: [row.effectiveFrom, row.effectiveTo]
          .filter(Boolean)
          .join(" → ") || "—",
      },
    })),
  })
}

export function buildUcbMembershipsListSurfaceConfiguration(
  rows: readonly UcbMembershipRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colUnion: string
    colUnit: string
    colStatus: string
    colDates: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.memberships
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "union", header: copy.colUnion },
      { id: "unit", header: copy.colUnit },
      { id: "status", header: copy.colStatus },
      { id: "dates", header: copy.colDates },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        union: row.unionLabel,
        unit: row.bargainingUnitLabel ?? "—",
        status: row.status,
        dates: [row.membershipStartDate, row.membershipEndDate]
          .filter(Boolean)
          .join(" → ") || "—",
      },
    })),
  })
}

export function buildUcbCbaRulesListSurfaceConfiguration(
  rows: readonly UcbCbaRuleRow[],
  copy: {
    empty: string
    colAgreement: string
    colDomain: string
    colCode: string
    colSummary: string
    colActive: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.cbaRules
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "agreement", header: copy.colAgreement },
      { id: "domain", header: copy.colDomain },
      { id: "code", header: copy.colCode },
      { id: "summary", header: copy.colSummary },
      { id: "active", header: copy.colActive },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        agreement: row.agreementTitle,
        domain: row.ruleDomain,
        code: row.externalRuleCode,
        summary: row.summary,
        active: row.active ? "yes" : "no",
      },
    })),
  })
}

export function buildUcbSeniorityListSurfaceConfiguration(
  rows: readonly UcbSeniorityProfileRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colDate: string
    colRank: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.seniority
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "date", header: copy.colDate },
      { id: "rank", header: copy.colRank },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        date: row.seniorityDate,
        rank: row.computedRank != null ? String(row.computedRank) : "—",
      },
    })),
  })
}

export function buildUcbComplianceListSurfaceConfiguration(
  rows: readonly UcbComplianceFindingRow[],
  orgSlug: string,
  copy: {
    empty: string
    colCode: string
    colSeverity: string
    colEmployee: string
    colMessage: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.compliance
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "severity", header: copy.colSeverity },
      { id: "employee", header: copy.colEmployee },
      { id: "message", header: copy.colMessage },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...(row.employeeId
        ? hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee")
        : {}),
      cells: {
        code: row.findingCode,
        severity: row.severity,
        employee: row.employeeLabel ?? "—",
        message: row.message,
      },
    })),
  })
}

export function buildUcbDuesListSurfaceConfiguration(
  rows: readonly UcbDuesReferenceRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colAmount: string
    colState: string
    colEffective: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.dues
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "amount", header: copy.colAmount },
      { id: "state", header: copy.colState },
      { id: "effective", header: copy.colEffective },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        amount: `${row.amountRef} ${row.currencyCode}`,
        state: row.approvalState,
        effective: row.effectiveFrom ?? "—",
      },
    })),
  })
}

export function buildUcbGrievancesListSurfaceConfiguration(
  rows: readonly UcbGrievanceRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colCategory: string
    colSeverity: string
    colStatus: string
    colSummary: string
    trailingActionLabel: string
    canManage: boolean
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.grievances
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "category", header: copy.colCategory },
      { id: "severity", header: copy.colSeverity },
      { id: "status", header: copy.colStatus },
      { id: "summary", header: copy.colSummary },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        category: row.category,
        severity: row.severity,
        status: row.status,
        summary: row.summary,
      },
      trailingAction: copy.canManage
        ? resolveListSurfaceRowTrailingAction({
            allowed: true,
            descriptor: {
              id: `ucb-grievance-status:${row.id}`,
              label: copy.trailingActionLabel,
              intent: "default",
            },
          })
        : undefined,
    })),
  })
}

export function buildUcbRepresentativesListSurfaceConfiguration(
  rows: readonly UcbRepresentativeRow[],
  copy: {
    empty: string
    colUnion: string
    colRole: string
    colEmployee: string
    colSite: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.representatives
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "union", header: copy.colUnion },
      { id: "role", header: copy.colRole },
      { id: "employee", header: copy.colEmployee },
      { id: "site", header: copy.colSite },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        union: row.unionLabel,
        role: row.roleKind,
        employee: row.employeeLabel ?? "—",
        site: row.siteRef ?? row.departmentRef ?? "—",
      },
    })),
  })
}

export function buildUcbMeetingsListSurfaceConfiguration(
  rows: readonly UcbLrMeetingRow[],
  copy: {
    empty: string
    colTitle: string
    colScheduled: string
    colStatus: string
    colParticipants: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = UCB_LIST_SURFACE_IDS.meetings
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: UCB_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "scheduled", header: copy.colScheduled },
      { id: "status", header: copy.colStatus },
      { id: "participants", header: copy.colParticipants },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        scheduled: row.scheduledAt ?? "—",
        status: row.status,
        participants: String(row.participantCount),
      },
    })),
  })
}
