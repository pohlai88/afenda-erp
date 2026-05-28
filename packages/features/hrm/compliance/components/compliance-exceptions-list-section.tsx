import { getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildComplianceExceptionsListSurfaceConfiguration } from "../data/compliance-list-surface.server"
import type { ComplianceExceptionListRow } from "../data/compliance-exception.queries.server"
import { ComplianceExceptionsTrailingCell } from "./compliance-list-trailing-cells.client"

type ComplianceExceptionsListSectionProps = {
  orgSlug: string
  canUpdate: boolean
  rows: readonly ComplianceExceptionListRow[]
  workbenchFocus?: string | null
}

export async function ComplianceExceptionsListSection({
  orgSlug,
  canUpdate,
  rows,
  workbenchFocus,
}: ComplianceExceptionsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.compliance.exceptions")

  const trailingContext = {
    showActionsColumn: canUpdate,
    canUpdate,
  }

  const filteredRows = rows.filter((row) =>
    matchesGovernedWorkbenchFocus(
      workbenchFocus,
      row.title,
      row.complianceArea,
      row.severity,
      row.status,
      row.legalName,
      row.employeeNumber
    )
  )

  const listConfiguration = buildComplianceExceptionsListSurfaceConfiguration(
    filteredRows,
    orgSlug,
    {
      empty: t("empty"),
      colTitle: t("colTitle"),
      colArea: t("colArea"),
      colSeverity: t("colSeverity"),
      colStatus: t("colStatus"),
      colSubject: t("orgLevel"),
    },
    trailingContext,
    {
      workbenchFocusSearch: {
        label: t("toolbarSearchLabel"),
        placeholder: t("toolbarSearchPlaceholder"),
        value: workbenchFocus,
      },
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:compliance:exceptions"
      trailingColumn={
        canUpdate
          ? {
              header: t("colActions"),
              Cell: ComplianceExceptionsTrailingCell,
              context: {
                orgSlug,
                labels: {
                  ownerUserIdPlaceholder: t("ownerUserIdPlaceholder"),
                  correctiveActionPlaceholder: t("correctiveActionPlaceholder"),
                  assignSubmit: t("assignSubmit"),
                  progressNotePlaceholder: t("progressNotePlaceholder"),
                  evidenceDocumentIdPlaceholder: t(
                    "evidenceDocumentIdPlaceholder"
                  ),
                  progressSubmit: t("progressSubmit"),
                  resolvePlaceholder: t("resolvePlaceholder"),
                  resolveSubmit: t("resolveSubmit"),
                  waiveReasonPlaceholder: t("waiveReasonPlaceholder"),
                  waiveRefPlaceholder: t("waiveRefPlaceholder"),
                  waiveSubmit: t("waiveSubmit"),
                },
              },
            }
          : undefined
      }
    />
  )
}
