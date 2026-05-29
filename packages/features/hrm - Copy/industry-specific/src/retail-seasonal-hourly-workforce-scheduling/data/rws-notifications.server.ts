import "server-only"

import { cache } from "react"

import { publishOrgNotificationIfMissing } from "../../_integration/org-notifications.server"
import { getOrganizationSlugById } from "@afenda/platform/auth/org-slug.server"
import { organizationAppsPath } from "@afenda/platform/org-apps-module-paths"

import { HRM_RWS_AUDIT } from "../rws.contract"

export type RwsNotificationEvent =
  | "period_published"
  | "open_shift_claimed"

const EVENT_TITLE: Record<RwsNotificationEvent, string> = {
  period_published: "Retail schedule published",
  open_shift_claimed: "Open shift claimed",
}

const EVENT_AUDIT: Record<RwsNotificationEvent, string> = {
  period_published: HRM_RWS_AUDIT.periodPublish,
  open_shift_claimed: HRM_RWS_AUDIT.openShiftClaim,
}

const resolveRwsLinkedPath = cache(
  async (organizationId: string): Promise<string> => {
    const slug = await getOrganizationSlugById(organizationId)
    if (!slug) return "/"
    return `${organizationAppsPath(slug, "hrm")}/retail-scheduling`
  }
)

async function publishRwsOrgNotification(input: {
  organizationId: string
  event: RwsNotificationEvent
  body: string
  linkedEntityId: string
}) {
  const linkedPath = await resolveRwsLinkedPath(input.organizationId)

  try {
    await publishOrgNotificationIfMissing({
      organizationId: input.organizationId,
      title: EVENT_TITLE[input.event],
      body: input.body,
      severity: "info",
      linkedEntityType: EVENT_AUDIT[input.event],
      linkedEntityId: input.linkedEntityId,
      linkedEntityLabel: "retail_schedule",
      linkedPath,
      expiresAt: null,
    })
  } catch {
    // In-app delivery must not roll back retail scheduling mutations.
  }
}

export async function notifyRwsPeriodPublished(input: {
  organizationId: string
  schedulePeriodId: string
  periodCode: string
}) {
  await publishRwsOrgNotification({
    organizationId: input.organizationId,
    event: "period_published",
    body: `Schedule period ${input.periodCode} was published.`,
    linkedEntityId: input.schedulePeriodId,
  })
}

export async function notifyRwsOpenShiftClaimed(input: {
  organizationId: string
  openShiftOfferId: string
  employeeId: string
}) {
  await publishRwsOrgNotification({
    organizationId: input.organizationId,
    event: "open_shift_claimed",
    body: `Open shift ${input.openShiftOfferId} was claimed.`,
    linkedEntityId: input.openShiftOfferId,
  })
}
