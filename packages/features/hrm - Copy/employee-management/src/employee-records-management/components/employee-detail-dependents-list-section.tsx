import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildEmployeeDependentsListSurfaceConfiguration } from "../data/employee-dependents-list-surface.server"
import type { EmployeeDetailDependentListRow } from "../data/employee-dependents-list-surface.server"

import { EmployeeDetailDependentsTrailingCell } from "./employee-detail-dependents-trailing-cell.client"

const DEPENDENT_RELATIONSHIP_MESSAGE_KEY = {
  spouse: "dependentRelationships.spouse",
  child: "dependentRelationships.child",
  parent: "dependentRelationships.parent",
  other: "dependentRelationships.other",
} as const

function relationshipKey(
  value: string
): keyof typeof DEPENDENT_RELATIONSHIP_MESSAGE_KEY {
  if (
    value === "spouse" ||
    value === "child" ||
    value === "parent" ||
    value === "other"
  ) {
    return value
  }
  return "other"
}

export type EmployeeDetailDependentsListSectionProps = {
  orgSlug: string
  dependents: readonly EmployeeDetailDependentListRow[]
  canArchive: boolean
}

export async function EmployeeDetailDependentsListSection({
  orgSlug,
  dependents,
  canArchive,
}: EmployeeDetailDependentsListSectionProps) {
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.workforce"),
    getFormatter(),
  ])

  const listConfiguration = buildEmployeeDependentsListSurfaceConfiguration(
    dependents,
    {
      empty: t("dependentsEmpty"),
      colName: t("dependentLegalNameLabel"),
      colRelationship: t("dependentRelationshipLabel"),
      colDateOfBirth: t("dependentDobLabel"),
      colTaxDependent: t("dependentTaxLabel"),
      relationshipLabelFor: (relationship) =>
        t(DEPENDENT_RELATIONSHIP_MESSAGE_KEY[relationshipKey(relationship)]),
      formatDateOfBirth: (value) =>
        value ? format.dateTime(value, { dateStyle: "medium" }) : "—",
      taxDependentLabelFor: (taxDependent) =>
        taxDependent ? t("dependentTaxYes") : t("dependentTaxNo"),
    },
    { canArchive }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:employee:dependents"
      trailingColumn={{
        header: " ",
        Cell: EmployeeDetailDependentsTrailingCell,
        context: {
          orgSlug,
          archiveLabel: t("dependentArchiveSubmit"),
        },
      }}
    />
  )
}
