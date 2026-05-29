import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import type { OrgStructureSurfaceCapabilities } from "../data/org-structure-capabilities.shared"
import {
  buildOrgAssignmentsListSurfaceConfiguration,
  buildOrgHealthIssuesListSurfaceConfiguration,
  buildOrgJobGradesListSurfaceConfiguration,
  buildOrgPositionsListSurfaceConfiguration,
  buildOrgReportingListSurfaceConfiguration,
  buildOrgUnitsListSurfaceConfiguration,
} from "../data/org-structure-list-surface.server"
import type {
  JobGradeListRow,
  OrgStructureEmployeePlacementRow,
  OrgStructureHealthIssue,
  OrgUnitTreeRow,
  PositionListRow,
} from "../data/org-structure.queries.server"

import { OrgStructureArchiveTrailingCell } from "./org-structure-archive-trailing-cell.client"

function orgStructureTrailingListContext(
  capabilities: OrgStructureSurfaceCapabilities
) {
  const showActionsColumn = capabilities.canCreate || capabilities.canDelete
  return {
    canDelete: capabilities.canDelete,
    showActionsColumn,
  }
}

type OrganizationGradesListSectionProps = {
  orgSlug: string
  rows: readonly JobGradeListRow[]
  capabilities: OrgStructureSurfaceCapabilities
}

export async function OrganizationGradesListSection({
  orgSlug,
  rows,
  capabilities,
}: OrganizationGradesListSectionProps) {
  const t = await getTranslations("Erp.Hrm.organization.grades")
  const trailingContext = orgStructureTrailingListContext(capabilities)
  const listConfiguration = buildOrgJobGradesListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colCode: t("colCode"),
      colName: t("colName"),
      colOrdinal: t("colOrdinal"),
      colSalaryBand: t("colSalaryBand"),
      colBenefitTier: t("colBenefitTier"),
      colStatus: t("colStatus"),
      statusActive: t("statusActive"),
      statusArchived: t("statusArchived"),
    },
    trailingContext
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:organization:grades"
      trailingColumn={
        trailingContext.showActionsColumn
          ? {
              header: t("colActions"),
              Cell: OrgStructureArchiveTrailingCell,
              context: { orgSlug, kind: "grade" as const },
            }
          : undefined
      }
    />
  )
}

type OrganizationPositionsListSectionProps = {
  orgSlug: string
  rows: readonly PositionListRow[]
  capabilities: OrgStructureSurfaceCapabilities
}

export async function OrganizationPositionsListSection({
  orgSlug,
  rows,
  capabilities,
}: OrganizationPositionsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.organization.positions")
  const trailingContext = orgStructureTrailingListContext(capabilities)
  const listConfiguration = buildOrgPositionsListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colCode: t("colCode"),
      colTitle: t("colTitle"),
      colDepartment: t("colDepartment"),
      colReportsTo: t("colReportsTo"),
      colGrade: t("colGrade"),
      colBudget: t("colBudget"),
      colOccupied: t("colOccupied"),
      colStatus: t("colStatus"),
      occupancyLabel: (state) => t(`occupancy.${state}` as never),
      statusArchived: t("statusArchived"),
    },
    trailingContext
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:organization:positions"
      trailingColumn={
        trailingContext.showActionsColumn
          ? {
              header: t("colActions"),
              Cell: OrgStructureArchiveTrailingCell,
              context: { orgSlug, kind: "position" as const },
            }
          : undefined
      }
    />
  )
}

type OrganizationAssignmentsListSectionProps = {
  orgSlug: string
  rows: readonly OrgStructureEmployeePlacementRow[]
}

export async function OrganizationAssignmentsListSection({
  orgSlug,
  rows,
}: OrganizationAssignmentsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.organization.assignments")
  const listConfiguration = buildOrgAssignmentsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("empty"),
      colEmployee: t("colEmployee"),
      colDepartment: t("colDepartment"),
      colPosition: t("colPosition"),
      colGrade: t("colGrade"),
      colManager: t("colManager"),
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:organization:assignments"
    />
  )
}

type OrganizationOrgUnitsListSectionProps = {
  orgSlug: string
  rows: readonly OrgUnitTreeRow[]
  capabilities: OrgStructureSurfaceCapabilities
}

export async function OrganizationOrgUnitsListSection({
  orgSlug,
  rows,
  capabilities,
}: OrganizationOrgUnitsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.organization.orgUnits")
  const trailingContext = orgStructureTrailingListContext(capabilities)
  const listConfiguration = buildOrgUnitsListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colCode: t("colCode"),
      colName: t("colName"),
      colParent: t("colParent"),
      colHead: t("colHead"),
      colCostCenter: t("colCostCenter"),
      colPositions: t("colPositions"),
      colEmployees: t("colEmployees"),
      colStatus: t("colStatus"),
      statusActive: t("statusActive"),
      statusArchived: t("statusArchived"),
    },
    trailingContext
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:organization:org-units"
      trailingColumn={
        trailingContext.showActionsColumn
          ? {
              header: t("colActions"),
              Cell: OrgStructureArchiveTrailingCell,
              context: { orgSlug, kind: "org-unit" as const },
            }
          : undefined
      }
    />
  )
}

type OrganizationReportingListSectionProps = {
  rows: readonly PositionListRow[]
}

export async function OrganizationReportingListSection({
  rows,
}: OrganizationReportingListSectionProps) {
  const t = await getTranslations("Erp.Hrm.organization.reporting")
  const listConfiguration = buildOrgReportingListSurfaceConfiguration(rows, {
    empty: t("empty"),
    colPosition: t("colPosition"),
    colReportsTo: t("colReportsTo"),
    colDepartment: t("colDepartment"),
    colOccupied: t("colOccupied"),
  })

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:organization:reporting"
    />
  )
}

type OrganizationHealthIssuesListSectionProps = {
  rows: readonly OrgStructureHealthIssue[]
}

export async function OrganizationHealthIssuesListSection({
  rows,
}: OrganizationHealthIssuesListSectionProps) {
  const t = await getTranslations("Erp.Hrm.organization.health")
  const listConfiguration = buildOrgHealthIssuesListSurfaceConfiguration(rows, {
    empty: t("empty"),
    colSeverity: t("colSeverity"),
    colIssue: t("colIssue"),
    colDetail: t("colDetail"),
    severityLabel: (severity) => severity.toUpperCase(),
  })

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:organization:health"
    />
  )
}
