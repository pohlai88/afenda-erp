import "server-only"

import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"

import type { EngagementLoadError } from "./engagement-load-error.shared"
import { loadEngagementAudienceFilterOptions } from "./engagement-audience.server"
import { listEngagementSurveyCycleOptions } from "./engagement-cycle.queries.server"
import {
  getEngagementSurveyConfigurationById,
  listEngagementConfigurableSurveysForOrganization,
} from "./engagement-survey-config.queries.server"
import {
  getEngagementSurveyDetailById,
  listEngagementCompletionTrackingForSurvey,
  loadEngagementDistributionSummary,
} from "./engagement-distribution.queries.server"
import {
  getEngagementAnalyticsSnapshotForSurvey,
  listEngagementCycleHistoryForOrganization,
} from "./engagement-analytics.server"
import {
  listEngagementImprovementActionsForSurvey,
  listEngagementImprovementOwnerOptions,
} from "./engagement-improvement.queries.server"
import type { EngagementAnalyticsSnapshot } from "../schemas/engagement-analytics.shared"
import type { EngagementCycleHistoryRow } from "./engagement-analytics.server"
import type { EngagementSurveyConfigurationDetail } from "../schemas/engagement-config.shared"
import type {
  EngagementCompletionTrackingRow,
  EngagementDistributionSummary,
  EngagementImprovementActionListRow,
  EngagementImprovementOwnerOption,
} from "../schemas/engagement-query.shared"
import type { EngagementAudienceFilterOptions } from "../schemas/engagement-config.shared"

export type EmployeeEngagementSurveyConfigPageData = {
  survey: EngagementSurveyConfigurationDetail
  filterOptions: Awaited<ReturnType<typeof loadEngagementAudienceFilterOptions>>
  cycleOptions: Awaited<ReturnType<typeof listEngagementSurveyCycleOptions>>
  configurableSurveys: Awaited<
    ReturnType<typeof listEngagementConfigurableSurveysForOrganization>
  >
  loadError?: EngagementLoadError
}

export type EmployeeEngagementSurveyDistributionPageData = {
  survey: EngagementSurveyConfigurationDetail
  summary: EngagementDistributionSummary
  completionRows: readonly EngagementCompletionTrackingRow[]
  improvementRows: readonly EngagementImprovementActionListRow[]
  improvementOwnerOptions: readonly EngagementImprovementOwnerOption[]
  overdueImprovementCount: number
  filterOptions: EngagementAudienceFilterOptions
  analyticsSnapshot: EngagementAnalyticsSnapshot | null
  cycleHistoryRows: readonly EngagementCycleHistoryRow[]
  loadError?: EngagementLoadError
}

export async function loadEmployeeEngagementSurveyConfigPageData(input: {
  surveyId: string
}): Promise<EmployeeEngagementSurveyConfigPageData | null> {
  try {
    const session = await requireOrgSession()
    const organizationId = session.organizationId

    const [survey, filterOptions, cycleOptions, configurableSurveys] =
      await Promise.all([
        getEngagementSurveyConfigurationById({
          organizationId,
          surveyId: input.surveyId,
        }),
        loadEngagementAudienceFilterOptions(organizationId),
        listEngagementSurveyCycleOptions(organizationId),
        listEngagementConfigurableSurveysForOrganization(organizationId),
      ])

    if (!survey) return null
    if (survey.state !== "draft" && survey.state !== "scheduled") {
      return null
    }

    return { survey, filterOptions, cycleOptions, configurableSurveys }
  } catch (error) {
    logUnexpectedServerError("employee-engagement.survey-config.load", error)
    return null
  }
}

export async function loadEmployeeEngagementSurveyDistributionPageData(input: {
  surveyId: string
}): Promise<EmployeeEngagementSurveyDistributionPageData | null> {
  try {
    const session = await requireOrgSession()
    const organizationId = session.organizationId

    const survey = await getEngagementSurveyDetailById({
      organizationId,
      surveyId: input.surveyId,
    })
    if (!survey) return null
    if (survey.state !== "published" && survey.state !== "closed") {
      return null
    }

    const [
      summary,
      completionRows,
      improvementRows,
      improvementOwnerOptions,
      filterOptions,
      analyticsSnapshot,
      cycleHistoryRows,
    ] = await Promise.all([
      loadEngagementDistributionSummary({
        organizationId,
        surveyId: input.surveyId,
      }),
      listEngagementCompletionTrackingForSurvey({
        organizationId,
        surveyId: input.surveyId,
        anonymityMode: survey.anonymityMode,
      }),
      listEngagementImprovementActionsForSurvey({
        organizationId,
        surveyId: input.surveyId,
      }),
      listEngagementImprovementOwnerOptions(organizationId),
      loadEngagementAudienceFilterOptions(organizationId),
      getEngagementAnalyticsSnapshotForSurvey({
        organizationId,
        surveyId: input.surveyId,
      }),
      listEngagementCycleHistoryForOrganization({
        organizationId,
        cycleId: survey.cycleId,
      }),
    ])

    const overdueImprovementCount = improvementRows.filter(
      (row) => row.isOverdue
    ).length

    return {
      survey,
      summary,
      completionRows,
      improvementRows,
      improvementOwnerOptions,
      overdueImprovementCount,
      filterOptions,
      analyticsSnapshot,
      cycleHistoryRows,
    }
  } catch (error) {
    logUnexpectedServerError(
      "employee-engagement.survey-distribution.load",
      error
    )
    return null
  }
}
