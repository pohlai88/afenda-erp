import { getTranslations } from "next-intl/server"

import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server"

import { getTrainingAnalyticsSummary } from "../data/training-analytics.queries.server"
import {
  buildTrainingAnalyticsCourseListSurfaceConfiguration,
  buildTrainingAnalyticsStatConfiguration,
  TRAINING_ANALYTICS_STAT_SURFACE_KEY,
} from "../data/training-list-surface.server"

type TrainingAnalyticsSectionProps = {
  readonly organizationId: string
}

export async function TrainingAnalyticsSection({
  organizationId,
}: TrainingAnalyticsSectionProps) {
  const [t, summary] = await Promise.all([
    getTranslations("Erp.Hrm.training"),
    getTrainingAnalyticsSummary(organizationId),
  ])

  const statConfiguration = buildTrainingAnalyticsStatConfiguration(summary, {
    openAssignments: t("analyticsOpenAssignments"),
    totalRecords: t("analyticsTotalRecords"),
    expiring90: t("analyticsExpiring90"),
    totalCost: t("analyticsTotalCost"),
    lmsLinkedCourses: t("analyticsLmsLinkedCourses"),
    lmsLinkedCompletions: t("analyticsLmsLinkedCompletions"),
  })

  const listConfiguration =
    buildTrainingAnalyticsCourseListSurfaceConfiguration(summary.courseStats, {
      empty: t("analyticsCoursesEmpty"),
      colCourse: t("colCourse"),
      colCompletionRate: t("analyticsCompletionRate"),
      colAssignments: t("analyticsAssignments"),
      colCompletions: t("analyticsCompletions"),
      exportReport: t("analyticsExportReport"),
    })

  return (
    <div className="flex flex-col gap-4">
      <GovernedPatternBStatSection
        title=""
        layout="embedded"
        surfaceKey={TRAINING_ANALYTICS_STAT_SURFACE_KEY}
        statGroups={[
          {
            groupKey: "summary",
            configuration: statConfiguration,
          },
        ]}
      />
      <GovernedPatternCListSection
        title={t("analyticsTitle")}
        description={t("analyticsDescription")}
        listConfiguration={listConfiguration}
        surfaceKey="hrm:training:analytics-courses"
        cardClassName="mt-0"
      />
    </div>
  )
}
