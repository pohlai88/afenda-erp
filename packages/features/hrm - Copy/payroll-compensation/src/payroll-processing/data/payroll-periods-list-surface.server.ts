import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { PayrollConsolePeriod } from "./payroll-console-view.shared"

type PayrollPeriodsListCopy = {
  empty: string
  colPeriod: string
  colPaymentDate: string
  colCurrency: string
  colState: string
  colRulePack: string
  stateLabelFor: (state: string) => string
}

export function buildPayrollPeriodsListSurfaceConfiguration(
  periods: readonly PayrollConsolePeriod[],
  copy: PayrollPeriodsListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      primaryColumnId: "period",
      narrowMode: "auto",
    },
    surface: {
      header: { title: "hrm-payroll-periods" },
      columnsId: "hrm-payroll-periods",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "period",
        header: copy.colPeriod,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 200,
      },
      { id: "paymentDate", header: copy.colPaymentDate },
      { id: "currency", header: copy.colCurrency },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "rulePack", header: copy.colRulePack, wrap: true },
    ],
    rows: periods.map((period) => ({
      id: period.id,
      rowHref: `#payroll-period-${period.id}`,
      cells: {
        period: `${period.periodStart} – ${period.periodEnd}`,
        paymentDate: period.paymentDate,
        currency: period.currency,
        state: copy.stateLabelFor(period.state),
        rulePack: period.rulePackVersion ?? "—",
      },
    })),
  })
}
