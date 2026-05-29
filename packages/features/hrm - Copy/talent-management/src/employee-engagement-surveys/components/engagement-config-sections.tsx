import { getTranslations } from "next-intl/server"

import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import type { EngagementLoadError } from "../data/engagement-load-error.shared"
import { toEngagementListLoadError } from "../data/engagement-load-error.shared"
import { buildEngagementAudienceSegmentPreviewListSurfaceConfiguration } from "../data/engagement-surface-builders.server"
import type { EngagementSurveyCycleOption } from "../data/engagement-cycle.queries.server"
import type {
  EngagementAudienceFilterOptions,
  EngagementSurveyConfigurationDetail,
} from "../schemas/engagement-config.shared"
import { PublishEngagementSurveyForm } from "./engagement-distribution-forms.client"
import {
  RevertEngagementSurveyToDraftForm,
  SaveEngagementSurveyConfigurationForm,
  ScheduleEngagementSurveyForm,
} from "./engagement-config-forms.client"

export async function EngagementAudiencePreviewSection({
  survey,
  parentAccessAllowed,
  loadError,
}: {
  survey: EngagementSurveyConfigurationDetail
  parentAccessAllowed: boolean
  loadError?: EngagementLoadError
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.config")
  const rows = survey.audienceSnapshot?.segmentPreview ?? []

  const listConfiguration =
    buildEngagementAudienceSegmentPreviewListSurfaceConfiguration(rows, {
      empty: t("segmentPreviewEmpty"),
      colSegment: t("colSegment"),
      colCount: t("colCount"),
      colSuppressed: t("colSuppressed"),
      formatSuppressed: (suppressed) =>
        suppressed ? t("suppressedYes") : t("suppressedNo"),
    })

  const resolvedCount = survey.audienceSnapshot?.resolvedCount

  return (
    <GovernedPatternBListSection
      title={t("segmentPreviewTitle")}
      description={
        resolvedCount != null
          ? t("segmentPreviewDescription", { count: resolvedCount })
          : t("segmentPreviewDescriptionUnset")
      }
      surfaceKey="hrm:employee-engagement:audience-segments"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission
      loadError={toEngagementListLoadError(loadError)}
    />
  )
}

export async function EngagementConfigurationFormSection({
  survey,
  filterOptions,
  cycleOptions,
  canManage,
}: {
  survey: EngagementSurveyConfigurationDetail
  filterOptions: EngagementAudienceFilterOptions
  cycleOptions: readonly EngagementSurveyCycleOption[]
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.config")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t("configurationTitle")} — {survey.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SaveEngagementSurveyConfigurationForm
          survey={survey}
          filterOptions={filterOptions}
          cycleOptions={cycleOptions}
          canManage={canManage}
        />
        <ScheduleEngagementSurveyForm
          survey={survey}
          filterOptions={filterOptions}
          cycleOptions={cycleOptions}
          canManage={canManage}
        />
        <PublishEngagementSurveyForm
          surveyId={survey.id}
          canManage={canManage}
          surveyState={survey.state}
        />
        <RevertEngagementSurveyToDraftForm
          survey={survey}
          canManage={canManage}
        />
      </CardContent>
    </Card>
  )
}
