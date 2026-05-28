import "server-only"

import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"

import type { EngagementLoadError } from "./engagement-load-error.shared"
import { listEngagementConfigurableSurveysForOrganization } from "./engagement-survey-config.queries.server"
import {
  listEngagementDraftSurveysForOrganization,
  listEngagementTemplateOptionsForOrganization,
  listEngagementTemplateQuestionsForOrganization,
  listEngagementTemplatesForOrganization,
} from "./engagement-template.queries.server"

export type EmployeeEngagementSurveysPageData = {
  templates: Awaited<ReturnType<typeof listEngagementTemplatesForOrganization>>
  templateQuestions: Awaited<
    ReturnType<typeof listEngagementTemplateQuestionsForOrganization>
  >
  draftSurveys: Awaited<
    ReturnType<typeof listEngagementDraftSurveysForOrganization>
  >
  templateOptions: Awaited<
    ReturnType<typeof listEngagementTemplateOptionsForOrganization>
  >
  configurableSurveys: Awaited<
    ReturnType<typeof listEngagementConfigurableSurveysForOrganization>
  >
  loadError?: EngagementLoadError
}

const EMPTY_PAGE_DATA: EmployeeEngagementSurveysPageData = {
  templates: [],
  templateQuestions: [],
  draftSurveys: [],
  templateOptions: [],
  configurableSurveys: [],
}

export async function loadEmployeeEngagementSurveysPageData(): Promise<EmployeeEngagementSurveysPageData> {
  try {
    const session = await requireOrgSession()
    const organizationId = session.organizationId

    const [
      templates,
      templateQuestions,
      draftSurveys,
      templateOptions,
      configurableSurveys,
    ] = await Promise.all([
      listEngagementTemplatesForOrganization(organizationId),
      listEngagementTemplateQuestionsForOrganization(organizationId),
      listEngagementDraftSurveysForOrganization(organizationId),
      listEngagementTemplateOptionsForOrganization(organizationId),
      listEngagementConfigurableSurveysForOrganization(organizationId),
    ])

    return {
      templates,
      templateQuestions,
      draftSurveys,
      templateOptions,
      configurableSurveys,
    }
  } catch (error) {
    logUnexpectedServerError("employee-engagement.page.load", error)
    return {
      ...EMPTY_PAGE_DATA,
      loadError: {
        title: "Could not load employee engagement surveys",
        description:
          "Try refreshing the page. If the problem continues, contact your administrator.",
      },
    }
  }
}
