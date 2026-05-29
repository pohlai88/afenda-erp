import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import Link from "next/link"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import {
  HrmShellAccessDeniedFromNav,
  organizationHrmPath,
} from "@afenda/feature-hrm-core/registry"

import type { EmployeeEngagementSurfaceAccess } from "../data/engagement-access.server"
import { loadEmployeeEngagementSurveyConfigPageData } from "../data/engagement-survey-config-page.server"
import {
  EngagementAudiencePreviewSection,
  EngagementConfigurationFormSection,
} from "./engagement-config-sections"

type EmployeeEngagementSurveyConfigPageProps = {
  orgSlug: string
  surveyId: string
  access?: EmployeeEngagementSurfaceAccess
}

export async function EmployeeEngagementSurveyConfigPage({
  orgSlug,
  surveyId,
  access,
}: EmployeeEngagementSurveyConfigPageProps) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.config")

  if (access && !access.canEnter) {
    return <HrmShellAccessDeniedFromNav navKey="employee-engagement" />
  }

  const data = await loadEmployeeEngagementSurveyConfigPageData({ surveyId })
  if (!data) notFound()

  const parentAccessAllowed = access?.canReadOrg ?? true
  const canManage = access?.canManage ?? false

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
            questions: data.survey.questionCount,
          })}
        />
      </div>
      <EngagementConfigurationFormSection
        survey={data.survey}
        filterOptions={data.filterOptions}
        cycleOptions={data.cycleOptions}
        canManage={canManage}
      />
      <EngagementAudiencePreviewSection
        survey={data.survey}
        parentAccessAllowed={parentAccessAllowed}
      />
    </div>
  )
}
