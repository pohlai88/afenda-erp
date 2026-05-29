import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildSalaryAdvanceOrgListSurfaceConfiguration } from "../data/salary-advance-list-surface.server"
import type { SalaryAdvanceListRow } from "../data/salary-advance.queries.server"
import { HrmAdvancesTrailingCell } from "./hrm-advances-trailing-cell.client"

type HrmAdvancesListSectionProps = {
  orgSlug: string
  isAdmin: boolean
  advances: readonly SalaryAdvanceListRow[]
}

export async function HrmAdvancesListSection({
  orgSlug,
  isAdmin,
  advances,
}: HrmAdvancesListSectionProps) {
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.advances"),
    getFormatter(),
  ])

  const stateLabelFor = (state: string) => {
    if (state === "pending") return t("stateLabels.pending")
    if (state === "approved") return t("stateLabels.approved")
    if (state === "rejected") return t("stateLabels.rejected")
    if (state === "cancelled") return t("stateLabels.cancelled")
    if (state === "repaid") return t("stateLabels.repaid")
    if (state === "deducted") return t("stateLabels.deducted")
    return state
  }

  const listConfiguration = buildSalaryAdvanceOrgListSurfaceConfiguration(
    advances,
    orgSlug,
    {
      empty: t("tableEmpty"),
      colEmployee: t("fieldEmployee"),
      colAmount: t("fieldAmount"),
      colState: t("colState"),
      colRequested: t("colRequested"),
      colReason: t("fieldReason"),
      stateLabelFor,
      formatRequestedAt: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:payroll:advances-org"
      trailingColumn={
        isAdmin
          ? {
              header: t("colActions"),
              Cell: HrmAdvancesTrailingCell,
              context: {
                orgSlug,
                decisionNotePlaceholder: t("decisionNotePlaceholder"),
                approveLabel: t("approve"),
                rejectLabel: t("reject"),
                advances: advances.map((row) => ({
                  id: row.id,
                  state: row.state,
                })),
              },
            }
          : undefined
      }
    />
  )
}
