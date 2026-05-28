import "server-only"

import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import type { ListCellKind } from "@afenda/governed-surface/schemas/list-surface.schema"

import type { KpiPeriodRow, KpiScoreListRow } from "./kpi.queries.server"

const KPI_READ_PERMISSION = {
  module: "hrm" as const,
  object: "kpi" as const,
  function: "read" as const,
}

type KpiPeriodsListCopy = {
  empty: string
  colName: string
  colRange: string
  colState: string
  formatRange: (period: KpiPeriodRow) => string
}

export function buildKpiPeriodsListSurfaceConfiguration(
  periods: readonly KpiPeriodRow[],
  copy: KpiPeriodsListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: KPI_READ_PERMISSION,
    surface: {
      header: { title: "hrm-kpi-periods" },
      columnsId: "hrm-kpi-periods",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "name", header: copy.colName },
      { id: "range", header: copy.colRange },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: periods.map((period) => ({
      id: period.id,
      rowTone:
        period.state === "draft" || period.state === "active"
          ? "attention"
          : "default",
      cells: {
        name: period.name,
        range: copy.formatRange(period),
        state: period.state,
      },
    })),
  })
}

function kpiScoreAchievementMeter(
  score: KpiScoreListRow
): ListCellKind | undefined {
  if (score.scorePercent == null) return undefined
  const pct = Math.min(100, Math.max(0, Number.parseFloat(score.scorePercent)))
  if (!Number.isFinite(pct)) return undefined
  const rounded = Math.round(pct)
  return {
    kind: "meter",
    value: rounded,
    max: 100,
    label: `${rounded}%`,
  }
}

type KpiScoresListCopy = {
  empty: string
  colEmployee: string
  colMetric: string
  colTargets: string
  colAchievement: string
  formatTargets: (score: KpiScoreListRow) => string
}

export function buildKpiScoresListSurfaceConfiguration(
  scores: readonly KpiScoreListRow[],
  orgSlug: string,
  copy: KpiScoresListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: KPI_READ_PERMISSION,
    surface: {
      header: { title: "hrm-kpi-scores" },
      columnsId: "hrm-kpi-scores",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "metric", header: copy.colMetric },
      {
        id: "targets",
        header: copy.colTargets,
        cellKind: { kind: "semantic-text", tone: "default" },
      },
      { id: "achievement", header: copy.colAchievement },
    ],
    rows: scores.map((score) => {
      const meter = kpiScoreAchievementMeter(score)
      return {
        id: score.id,
        ...hrmEmployeeListRowLinkFields(orgSlug, score.employeeId, "employee"),
        rowTone:
          score.scorePercent != null && Number(score.scorePercent) < 70
            ? "attention"
            : "default",
        cellKinds: meter ? { achievement: meter } : undefined,
        cells: {
          employee: score.employeeLegalName,
          metric: score.metricCode,
          targets: copy.formatTargets(score),
          achievement:
            score.scorePercent != null ? `${score.scorePercent}%` : "—",
        },
      }
    }),
  })
}
