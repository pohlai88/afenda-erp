import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  buildBonusClawbacksListSurfaceConfiguration,
  buildBonusCyclesListSurfaceConfiguration,
  buildBonusPayoutsListSurfaceConfiguration,
  buildBonusPlansListSurfaceConfiguration,
  buildBonusReportsListSurfaceConfiguration,
} from "../data/bonus-incentive-list-surface.server"
import type {
  BonusClawbackRow,
  BonusCycleRow,
  BonusEmployeeChoice,
  BonusPayrollPeriodChoice,
  BonusPayoutRow,
  BonusPlanRow,
  BonusReportSnapshot,
} from "../data/bonus-incentive.queries.server"

import {
  BonusCyclesTrailingCell,
  BonusPayoutsTrailingCell,
} from "./bonus-incentive-trailing-cells.client"

export async function BonusPlansSection({
  rows,
}: {
  readonly rows: readonly BonusPlanRow[]
}) {
  const t = await getTranslations("Erp.Hrm.bonusIncentives.tables")
  return (
    <GovernedPatternCListSection
      title={t("plansTitle")}
      description={t("plansDescription")}
      surfaceKey="hrm:bonus-incentives:plans"
      listConfiguration={buildBonusPlansListSurfaceConfiguration(rows, {
        empty: t("plansEmpty"),
        colCode: t("colCode"),
        colName: t("colName"),
        colType: t("colType"),
        colFormula: t("colFormula"),
        colStatus: t("colStatus"),
        active: t("active"),
        inactive: t("inactive"),
      })}
    />
  )
}

export async function BonusCyclesSection({
  rows,
  employees,
}: {
  readonly rows: readonly BonusCycleRow[]
  readonly employees: readonly BonusEmployeeChoice[]
}) {
  const t = await getTranslations("Erp.Hrm.bonusIncentives.tables")
  return (
    <GovernedPatternCListSection
      title={t("cyclesTitle")}
      description={t("cyclesDescription")}
      surfaceKey="hrm:bonus-incentives:cycles"
      listConfiguration={buildBonusCyclesListSurfaceConfiguration(rows, {
        empty: t("cyclesEmpty"),
        colCode: t("colCode"),
        colPlan: t("colPlan"),
        colPeriod: t("colPeriod"),
        colPayout: t("colPayout"),
        colState: t("colState"),
      })}
      trailingColumn={{
        header: t("colActions"),
        Cell: BonusCyclesTrailingCell,
        context: { cycles: rows, employees },
      }}
    />
  )
}

export async function BonusPayoutsSection({
  orgSlug,
  rows,
  payrollPeriods,
}: {
  readonly orgSlug: string
  readonly rows: readonly BonusPayoutRow[]
  readonly payrollPeriods: readonly BonusPayrollPeriodChoice[]
}) {
  const t = await getTranslations("Erp.Hrm.bonusIncentives.tables")
  return (
    <GovernedPatternCListSection
      title={t("payoutsTitle")}
      description={t("payoutsDescription")}
      surfaceKey="hrm:bonus-incentives:payouts"
      listConfiguration={buildBonusPayoutsListSurfaceConfiguration(
        rows,
        orgSlug,
        {
          empty: t("payoutsEmpty"),
          colEmployee: t("colEmployee"),
          colPlan: t("colPlan"),
          colCalculated: t("colCalculated"),
          colApproved: t("colApproved"),
          colState: t("colState"),
          colFlags: t("colFlags"),
        }
      )}
      trailingColumn={{
        header: t("colActions"),
        Cell: BonusPayoutsTrailingCell,
        context: { payouts: rows, payrollPeriods },
      }}
    />
  )
}

export async function BonusClawbacksSection({
  orgSlug,
  rows,
}: {
  readonly orgSlug: string
  readonly rows: readonly BonusClawbackRow[]
}) {
  const t = await getTranslations("Erp.Hrm.bonusIncentives.tables")
  return (
    <GovernedPatternCListSection
      title={t("clawbacksTitle")}
      description={t("clawbacksDescription")}
      surfaceKey="hrm:bonus-incentives:clawbacks"
      listConfiguration={buildBonusClawbacksListSurfaceConfiguration(
        rows,
        orgSlug,
        {
          empty: t("clawbacksEmpty"),
          colEmployee: t("colEmployee"),
          colType: t("colType"),
          colAmount: t("colAmount"),
          colReason: t("colReason"),
          colState: t("colState"),
        }
      )}
    />
  )
}

export async function BonusReportsSection({
  snapshot,
}: {
  readonly snapshot: BonusReportSnapshot
}) {
  const t = await getTranslations("Erp.Hrm.bonusIncentives.tables")
  return (
    <GovernedPatternCListSection
      title={t("reportsTitle")}
      description={t("reportsDescription")}
      surfaceKey="hrm:bonus-incentives:reports"
      listConfiguration={buildBonusReportsListSurfaceConfiguration(snapshot, {
        colMetric: t("colMetric"),
        colValue: t("colValue"),
        activePlans: t("activePlans"),
        cycles: t("cycles"),
        payouts: t("payouts"),
        pendingApproval: t("pendingApproval"),
        approvedAmount: t("approvedAmount"),
        exportedAmount: t("exportedAmount"),
        clawbackAmount: t("clawbackAmount"),
      })}
    />
  )
}
