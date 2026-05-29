import type { EngagementAnalyticsSnapshot } from "../schemas/engagement-analytics.shared"
import type { EngagementImprovementActionListRow } from "../schemas/engagement-query.shared"

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function csvRow(cells: readonly string[]): string {
  return cells.map(csvEscape).join(",")
}

export function buildEngagementAnalyticsReportCsv(
  snapshot: EngagementAnalyticsSnapshot,
  improvementRows: readonly EngagementImprovementActionListRow[] = []
): string {
  const lines: string[] = [
    csvRow([
      "section",
      "key",
      "label",
      "value",
      "response_count",
      "suppressed",
    ]),
    csvRow([
      "summary",
      "engagement_index",
      "Engagement index",
      snapshot.engagementIndex == null ? "" : String(snapshot.engagementIndex),
      String(snapshot.submittedCount),
      "false",
    ]),
    csvRow([
      "summary",
      "satisfaction_index",
      "Satisfaction index",
      snapshot.satisfactionIndex == null
        ? ""
        : String(snapshot.satisfactionIndex),
      String(snapshot.submittedCount),
      "false",
    ]),
    csvRow([
      "summary",
      "enps",
      "eNPS",
      snapshot.enps == null ? "" : String(snapshot.enps),
      String(snapshot.submittedCount),
      "false",
    ]),
    csvRow([
      "summary",
      "response_rate",
      "Response rate %",
      String(snapshot.responseRatePercent),
      String(snapshot.invitedCount),
      "false",
    ]),
  ]

  if (snapshot.trend) {
    lines.push(
      csvRow([
        "trend",
        "engagement_delta",
        "Engagement index delta vs prior",
        snapshot.trend.engagementIndexDelta == null
          ? ""
          : String(snapshot.trend.engagementIndexDelta),
        "",
        "false",
      ])
    )
  }

  for (const row of snapshot.categoryAverages) {
    lines.push(
      csvRow([
        "category",
        row.category,
        row.category,
        row.average == null ? "" : String(row.average),
        String(row.responseCount),
        String(row.suppressed),
      ])
    )
  }

  const segmentDimensions = [
    ["department", snapshot.segmentScores.department],
    ["location", snapshot.segmentScores.location],
    ["manager", snapshot.segmentScores.manager],
    ["grade", snapshot.segmentScores.grade],
    ["tenure", snapshot.segmentScores.tenure],
    ["employment_type", snapshot.segmentScores.employmentType],
    ["worker_category", snapshot.segmentScores.workerCategory],
  ] as const

  for (const [dimension, rows] of segmentDimensions) {
    for (const row of rows) {
      lines.push(
        csvRow([
          dimension,
          row.segmentKey,
          row.label,
          row.average == null ? "" : String(row.average),
          String(row.responseCount),
          String(row.suppressed),
        ])
      )
    }
  }

  if (snapshot.benchmark.externalReference) {
    lines.push(
      csvRow([
        "benchmark",
        "external",
        "External reference",
        snapshot.benchmark.externalReference,
        "",
        "false",
      ])
    )
  }

  for (const row of snapshot.riskSegments) {
    lines.push(
      csvRow([
        "risk",
        `${row.dimension}:${row.segmentKey}`,
        row.label,
        String(row.average),
        String(row.responseCount),
        "false",
      ])
    )
  }

  for (const row of improvementRows) {
    lines.push(
      csvRow([
        "improvement",
        row.id,
        row.title,
        row.status,
        row.dueDate ?? "",
        String(row.isOverdue),
      ])
    )
    lines.push(
      csvRow([
        "improvement_owner",
        row.id,
        row.ownerLabel ?? "Unassigned",
        row.priority ?? "",
        row.category ?? "",
        "false",
      ])
    )
  }

  return `${lines.join("\n")}\n`
}
