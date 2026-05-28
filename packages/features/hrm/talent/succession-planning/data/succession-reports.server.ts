import "server-only"

import { listSuccessionBenchStrength } from "./succession-bench.server"
import { listSuccessionCriticalRolesForOrg } from "./succession-critical-roles.server"
import { listSuccessionNominationsForOrg } from "./succession-nominations.server"

function csvEscape(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value)
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function toCsv(headers: readonly string[], rows: readonly (readonly string[])[]): {
  csv: string
  rowCount: number
} {
  const lines = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")),
  ]
  return { csv: lines.join("\n"), rowCount: rows.length }
}

export async function buildSuccessionOrgReportCsv(input: {
  organizationId: string
  reportKind: "critical_roles" | "nominations" | "bench_strength" | "risk_flags"
}): Promise<{ csv: string; filename: string; rowCount: number }> {
  const stamp = new Date().toISOString().slice(0, 10)

  if (input.reportKind === "critical_roles") {
    const rows = await listSuccessionCriticalRolesForOrg(input.organizationId)
    const report = toCsv(
      [
        "code",
        "title",
        "business_impact",
        "vacancy_risk",
        "leadership_level",
        "incumbent",
        "active",
      ],
      rows.map((row) => [
        row.code,
        row.title,
        row.businessImpact,
        row.vacancyRisk,
        row.leadershipLevel,
        row.incumbentLabel ?? "",
        row.active ? "yes" : "no",
      ])
    )
    return {
      ...report,
      filename: `succession-critical-roles-${stamp}.csv`,
    }
  }

  if (input.reportKind === "nominations") {
    const rows = await listSuccessionNominationsForOrg(input.organizationId)
    const report = toCsv(
      [
        "role",
        "candidate",
        "successor_type",
        "readiness_level",
        "status",
      ],
      rows.map((row) => [
        row.criticalRoleTitle,
        row.candidateLabel,
        row.successorType,
        row.readinessLevel,
        row.status,
      ])
    )
    return {
      ...report,
      filename: `succession-nominations-${stamp}.csv`,
    }
  }

  const benchRows = await listSuccessionBenchStrength(input.organizationId)
  const filtered =
    input.reportKind === "risk_flags"
      ? benchRows.filter((row) => row.flags.length > 0)
      : benchRows

  const report = toCsv(
    [
      "role",
      "leadership_level",
      "vacancy_risk",
      "nominations",
      "ready_now",
      "bench_score",
      "risk_level",
      "flags",
    ],
    filtered.map((row) => [
      row.criticalRoleTitle,
      row.leadershipLevel,
      row.vacancyRisk,
      String(row.nominationCount),
      String(row.readyNowCount),
      String(row.benchStrengthScore),
      row.riskLevel,
      row.flags.join("|"),
    ])
  )

  return {
    ...report,
    filename:
      input.reportKind === "risk_flags"
        ? `succession-risk-flags-${stamp}.csv`
        : `succession-bench-strength-${stamp}.csv`,
  }
}
