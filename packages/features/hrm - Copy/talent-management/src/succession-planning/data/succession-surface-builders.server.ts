import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import {
  SUCCESSION_LIST_SURFACE_IDS,
  SUCCESSION_STAT_SURFACE_KEY,
} from "./succession-surface-metadata.shared"
import type {
  SuccessionBenchStrengthRow,
  SuccessionCalibrationSessionRow,
  SuccessionCriticalRoleRow,
  SuccessionNominationRow,
  SuccessionOrgOverviewSummary,
  SuccessionTalentPoolRow,
} from "./succession.types.shared"

const SUCCESSION_READ_PERMISSION = {
  module: "hrm" as const,
  object: "succession" as const,
  function: "read" as const,
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

export function buildSuccessionOverviewStatConfiguration(
  summary: SuccessionOrgOverviewSummary,
  copy: {
    activeCriticalRoles: string
    activeNominations: string
    talentPools: string
    openReviewCycles: string
    rolesWithoutReadySuccessor: string
    highRiskRoles: string
  }
): StatCardConfigurationInput {
  return {
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    density: "compact",
    stats: [
      {
        label: copy.activeCriticalRoles,
        value: String(summary.activeCriticalRoles),
        tone: "default",
        href: "#succession-critical-roles-section",
        icon: "activity",
      },
      {
        label: copy.activeNominations,
        value: String(summary.activeNominations),
        tone: "default",
        href: "#succession-nominations-section",
        icon: "users",
      },
      {
        label: copy.talentPools,
        value: String(summary.talentPools),
        tone: "default",
        href: "#succession-pools-section",
        icon: "shield",
      },
      {
        label: copy.openReviewCycles,
        value: String(summary.openReviewCycles),
        tone: "default",
        href: "#succession-bench-risk-section",
        icon: "calendar",
      },
      {
        label: copy.rolesWithoutReadySuccessor,
        value: String(summary.rolesWithoutReadySuccessor),
        tone: summary.rolesWithoutReadySuccessor > 0 ? "attention" : "default",
        href: "#succession-bench-risk-section",
        icon: "alert",
      },
      {
        label: copy.highRiskRoles,
        value: String(summary.highRiskRoles),
        tone: summary.highRiskRoles > 0 ? "critical" : "default",
        href: "#succession-bench-risk-section",
        icon: "shield",
      },
    ],
  }
}

export function buildSuccessionCriticalRolesListSurfaceConfiguration(
  rows: readonly SuccessionCriticalRoleRow[],
  copy: {
    empty: string
    colCode: string
    colTitle: string
    colImpact: string
    colVacancyRisk: string
    colIncumbent: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = SUCCESSION_LIST_SURFACE_IDS.criticalRoles
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: SUCCESSION_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "title", header: copy.colTitle },
      { id: "impact", header: copy.colImpact },
      { id: "vacancyRisk", header: copy.colVacancyRisk },
      { id: "incumbent", header: copy.colIncumbent },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        title: row.title,
        impact: row.businessImpact,
        vacancyRisk: row.vacancyRisk,
        incumbent: row.incumbentLabel ?? "—",
      },
    })),
  })
}

export function buildSuccessionNominationsListSurfaceConfiguration(
  rows: readonly SuccessionNominationRow[],
  orgSlug: string,
  copy: {
    empty: string
    colRole: string
    colCandidate: string
    colType: string
    colReadiness: string
    colStatus: string
    trailingActionLabel: string
    canManage: boolean
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = SUCCESSION_LIST_SURFACE_IDS.nominations
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: SUCCESSION_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "role", header: copy.colRole },
      { id: "candidate", header: copy.colCandidate },
      { id: "successorType", header: copy.colType },
      { id: "readinessLevel", header: copy.colReadiness },
      { id: "status", header: copy.colStatus },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.candidateEmployeeId, "candidate"),
      cells: {
        role: row.criticalRoleTitle,
        candidate: row.candidateLabel,
        successorType: row.successorType,
        readinessLevel: row.readinessLevel,
        status: row.status,
      },
      trailingAction: copy.canManage
        ? resolveListSurfaceRowTrailingAction({
            allowed: true,
            descriptor: {
              id: `succession-nomination-readiness:${row.id}`,
              label: copy.trailingActionLabel,
              intent: "default",
            },
          })
        : undefined,
    })),
  })
}

export function buildSuccessionTalentPoolsListSurfaceConfiguration(
  rows: readonly SuccessionTalentPoolRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colKind: string
    colMembers: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = SUCCESSION_LIST_SURFACE_IDS.talentPools
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: SUCCESSION_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "poolKind", header: copy.colKind },
      { id: "memberCount", header: copy.colMembers },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        poolKind: row.poolKind,
        memberCount: String(row.memberCount),
      },
    })),
  })
}

export function buildSuccessionCalibrationSessionsListSurfaceConfiguration(
  rows: readonly SuccessionCalibrationSessionRow[],
  copy: {
    empty: string
    colTitle: string
    colDate: string
    colStatus: string
    colEntries: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = SUCCESSION_LIST_SURFACE_IDS.calibrationSessions
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: SUCCESSION_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "sessionDate", header: copy.colDate },
      { id: "status", header: copy.colStatus },
      { id: "entryCount", header: copy.colEntries },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        sessionDate: row.sessionDate ?? "—",
        status: row.status,
        entryCount: String(row.entryCount),
      },
    })),
  })
}

export function buildSuccessionBenchStrengthListSurfaceConfiguration(
  rows: readonly SuccessionBenchStrengthRow[],
  copy: {
    empty: string
    colRole: string
    colReadyNow: string
    colNominations: string
    colScore: string
    colRisk: string
    colFlags: string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = SUCCESSION_LIST_SURFACE_IDS.benchStrength
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: SUCCESSION_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "criticalRoleId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "role", header: copy.colRole },
      { id: "readyNow", header: copy.colReadyNow },
      { id: "nominations", header: copy.colNominations },
      { id: "score", header: copy.colScore },
      { id: "risk", header: copy.colRisk },
      { id: "flags", header: copy.colFlags },
    ],
    rows: rows.map((row) => ({
      id: row.criticalRoleId,
      cells: {
        role: row.criticalRoleTitle,
        readyNow: String(row.readyNowCount),
        nominations: String(row.nominationCount),
        score: String(row.benchStrengthScore),
        risk: row.riskLevel,
        flags: row.flags.join(", ") || "—",
      },
    })),
  })
}

export { SUCCESSION_STAT_SURFACE_KEY }
