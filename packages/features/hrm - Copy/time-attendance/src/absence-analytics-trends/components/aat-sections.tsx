import { getTranslations } from "next-intl/server"

import {
  matchesGovernedWorkbenchFocus,
  type EmptyState,
} from "@afenda/governed-surface"
import {
  GovernedPatternBChartSection,
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server"

import {
  buildAatDepartmentRankingListSurface,
  buildAatExceptionTrendsListSurface,
  buildAatHighRiskEmployeesListSurface,
  buildAatLeaveTypeBreakdownListSurface,
} from "../data/aat-list-surface.server"
import type { AatOrgAnalyticsSnapshot } from "../data/aat-analytics.queries.server"
import {
  aatRiskTierMessageKey,
  aatTrendStatTone,
} from "../data/aat-display.shared"
import type { AatRiskTier } from "../schemas/aat.schema"
import {
  AAT_CHART_SURFACE_KEY,
  AAT_HEATMAP_SURFACE_KEY,
  AAT_LIST_SURFACE_IDS,
  AAT_STAT_SURFACE_KEY,
} from "../data/aat-surface-metadata.shared"
import {
  buildAatDailyHeatmapChartConfiguration,
  buildAatKpiStatConfiguration,
  buildAatTrendChartConfiguration,
} from "../data/aat-surface-builders.server"

type AatLoadFailure = {
  readonly title: string
  readonly description?: string
}

type AatAnalyticsSectionsProps = {
  snapshot: AatOrgAnalyticsSnapshot
  loadFailure?: AatLoadFailure
}

function toAatLoadError(
  loadFailure: AatLoadFailure | undefined
): EmptyState | undefined {
  if (!loadFailure) return undefined
  return {
    variant: "error",
    title: loadFailure.title,
    description: loadFailure.description,
  }
}

function toAatChartLoadError(
  loadFailure: AatLoadFailure | undefined,
  chartTitle: string
): EmptyState | undefined {
  if (!loadFailure) return undefined
  return {
    variant: "error",
    title: chartTitle,
    description: loadFailure.description ?? loadFailure.title,
  }
}

export async function AatKpiSummarySection({
  snapshot,
  loadFailure,
}: AatAnalyticsSectionsProps) {
  const t = await getTranslations("Erp.Hrm.absenceAnalytics")

  const configuration = buildAatKpiStatConfiguration(snapshot, {
    absenceRate: t("kpiAbsenceRate"),
    lostWorkdays: t("kpiLostWorkdays"),
    absenceFrequency: t("kpiFrequency"),
    availability: t("kpiAvailability"),
    trend: t("kpiTrend"),
    plannedVsUnplanned: t("kpiPlannedUnplanned"),
    coverageRisk: t("coverageRiskFlag"),
    patternSignals: t("patternSignalsSummary", {
      mondayFriday: snapshot.mondayFridayAbsenceCount,
      shortAbsence: snapshot.shortAbsencePatternCount,
      holidayAdjacent: snapshot.holidayAdjacentAbsenceCount,
    }),
    trendDirectionLabel: t(`trendDirection.${snapshot.trendDirection}`),
    trendTone: aatTrendStatTone(snapshot.trendDirection),
  })

  return (
    <GovernedPatternBStatSection
      title=""
      layout="embedded"
      surfaceKey={AAT_STAT_SURFACE_KEY}
      loadError={toAatLoadError(loadFailure)}
      statGroups={[
        {
          groupKey: "summary",
          configuration,
        },
      ]}
    />
  )
}

export async function AatTrendChartSection({
  snapshot,
  loadFailure,
}: AatAnalyticsSectionsProps) {
  const t = await getTranslations("Erp.Hrm.absenceAnalytics")

  return (
    <GovernedPatternBChartSection
      title={t("trendChartTitle")}
      description={t("trendChartDescription")}
      surfaceKey={AAT_CHART_SURFACE_KEY}
      loadError={toAatChartLoadError(loadFailure, t("trendChartTitle"))}
      chartConfiguration={buildAatTrendChartConfiguration(
        snapshot,
        t("trendChartTitle")
      )}
      cardClassName="mt-0"
    />
  )
}

export async function AatDailyHeatmapSection({
  snapshot,
  loadFailure,
}: AatAnalyticsSectionsProps) {
  const t = await getTranslations("Erp.Hrm.absenceAnalytics")

  return (
    <GovernedPatternBChartSection
      title={t("heatmapTitle")}
      description={t("heatmapDescription")}
      surfaceKey={AAT_HEATMAP_SURFACE_KEY}
      loadError={toAatChartLoadError(loadFailure, t("heatmapTitle"))}
      chartConfiguration={buildAatDailyHeatmapChartConfiguration(snapshot, {
        title: t("heatmapTitle"),
        description: t("heatmapDescription"),
        elevatedBandLabel: t("heatmapElevatedBandLabel"),
      })}
      cardClassName="mt-0"
    />
  )
}

export async function AatLeaveTypeBreakdownSection({
  snapshot,
  loadFailure,
}: AatAnalyticsSectionsProps) {
  const t = await getTranslations("Erp.Hrm.absenceAnalytics")

  return (
    <GovernedPatternCListSection
      title={t("leaveTypeTitle")}
      description={t("leaveTypeDescription")}
      surfaceKey={AAT_LIST_SURFACE_IDS.leaveTypeBreakdown}
      loadError={toAatLoadError(loadFailure)}
      listConfiguration={buildAatLeaveTypeBreakdownListSurface(
        snapshot.leaveTypeBreakdown,
        {
          empty: t("leaveTypeEmpty"),
          colLeaveType: t("colLeaveType"),
          colLostDays: t("colLostDays"),
          colFrequency: t("colFrequency"),
          labelFor: (code) => t("leaveTypeCodeLabel", { code }),
        }
      )}
    />
  )
}

export async function AatDepartmentRankingSection({
  snapshot,
  loadFailure,
}: AatAnalyticsSectionsProps) {
  const t = await getTranslations("Erp.Hrm.absenceAnalytics")
  const riskLabelFor = (tier: AatRiskTier) => t(aatRiskTierMessageKey(tier))

  return (
    <GovernedPatternCListSection
      title={t("departmentTitle")}
      description={t("departmentDescription")}
      surfaceKey={AAT_LIST_SURFACE_IDS.departmentRanking}
      loadError={toAatLoadError(loadFailure)}
      listConfiguration={buildAatDepartmentRankingListSurface(
        snapshot.departmentRanking,
        {
          empty: t("departmentEmpty"),
          colDepartment: t("colDepartment"),
          colEmployees: t("colEmployees"),
          colLostDays: t("colLostDays"),
          colRate: t("colRate"),
          colRisk: t("colRisk"),
          riskLabelFor,
        }
      )}
    />
  )
}

export async function AatHighRiskEmployeesSection({
  orgSlug,
  snapshot,
  loadFailure,
  workbenchFocus,
}: AatAnalyticsSectionsProps & {
  orgSlug: string
  workbenchFocus?: string | null
}) {
  const t = await getTranslations("Erp.Hrm.absenceAnalytics")
  const riskLabelFor = (tier: AatRiskTier) => t(aatRiskTierMessageKey(tier))
  const filteredRows = snapshot.highRiskEmployees.filter((row) =>
    matchesGovernedWorkbenchFocus(
      workbenchFocus,
      row.employeeLabel,
      row.departmentName,
      row.recentAbsenceReason,
      row.patternFlags.join(" ")
    )
  )

  return (
    <div id="aat-high-risk-employees-section">
      <GovernedPatternCListSection
        title={t("highRiskTitle")}
        description={t("highRiskDescription")}
        surfaceKey={AAT_LIST_SURFACE_IDS.highRiskEmployees}
        loadError={toAatLoadError(loadFailure)}
        listConfiguration={buildAatHighRiskEmployeesListSurface(
          filteredRows,
          orgSlug,
          {
            empty: t("highRiskEmpty"),
            colEmployee: t("colEmployee"),
            colDepartment: t("colDepartment"),
            colFrequency: t("colFrequency"),
            colLostDays: t("colLostDays"),
            colRate: t("colRate"),
            colRisk: t("colRisk"),
            colPatterns: t("colPatterns"),
            colReason: t("colReason"),
            riskLabelFor,
            exportReportLabel: t("exportReport"),
          },
          {
            workbenchFocusSearch: {
              label: t("toolbarSearchLabel"),
              placeholder: t("toolbarSearchPlaceholder"),
              value: workbenchFocus,
            },
          }
        )}
      />
    </div>
  )
}

export async function AatExceptionTrendsSection({
  snapshot,
  loadFailure,
}: AatAnalyticsSectionsProps) {
  const t = await getTranslations("Erp.Hrm.absenceAnalytics")

  return (
    <GovernedPatternCListSection
      title={t("exceptionTitle")}
      description={t("exceptionDescription")}
      surfaceKey={AAT_LIST_SURFACE_IDS.exceptionTrends}
      loadError={toAatLoadError(loadFailure)}
      listConfiguration={buildAatExceptionTrendsListSurface(
        snapshot.exceptionTrends,
        {
          empty: t("exceptionEmpty"),
          colKind: t("colExceptionKind"),
          colCount: t("colCount"),
          labelFor: (kind) => {
            switch (kind) {
              case "late_arrival":
                return t("exceptionLate")
              case "early_departure":
                return t("exceptionEarly")
              case "absence":
                return t("exceptionAbsence")
              case "missing_punch":
                return t("exceptionMissingPunch")
              default:
                return kind
            }
          },
        }
      )}
    />
  )
}
