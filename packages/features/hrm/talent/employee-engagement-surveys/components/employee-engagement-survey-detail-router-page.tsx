import { notFound } from "next/navigation"

import type { EmployeeEngagementSurfaceAccess } from "../data/engagement-access.server"
import { getEngagementSurveyDetailById } from "../data/engagement-distribution.queries.server"
import { requireOrgSession } from "@afenda/platform/auth"
import { EmployeeEngagementSurveyConfigPage } from "./employee-engagement-survey-config-page"
import { EmployeeEngagementSurveyDistributionPage } from "./employee-engagement-survey-distribution-page"

type EmployeeEngagementSurveyDetailRouterPageProps = {
  orgSlug: string
  surveyId: string
  access: EmployeeEngagementSurfaceAccess
}

export async function EmployeeEngagementSurveyDetailRouterPage({
  orgSlug,
  surveyId,
  access,
}: EmployeeEngagementSurveyDetailRouterPageProps) {
  const session = await requireOrgSession()
  const survey = await getEngagementSurveyDetailById({
    organizationId: session.organizationId,
    surveyId,
  })
  if (!survey) notFound()

  if (survey.state === "draft" || survey.state === "scheduled") {
    return (
      <EmployeeEngagementSurveyConfigPage
        orgSlug={orgSlug}
        surveyId={surveyId}
        access={access}
      />
    )
  }

  if (survey.state === "published" || survey.state === "closed") {
    return (
      <EmployeeEngagementSurveyDistributionPage
        orgSlug={orgSlug}
        surveyId={surveyId}
        access={access}
      />
    )
  }

  notFound()
}
