import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildComplianceObligationsListSurfaceConfiguration } from "../data/compliance-list-surface.server"
import type { ComplianceObligationRow } from "../data/compliance-obligation.queries.server"
import { ComplianceObligationsTrailingCell } from "./compliance-list-trailing-cells.client"

type ComplianceObligationsListSectionProps = {
  orgSlug: string
  canUpdate: boolean
  rows: readonly ComplianceObligationRow[]
}

function formatObligationScope(row: ComplianceObligationRow): string {
  return [
    row.countryCode ?? "Global",
    row.legalEntityCode ?? null,
    row.workLocationCode ?? null,
    row.employmentType ?? null,
    row.workerCategory ?? null,
  ]
    .filter(Boolean)
    .join(" · ")
}

export async function ComplianceObligationsListSection({
  orgSlug,
  canUpdate,
  rows,
}: ComplianceObligationsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.compliance.obligations")

  const trailingContext = {
    showActionsColumn: canUpdate,
    canUpdate,
  }

  const listConfiguration = buildComplianceObligationsListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colCode: t("colCode"),
      colTitle: t("colTitle"),
      colKind: t("colKind"),
      colArea: t("colArea"),
      colStatus: t("colStatus"),
      colScope: t("colScope"),
      formatScope: formatObligationScope,
    },
    trailingContext
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:compliance:obligations"
      trailingColumn={
        canUpdate
          ? {
              header: t("colActions"),
              Cell: ComplianceObligationsTrailingCell,
              context: {
                orgSlug,
                archiveSubmitLabel: t("archiveSubmit"),
                rowById: Object.fromEntries(
                  rows.map((row) => [
                    row.id,
                    { id: row.id, status: row.status },
                  ])
                ),
              },
            }
          : undefined
      }
    />
  )
}
