import "server-only"

import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import { employeePortalPath } from "@afenda/platform/portal"

import type { PayrollPayslipSnapshot } from "@afenda/feature-hrm-payroll-compensation/server"

export type PayslipListRowInput = {
  readonly id: string
  readonly title: string
  readonly periodEndLabel: string
  readonly paymentDateLabel: string
  readonly netPayLabel: string
  readonly grossPayLabel: string
  readonly generatedAtLabel: string
}

type PayslipListCopy = {
  eyebrow: string
  title: string
  description: string
  empty: string
  colTitle: string
  colPeriod: string
  colPaymentDate: string
  colNetPay: string
  colGrossPay: string
  colGenerated: string
}

export function buildPayslipListSurfaceConfiguration(
  rows: readonly PayslipListRowInput[],
  portalSlug: string,
  copy: PayslipListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    surface: {
      header: {
        eyebrow: copy.eyebrow,
        title: copy.title,
        description: copy.description,
      },
      columnsId: "ess-payslips",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "period", header: copy.colPeriod },
      { id: "paymentDate", header: copy.colPaymentDate },
      { id: "netPay", header: copy.colNetPay, align: "end" },
      { id: "grossPay", header: copy.colGrossPay, align: "end" },
      { id: "generatedAt", header: copy.colGenerated },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      linkColumnId: "title",
      rowHref: `${employeePortalPath(portalSlug, "payslips")}/${row.id}`,
      cells: {
        title: row.title,
        period: row.periodEndLabel,
        paymentDate: row.paymentDateLabel,
        netPay: row.netPayLabel,
        grossPay: row.grossPayLabel,
        generatedAt: row.generatedAtLabel,
      },
    })),
  })
}

type PayslipLinesCopy = {
  eyebrow: string
  title: string
  description: string
  colKind: string
  colCode: string
  colDescription: string
  colAmount: string
}

function formatLineKind(lineKind: string): string {
  return lineKind.replaceAll("_", " ")
}

export function buildPayslipLinesSurfaceConfiguration(
  snapshot: PayrollPayslipSnapshot,
  copy: PayslipLinesCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    surface: {
      header: {
        eyebrow: copy.eyebrow,
        title: copy.title,
        description: copy.description,
      },
      columnsId: "ess-payslip-lines",
      rowKey: "id",
      empty: { variant: "muted", title: "No lines in this payslip." },
    },
    columns: [
      { id: "kind", header: copy.colKind },
      { id: "code", header: copy.colCode },
      { id: "description", header: copy.colDescription },
      { id: "amount", header: copy.colAmount, align: "end" },
    ],
    rows: snapshot.lines.map((line, index) => ({
      id: `${line.code}-${index}`,
      cells: {
        kind: formatLineKind(line.lineKind),
        code: line.code,
        description: line.description,
        amount: `${line.amount} ${snapshot.currency}`,
      },
    })),
  })
}

type PayslipSummaryCopy = {
  labelGross: string
  labelNet: string
  labelDeductions: string
  labelEmployerCost: string
}

function employeeDeductionsTotal(snapshot: PayrollPayslipSnapshot): string {
  const total = snapshot.lines
    .filter((line) => line.lineKind === "employee_deduction")
    .reduce((sum, line) => sum + Math.abs(Number.parseFloat(line.amount)), 0)
  return total.toFixed(2)
}

export function buildPayslipSummaryStatConfiguration(
  snapshot: PayrollPayslipSnapshot,
  copy: PayslipSummaryCopy
): StatCardConfigurationInput {
  const periodLabel = `${snapshot.periodStart} – ${snapshot.periodEnd}`
  const deductions = employeeDeductionsTotal(snapshot)

  return buildGovernedStatGrid({
    presentationProfile: "erp-kpi-grid",
    dataNature: "kpi",
    stats: [
      {
        label: copy.labelGross,
        value: `${snapshot.grossPay} ${snapshot.currency}`,
        delta: periodLabel,
        tone: "default",
      },
      {
        label: copy.labelDeductions,
        value: `−${deductions} ${snapshot.currency}`,
        delta: snapshot.rulePackVersion ?? "—",
        tone: "attention",
      },
      {
        label: copy.labelNet,
        value: `${snapshot.netPay} ${snapshot.currency}`,
        delta: `Payment ${snapshot.paymentDate}`,
        tone: "positive",
      },
      {
        label: copy.labelEmployerCost,
        value: `${snapshot.employerCost} ${snapshot.currency}`,
        delta: `${snapshot.employeeLegalName} · ${snapshot.employeeNumber}`,
        tone: "default",
      },
    ],
  })
}
