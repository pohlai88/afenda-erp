import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import Link from "next/link"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import { organizationHrmPath } from "@afenda/feature-hrm-core/registry"

import {
  loadEngagementRespondPageData,
  resolveEngagementEmployeeIdForUser,
} from "../data/engagement-response.queries.server"
import { getEngagementSurveyDetailById } from "../data/engagement-distribution.queries.server"
import { requireOrgSession } from "@afenda/platform/auth"
import { organizationHrmEmployeeEngagementSurveyPath } from "../employee-engagement-paths.shared"
import { EngagementResponseForm } from "./engagement-response-form.client"

type EmployeeEngagementRespondPageProps = {
  orgSlug: string
  invitationId: string
}

export async function EmployeeEngagementRespondPage({
  orgSlug,
  invitationId,
}: EmployeeEngagementRespondPageProps) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.respond")

  const session = await requireOrgSession()
  const employeeId = await resolveEngagementEmployeeIdForUser({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (!employeeId) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">{t("noEmployeeLink")}</p>
        <Link
          href={organizationHrmPath(orgSlug, "employee-engagement")}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          {t("backToList")}
        </Link>
      </div>
    )
  }

  const page = await loadEngagementRespondPageData({
    organizationId: session.organizationId,
    employeeId,
    invitationId,
  })
  if (!page) notFound()

  const survey = await getEngagementSurveyDetailById({
    organizationId: session.organizationId,
    surveyId: page.surveyId,
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        {survey ? (
          <Link
            href={organizationHrmEmployeeEngagementSurveyPath(
              orgSlug,
              survey.id
            )}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {t("backToSurvey")}
          </Link>
        ) : (
          <Link
            href={organizationHrmPath(orgSlug, "employee-engagement")}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {t("backToList")}
          </Link>
        )}
        <ModulePageHeader
          eyebrow={t("eyebrow")}
          title={page.surveyTitle}
          description={t("pageDescription")}
        />
      </div>
      {page.anonymityMode === "anonymous" ? (
        <p className="text-sm text-muted-foreground">{t("anonymousHint")}</p>
      ) : null}
      <EngagementResponseForm page={page} readOnly={!page.windowOpen} />
    </div>
  )
}
