import "server-only"

import { revalidatePath } from "next/cache"

import { toLocaleOrgAppsRevalidatePattern } from "@afenda/platform/i18n/locales.shared"

export function revalidateEmployeeEngagementSurfaces() {
  revalidatePath(
    toLocaleOrgAppsRevalidatePattern("/hrm/employee-engagement"),
    "page"
  )
}

export function revalidateEmployeeEngagementSurveyDetail(surveyId: string) {
  revalidatePath(
    toLocaleOrgAppsRevalidatePattern(`/hrm/employee-engagement/${surveyId}`),
    "page"
  )
}

export function revalidateEmployeeEngagementRespond(invitationId: string) {
  revalidatePath(
    toLocaleOrgAppsRevalidatePattern(
      `/hrm/employee-engagement/respond/${invitationId}`
    ),
    "page"
  )
}
