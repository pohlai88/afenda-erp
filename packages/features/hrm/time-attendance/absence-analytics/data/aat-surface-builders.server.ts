import "server-only"

import {
  buildGovernedStatGrid,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import type { GovernedChartConfigurationInput } from "@afenda/governed-surface/schemas/chart.schema"

import {
  formatAbsenceRatePercent,
  formatTrendDeltaPercent,
} from "./aat-analytics-engine.shared"
import type { AatOrgAnalyticsSnapshot } from "./aat-analytics.queries.server"

type AatKpiCopy = {
  absenceRate: string
  lostWorkdays: string
  absenceFrequency: string
  availability: string
  trend: string
  plannedVsUnplanned: string
  coverageRisk: string
  patternSignals: string
  trendDirectionLabel: string
  trendTone: "default" | "positive" | "attention"
}

export function buildAatKpiStatConfiguration(
  snapshot: AatOrgAnalyticsSnapshot,
  copy: AatKpiCopy
): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.absenceRate,
        value: formatAbsenceRatePercent(snapshot.absenceRate),
        delta: formatTrendDeltaPercent({
          currentRate: snapshot.absenceRate,
          priorRate: snapshot.priorAbsenceRate,
        }),
        comparison: {
          priorValue: formatAbsenceRatePercent(snapshot.priorAbsenceRate),
          label: "vs prior period",
          direction:
            snapshot.absenceRate > snapshot.priorAbsenceRate
              ? "up"
              : snapshot.absenceRate < snapshot.priorAbsenceRate
                ? "down"
                : "flat",
        },
        tone:
          copy.trendTone === "positive"
            ? "positive"
            : copy.trendTone === "attention"
              ? "attention"
              : "default",
      },
      {
        label: copy.lostWorkdays,
        value: snapshot.lostWorkdays.toFixed(1),
        delta: `${snapshot.calendarDays} calendar days`,
        tone: "default",
      },
      {
        label: copy.absenceFrequency,
        value: String(snapshot.absenceFrequency),
        delta: `${snapshot.activeEmployeeCount} active employees`,
        tone: "default",
      },
      {
        label: copy.availability,
        value: formatAbsenceRatePercent(snapshot.availabilityRate),
        delta: snapshot.coverageRisk
          ? copy.coverageRisk
          : copy.trendDirectionLabel,
        tone: snapshot.coverageRisk ? "attention" : "positive",
        href: snapshot.coverageRisk
          ? "#aat-high-risk-employees-section"
          : undefined,
      },
      {
        label: copy.plannedVsUnplanned,
        value: `${snapshot.plannedLostWorkdays.toFixed(1)} / ${snapshot.unplannedLostWorkdays.toFixed(1)}`,
        delta: copy.patternSignals,
        tone:
          snapshot.unplannedLostWorkdays > snapshot.plannedLostWorkdays
            ? "attention"
            : "default",
      },
    ],
  })
}

export function buildAatTrendChartConfiguration(
  snapshot: AatOrgAnalyticsSnapshot,
  title: string
): GovernedChartConfigurationInput {
  const points =
    snapshot.weeklyTrend.length > 0
      ? snapshot.weeklyTrend.map((point) => ({
          x: point.weekLabel,
          y: point.lostWorkdays,
        }))
      : [{ x: snapshot.range.startDate.slice(0, 7), y: 0 }]

  return {
    dataNature: "time-series",
    chartKind: "area",
    title,
    series: [
      {
        id: "lost-workdays",
        label: title,
        color: "chart-1",
        points,
      },
    ],
  }
}

export function buildAatDailyHeatmapChartConfiguration(
  snapshot: AatOrgAnalyticsSnapshot,
  copy: { title: string; description: string; elevatedBandLabel: string }
): GovernedChartConfigurationInput {
  const cells = snapshot.dailyHeatmap.map((point) => ({
    date: point.date,
    value: point.lostWorkdays,
  }))
  const maxLost = cells.reduce(
    (peak, cell) => (cell.value > peak ? cell.value : peak),
    0
  )
  const peakCell =
    maxLost > 0
      ? cells.reduce((best, cell) => (cell.value > best.value ? cell : best))
      : null

  return {
    dataNature: "categorical",
    chartKind: "heatmap",
    title: copy.title,
    description: copy.description,
    drilldownHref: "#aat-high-risk-employees-section",
    heatmap: {
      valueLabel: copy.title,
      cells,
    },
    referenceBands:
      maxLost > 0
        ? [
            {
              yMin: Math.max(1, maxLost * 0.5),
              yMax: maxLost,
              label: copy.elevatedBandLabel,
            },
          ]
        : undefined,
    annotations:
      peakCell != null
        ? [
            {
              label: `Peak ${peakCell.date}`,
              x: peakCell.date,
              y: peakCell.value,
              tone: "attention",
            },
          ]
        : undefined,
  }
}
