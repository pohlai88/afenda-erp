import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { listTrainingFeedbackAggregatesForOrg } from "../data/training-analytics.queries.server"
import { buildTrainingFeedbackListSurfaceConfiguration } from "../data/training-list-surface.server"

type TrainingFeedbackSectionProps = {
  readonly organizationId: string
}

export async function TrainingFeedbackSection({
  organizationId,
}: TrainingFeedbackSectionProps) {
  const [t, rows] = await Promise.all([
    getTranslations("Erp.Hrm.training"),
    listTrainingFeedbackAggregatesForOrg(organizationId),
  ])

  const listConfiguration = buildTrainingFeedbackListSurfaceConfiguration(
    rows,
    {
      empty: t("feedbackSummaryEmpty"),
      colCourse: t("colCourse"),
      colCount: t("feedbackSummaryCount"),
      colAverage: t("feedbackSummaryAverage"),
    }
  )

  return (
    <GovernedPatternCListSection
      title={t("feedbackSummaryTitle")}
      description={t("feedbackSummaryDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:training:feedback"
      cardClassName="mt-0"
    />
  )
}
