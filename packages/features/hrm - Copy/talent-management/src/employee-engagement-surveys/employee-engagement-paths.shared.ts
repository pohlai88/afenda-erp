import type { Route } from "next"

import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"

export function organizationHrmEmployeeEngagementSurveyPath(
  orgSlug: string,
  surveyId: string
): Route {
  return `${organizationHrmPath(orgSlug, "employee-engagement")}/${surveyId}` as Route
}

export function organizationHrmEmployeeEngagementRespondPath(
  orgSlug: string,
  invitationId: string
): Route {
  return `${organizationHrmPath(orgSlug, "employee-engagement")}/respond/${invitationId}` as Route
}
