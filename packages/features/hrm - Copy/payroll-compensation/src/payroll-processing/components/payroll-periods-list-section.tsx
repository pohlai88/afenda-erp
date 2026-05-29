import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildPayrollPeriodsListSurfaceConfiguration } from "../data/payroll-periods-list-surface.server"
import type { PayrollConsolePeriod } from "../data/payroll-console-view.shared"

type PayrollPeriodsListSectionProps = {
  periods: readonly PayrollConsolePeriod[]
}

export async function PayrollPeriodsListSection({
  periods,
}: PayrollPeriodsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.payroll")

  const listConfiguration = buildPayrollPeriodsListSurfaceConfiguration(
    periods,
    {
      empty: t("noPeriods"),
      colPeriod: t("periodsOverviewColPeriod"),
      colPaymentDate: t("paymentDateLabel"),
      colCurrency: t("periodsOverviewColCurrency"),
      colState: t("periodsOverviewColState"),
      colRulePack: t("pinnedRulePackLabel"),
      stateLabelFor: (state) => {
        switch (state) {
          case "open":
            return t("state.open")
          case "preparing":
            return t("state.preparing")
          case "locked":
            return t("state.locked")
          case "finalized":
            return t("state.finalized")
          case "posted":
            return t("state.posted")
          default:
            return state
        }
      },
    }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">{t("periodsOverviewTitle")}</CardTitle>
        <CardDescription>{t("periodsOverviewDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey="hrm:payroll:periods"
          resolveConfiguredPermission={false}
        />
      </CardContent>
    </Card>
  )
}
