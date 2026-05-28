import { getTranslations } from "next-intl/server"

import {
  GovernedPatternBListSection,
  GovernedPatternBStatSection,
} from "@afenda/governed-surface/server"
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card"

import { toEngagementListLoadError } from "../data/engagement-load-error.shared"
import type { EngagementLoadError } from "../data/engagement-load-error.shared"
import type { EngagementCycleHistoryRow } from "../data/engagement-analytics.server"
import {
  buildEngagementCategoryScoresListSurfaceConfiguration,
  buildEngagementCycleHistoryListSurfaceConfiguration,
  buildEngagementOverviewStatConfiguration,
  buildEngagementSegmentScoresListSurfaceConfiguration,
  ENGAGEMENT_CATEGORY_SCORES_SURFACE_KEY,
  ENGAGEMENT_CYCLE_HISTORY_SURFACE_KEY,
  ENGAGEMENT_DASHBOARD_SURFACE_KEY,
  ENGAGEMENT_SEGMENT_SCORES_SURFACE_KEY,
} from "../data/engagement-surface-builders.server"
import type { EngagementAnalyticsSnapshot } from "../schemas/engagement-analytics.shared"
import {
  EngagementAnalyticsExportButton,
  GenerateEngagementAnalyticsForm,
  TagEngagementOpenTextForm,
} from "./engagement-analytics-forms.client"

type AnalyticsSectionBase = {
  surveyId: string
  parentAccessAllowed: boolean
  loadError?: EngagementLoadError
  canGenerateAnalytics: boolean
  canExportAnalytics: boolean
}

function formatTrendDelta(delta: number | null): string {
  if (delta == null) return "—"
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta}`
}

function trendTone(delta: number | null): "default" | "positive" | "attention" {
  if (delta == null || delta === 0) return "default"
  return delta > 0 ? "positive" : "attention"
}

export async function EngagementAnalyticsOverviewSection({
  surveyId,
  snapshot,
  parentAccessAllowed,
  loadError,
  canGenerateAnalytics,
  canExportAnalytics,
}: AnalyticsSectionBase & {
  snapshot: EngagementAnalyticsSnapshot | null
}) {
  const t = await getTranslations(
    "Erp.Hrm.employeeEngagement.distribution.analytics"
  )

  if (!parentAccessAllowed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("overviewTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("forbiddenDescription")}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("overviewTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{loadError.title}</p>
        </CardContent>
      </Card>
    )
  }

  if (!snapshot) {
    return (
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{t("overviewTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("overviewEmptyDescription")}
            </p>
          </div>
          <GenerateEngagementAnalyticsForm
            surveyId={surveyId}
            canGenerate={canGenerateAnalytics}
          />
        </CardHeader>
      </Card>
    )
  }

  const statGroups = [
    {
      groupKey: "primary",
      configuration: buildEngagementOverviewStatConfiguration(snapshot, {
        engagementIndex: t("kpiEngagementIndex"),
        satisfactionIndex: t("kpiSatisfactionIndex"),
        enps: t("kpiEnps"),
        responseRate: t("kpiResponseRate"),
        promoters: t("kpiEnpsBreakdown", {
          promoters: snapshot.enpsPromoters,
          passives: snapshot.enpsPassives,
          detractors: snapshot.enpsDetractors,
        }),
        trendEngagement: t("trendEngagement"),
        trendEnps: t("trendEnps"),
        trendUnavailable: t("trendUnavailable"),
        formatDelta: formatTrendDelta,
        trendTone,
        comparisonLabel: t("comparisonPriorCycle"),
      }),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <GenerateEngagementAnalyticsForm
          surveyId={surveyId}
          canGenerate={canGenerateAnalytics}
        />
        <EngagementAnalyticsExportButton
          surveyId={surveyId}
          canExport={canExportAnalytics}
        />
      </div>
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        description={t("overviewDescription", {
          generatedAt: snapshot.generatedAt.slice(0, 10),
        })}
        surfaceKey={ENGAGEMENT_DASHBOARD_SURFACE_KEY}
        statGroups={statGroups}
        layout="card"
      />
      {snapshot.benchmark.priorSurveyTitle ? (
        <Alert>
          <AlertTitle>{t("benchmarkTitle")}</AlertTitle>
          <AlertDescription>
            {t("benchmarkDescription", {
              priorTitle: snapshot.benchmark.priorSurveyTitle,
              priorIndex:
                snapshot.benchmark.priorEngagementIndex == null
                  ? "—"
                  : String(snapshot.benchmark.priorEngagementIndex),
            })}
          </AlertDescription>
        </Alert>
      ) : null}
      {snapshot.riskSegments.length > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>{t("riskTitle")}</AlertTitle>
          <AlertDescription>
            {t("riskDescription", { count: snapshot.riskSegments.length })}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

export async function EngagementCategoryScoresSection({
  snapshot,
  parentAccessAllowed,
  loadError,
}: Omit<
  AnalyticsSectionBase,
  "surveyId" | "canGenerateAnalytics" | "canExportAnalytics"
> & {
  snapshot: EngagementAnalyticsSnapshot | null
}) {
  const t = await getTranslations(
    "Erp.Hrm.employeeEngagement.distribution.analytics"
  )

  if (!snapshot || snapshot.categoryAverages.length === 0) return null

  const listConfiguration =
    buildEngagementCategoryScoresListSurfaceConfiguration(snapshot, {
      empty: t("categoriesEmpty"),
      colCategory: t("colCategory"),
      colAverage: t("colAverage"),
      colResponses: t("colResponses"),
      colSuppressed: t("colSuppressed"),
      suppressedYes: t("suppressedYes"),
      suppressedNo: t("suppressedNo"),
    })

  return (
    <div id="engagement-category-scores-section">
      <GovernedPatternBListSection
        title={t("categoriesTitle")}
        description={t("categoriesDescription")}
        surfaceKey={ENGAGEMENT_CATEGORY_SCORES_SURFACE_KEY}
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
        loadError={toEngagementListLoadError(loadError)}
        forbidden={{
          variant: "forbidden",
          title: t("forbiddenTitle"),
          description: t("forbiddenDescription"),
        }}
        invalid={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: t("invalidConfigDescription"),
        }}
      />
    </div>
  )
}

export async function EngagementSegmentScoresSection({
  surveyId,
  snapshot,
  parentAccessAllowed,
  loadError,
  canExportAnalytics,
}: Omit<AnalyticsSectionBase, "canGenerateAnalytics"> & {
  snapshot: EngagementAnalyticsSnapshot | null
}) {
  const t = await getTranslations(
    "Erp.Hrm.employeeEngagement.distribution.analytics"
  )

  if (!snapshot) return null

  const listConfiguration =
    buildEngagementSegmentScoresListSurfaceConfiguration(snapshot, {
      empty: t("segmentsEmpty"),
      colDimension: t("colDimension"),
      colSegment: t("colSegment"),
      colAverage: t("colAverage"),
      colResponses: t("colResponses"),
      colRisk: t("colRisk"),
      colSuppressed: t("colSuppressed"),
      formatDimension: (dimension) => t(`dimensionLabels.${dimension}`),
      riskYes: t("riskYes"),
      riskNo: t("riskNo"),
      suppressedYes: t("suppressedYes"),
      suppressedNo: t("suppressedNo"),
      exportReportLabel: canExportAnalytics ? t("exportAction") : undefined,
      surveyId,
    })

  return (
    <GovernedPatternBListSection
      title={t("segmentsTitle")}
      description={t("segmentsDescription")}
      surfaceKey={ENGAGEMENT_SEGMENT_SCORES_SURFACE_KEY}
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      loadError={toEngagementListLoadError(loadError)}
      forbidden={{
        variant: "forbidden",
        title: t("forbiddenTitle"),
        description: t("forbiddenDescription"),
      }}
      invalid={{
        variant: "error",
        title: t("invalidConfigTitle"),
        description: t("invalidConfigDescription"),
      }}
    />
  )
}

export async function EngagementOpenTextReviewSection({
  surveyId,
  snapshot,
  canGenerateAnalytics,
}: {
  surveyId: string
  snapshot: EngagementAnalyticsSnapshot | null
  canGenerateAnalytics: boolean
}) {
  const t = await getTranslations(
    "Erp.Hrm.employeeEngagement.distribution.analytics"
  )

  if (!snapshot) return null

  if (snapshot.anonymityMode === "anonymous") {
    if (snapshot.openText.anonymousSummaries.length === 0) return null
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("openTextTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("openTextAnonymousDescription")}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {snapshot.openText.anonymousSummaries.map((row) => (
            <p key={row.questionId} className="text-sm">
              {row.prompt}: {row.responseCount}{" "}
              {t("openTextResponseCountLabel")}
            </p>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (snapshot.openText.namedReviews.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("openTextTitle")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("openTextNamedDescription")}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {snapshot.openText.namedReviews.map((review) => (
          <div
            key={review.reviewId}
            className="flex flex-col gap-2 rounded-lg border border-border/60 p-3"
          >
            <p className="text-sm font-medium">{review.prompt}</p>
            <p className="text-sm text-muted-foreground">{review.excerpt}</p>
            {review.tags.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("openTextTagsLabel")}: {review.tags.join(", ")}
              </p>
            ) : null}
            <TagEngagementOpenTextForm
              surveyId={surveyId}
              reviewId={review.reviewId}
              initialTags={review.tags.join(", ")}
              canTag={canGenerateAnalytics}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export async function EngagementCycleHistorySection({
  rows,
  parentAccessAllowed,
  loadError,
}: {
  rows: readonly EngagementCycleHistoryRow[]
  parentAccessAllowed: boolean
  loadError?: EngagementLoadError
}) {
  const t = await getTranslations(
    "Erp.Hrm.employeeEngagement.distribution.analytics"
  )

  const listConfiguration = buildEngagementCycleHistoryListSurfaceConfiguration(
    rows,
    {
      empty: t("cycleHistoryEmpty"),
      colTitle: t("colCycleTitle"),
      colCycle: t("colCycle"),
      colState: t("colState"),
      colClosed: t("colClosed"),
      colEngagement: t("colEngagement"),
      colEnps: t("colEnps"),
      colGenerated: t("colGenerated"),
      formatState: (state) =>
        t(
          `surveyStateLabels.${state as "draft" | "scheduled" | "published" | "closed"}`
        ),
    }
  )

  return (
    <GovernedPatternBListSection
      title={t("cycleHistoryTitle")}
      description={t("cycleHistoryDescription")}
      surfaceKey={ENGAGEMENT_CYCLE_HISTORY_SURFACE_KEY}
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      loadError={toEngagementListLoadError(loadError)}
    />
  )
}
