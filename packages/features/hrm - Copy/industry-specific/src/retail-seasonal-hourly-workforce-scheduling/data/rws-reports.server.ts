import "server-only"

import { listRwsCoverageGapsForPeriod } from "./rws-coverage.server"
import { listRwsOpenShiftOffersForOrg } from "./rws-open-shift.server"
import { listRwsSchedulePeriodsForOrg } from "./rws-periods.server"
import { listRwsStoresForOrg } from "./rws-stores.server"

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function buildRwsOrgReportCsv(input: {
  organizationId: string
  reportKind: "coverage" | "periods" | "open_shifts" | "labor_summary"
}): Promise<{ csv: string; filename: string; rowCount: number }> {
  const stamp = new Date().toISOString().slice(0, 10)

  if (input.reportKind === "periods") {
    const rows = await listRwsSchedulePeriodsForOrg(input.organizationId)
    const header = [
      "code",
      "name",
      "store",
      "kind",
      "state",
      "start",
      "end",
    ]
    const lines = [
      header.join(","),
      ...rows.map((row) =>
        [
          escapeCsvCell(row.code),
          escapeCsvCell(row.name),
          escapeCsvCell(row.storeLabel),
          escapeCsvCell(row.periodKind),
          escapeCsvCell(row.state),
          escapeCsvCell(row.periodStartDate),
          escapeCsvCell(row.periodEndDate),
        ].join(",")
      ),
    ]
    return {
      csv: lines.join("\n"),
      filename: `retail-scheduling-periods-${stamp}.csv`,
      rowCount: rows.length,
    }
  }

  if (input.reportKind === "open_shifts") {
    const rows = await listRwsOpenShiftOffersForOrg(input.organizationId)
    const header = ["store", "date", "role", "claim_mode", "status"]
    const lines = [
      header.join(","),
      ...rows.map((row) =>
        [
          escapeCsvCell(row.storeLabel),
          escapeCsvCell(row.slotDate),
          escapeCsvCell(row.retailRole),
          escapeCsvCell(row.claimMode),
          escapeCsvCell(row.status),
        ].join(",")
      ),
    ]
    return {
      csv: lines.join("\n"),
      filename: `retail-scheduling-open-shifts-${stamp}.csv`,
      rowCount: rows.length,
    }
  }

  if (input.reportKind === "coverage") {
    const periods = await listRwsSchedulePeriodsForOrg(input.organizationId)
    const header = [
      "period",
      "date",
      "hour",
      "role",
      "required",
      "scheduled",
      "status",
    ]
    const gapRows: string[] = []
    for (const period of periods) {
      const gaps = await listRwsCoverageGapsForPeriod({
        organizationId: input.organizationId,
        schedulePeriodId: period.id,
        periodStartDate: period.periodStartDate,
        periodEndDate: period.periodEndDate,
      })
      for (const gap of gaps) {
        gapRows.push(
          [
            escapeCsvCell(period.code),
            escapeCsvCell(gap.slotDate),
            escapeCsvCell(String(gap.hourOfDay)),
            escapeCsvCell(gap.retailRole),
            escapeCsvCell(String(gap.requiredHeadcount)),
            escapeCsvCell(String(gap.scheduledHeadcount)),
            escapeCsvCell(gap.status),
          ].join(",")
        )
      }
    }
    const lines = [header.join(","), ...gapRows]
    return {
      csv: lines.join("\n"),
      filename: `retail-scheduling-coverage-${stamp}.csv`,
      rowCount: gapRows.length,
    }
  }

  const stores = await listRwsStoresForOrg(input.organizationId)
  const header = ["code", "name", "branch", "active"]
  const lines = [
    header.join(","),
    ...stores.map((row) =>
      [
        escapeCsvCell(row.code),
        escapeCsvCell(row.name),
        escapeCsvCell(row.branchRef ?? ""),
        escapeCsvCell(row.active ? "yes" : "no"),
      ].join(",")
    ),
  ]
  return {
    csv: lines.join("\n"),
    filename: `retail-scheduling-summary-${stamp}.csv`,
    rowCount: stores.length,
  }
}
