import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildComplianceFilingsListSurfaceConfiguration } from "../data/compliance-list-surface.server"
import type { ComplianceFilingListRow } from "../data/compliance-filing.queries.server"
import { ComplianceFilingsTrailingCell } from "./compliance-list-trailing-cells.client"

type ComplianceFilingsListSectionProps = {
  orgSlug: string
  canUpdate: boolean
  rows: readonly ComplianceFilingListRow[]
}

export async function ComplianceFilingsListSection({
  orgSlug,
  canUpdate,
  rows,
}: ComplianceFilingsListSectionProps) {
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.compliance.filings"),
    getFormatter(),
  ])

  const trailingContext = {
    showActionsColumn: canUpdate,
    canUpdate,
  }

  const listConfiguration = buildComplianceFilingsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("empty"),
      colTitle: t("colTitle"),
      colCategory: t("colCategory"),
      colStatus: t("colStatus"),
      colDue: t("colDue"),
      colScope: t("colScope"),
      formatDueDate: (date) => format.dateTime(date, { dateStyle: "medium" }),
    },
    trailingContext
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:compliance:filings"
      trailingColumn={
        canUpdate
          ? {
              header: t("colActions"),
              Cell: ComplianceFilingsTrailingCell,
              context: {
                orgSlug,
                labels: {
                  submissionReferencePlaceholder: t(
                    "submissionReferencePlaceholder"
                  ),
                  markSubmitted: t("markSubmitted"),
                  authorityConfirmationPlaceholder: t(
                    "authorityConfirmationPlaceholder"
                  ),
                  confirm: t("confirm"),
                  waiverReasonPlaceholder: t("waiverReasonPlaceholder"),
                  approvalReferencePlaceholder: t(
                    "approvalReferencePlaceholder"
                  ),
                  waive: t("waive"),
                },
              },
            }
          : undefined
      }
    />
  )
}
