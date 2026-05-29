import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import Link from "next/link"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import {
  HrmShellAccessDeniedFromNav,
  organizationHrmPath,
} from "@afenda/feature-hrm-core/registry"

import type { EmployeeEngagementSurfaceAccess } from "../data/engagement-access.server"
import { loadEmployeeEngagementSurveyDistributionPageData } from "../data/engagement-survey-detail-page.server"
import {
  EngagementCompletionTrackingSection,
  EngagementDistributionActionsSection,
  EngagementResponseRateSection,
} from "./engagement-distribution-sections"
import { EngagementImprovementActionsSection } from "./engagement-improvement-section"
import {
  EngagementAnalyticsOverviewSection,
  EngagementCategoryScoresSection,
  EngagementCycleHistorySection,
  EngagementOpenTextReviewSection,
  EngagementSegmentScoresSection,
} from "./engagement-analytics-sections"

type EmployeeEngagementSurveyDistributionPageProps = {
  orgSlug: string
  surveyId: string
  access?: EmployeeEngagementSurfaceAccess
}

export async function EmployeeEngagementSurveyDistributionPage({
  orgSlug,
  surveyId,
  access,
}: EmployeeEngagementSurveyDistributionPageProps) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.distribution")

  if (access && !access.canEnter) {
    return <HrmShellAccessDeniedFromNav navKey="employee-engagement" />
  }

  const data = await loadEmployeeEngagementSurveyDistributionPageData({
    surveyId,
  })
  if (!data) notFound()

  const parentAccessAllowed = access?.canReadOrg ?? true
  const canManage = access?.canManage ?? false
  const canGenerateAnalytics = access?.canGenerateAnalytics ?? canManage
  const canExportAnalytics = access?.canExportAnalytics ?? false

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link
          href={organizationHrmPath(orgSlug, "employee-engagement")}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          {t("backToList")}
        </Link>
        <ModulePageHeader
          eyebrow={t("eyebrow")}
          title={data.survey.title}
          description={t("pageDescription", {
            state: t(`surveyStateLabels.${data.survey.state}`),
          })}
        />
      </div>
      <EngagementDistributionActionsSection
        survey={data.survey}
        canManage={canManage}
      />
      <EngagementResponseRateSection summary={data.summary} />
      <EngagementAnalyticsOverviewSection
        surveyId={surveyId}
        snapshot={data.analyticsSnapshot}
        parentAccessAllowed={parentAccessAllowed}
        loadError={data.loadError}
        canGenerateAnalytics={canGenerateAnalytics}
        canExportAnalytics={canExportAnalytics}
      />
      <EngagementCategoryScoresSection
        snapshot={data.analyticsSnapshot}
        parentAccessAllowed={parentAccessAllowed}
        loadError={data.loadError}
      />
      <EngagementSegmentScoresSection
        surveyId={surveyId}
        snapshot={data.analyticsSnapshot}
        parentAccessAllowed={parentAccessAllowed}
        loadError={data.loadError}
        canExportAnalytics={canExportAnalytics}
      />
      <EngagementOpenTextReviewSection
        surveyId={surveyId}
        snapshot={data.analyticsSnapshot}
        canGenerateAnalytics={canGenerateAnalytics}
      />
      <EngagementCompletionTrackingSection
        survey={data.survey}
        rows={data.completionRows}
        parentAccessAllowed={parentAccessAllowed}
        loadError={data.loadError}
        canManage={canManage}
      />
      <EngagementImprovementActionsSection
        survey={data.survey}
        rows={data.improvementRows}
        ownerOptions={data.improvementOwnerOptions}
        overdueCount={data.overdueImprovementCount}
        parentAccessAllowed={parentAccessAllowed}
        loadError={data.loadError}
        canManage={canManage}
      />
      <EngagementCycleHistorySection
        rows={data.cycleHistoryRows}
        parentAccessAllowed={parentAccessAllowed}
        loadError={data.loadError}
      />
    </div>
  )
}
