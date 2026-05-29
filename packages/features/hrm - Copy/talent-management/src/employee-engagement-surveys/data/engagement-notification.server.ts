import "server-only"

import { after } from "next/server"
import { cache } from "react"
import { and, eq } from "drizzle-orm"

import { sendAuthEmail } from "@afenda/platform/auth/auth-mail.server"
import { getOrganizationSlugById } from "@afenda/platform/auth/org-slug.server"
import {
  publishOrgNotification,
  publishOrgNotificationIfMissing,
} from "../../_integration/org-notifications.server"
import { db } from "@afenda/platform/db"
import { hrmEmployee } from "@afenda/platform/db/schema"
import { getSiteUrl } from "@afenda/platform/site"

import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import {
  organizationHrmEmployeeEngagementRespondPath,
  organizationHrmEmployeeEngagementSurveyPath,
} from "../employee-engagement-paths.shared"
import {
  buildEngagementImprovementOverdueTemplate,
  buildEngagementSurveyInvitationTemplate,
  buildEngagementSurveyReminderTemplate,
  buildEngagementSurveyResendTemplate,
  type EngagementNotificationTemplateMessage,
} from "../schemas/engagement-notification-templates.shared"

const resolveOrgSlug = cache(
  async (organizationId: string): Promise<string | null> => {
    return getOrganizationSlugById(organizationId)
  },
)

async function resolveEngagementRespondLinkedPath(input: {
  organizationId: string
  invitationId: string
}): Promise<string> {
  const slug = await resolveOrgSlug(input.organizationId)
  if (!slug) return "/apps/hrm/employee-engagement"
  return organizationHrmEmployeeEngagementRespondPath(slug, input.invitationId)
}

async function resolveEngagementRespondUrl(input: {
  organizationId: string
  invitationId: string
}): Promise<string> {
  const path = await resolveEngagementRespondLinkedPath(input)
  return `${getSiteUrl()}${path}`
}

async function resolveEngagementSurveyLinkedPath(input: {
  organizationId: string
  surveyId: string
}): Promise<string> {
  const slug = await resolveOrgSlug(input.organizationId)
  if (!slug) return "/apps/hrm/employee-engagement"
  return organizationHrmEmployeeEngagementSurveyPath(slug, input.surveyId)
}

async function resolveEngagementSurveyUrl(input: {
  organizationId: string
  surveyId: string
}): Promise<string> {
  const path = await resolveEngagementSurveyLinkedPath(input)
  return `${getSiteUrl()}${path}`
}

async function getEmployeeContact(input: {
  organizationId: string
  employeeId: string
}): Promise<{ linkedUserId: string | null; email: string | null }> {
  const [row] = await db
    .select({
      linkedUserId: hrmEmployee.linkedUserId,
      email: hrmEmployee.email,
    })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.id, input.employeeId),
      ),
    )
    .limit(1)

  const email = row?.email?.trim()
  return {
    linkedUserId: row?.linkedUserId ?? null,
    email: email && email.includes("@") ? email : null,
  }
}

async function getEmployeeContactByUserId(input: {
  organizationId: string
  targetUserId: string
}): Promise<{ email: string | null }> {
  const [row] = await db
    .select({ email: hrmEmployee.email })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.linkedUserId, input.targetUserId),
      ),
    )
    .limit(1)

  const email = row?.email?.trim()
  return { email: email && email.includes("@") ? email : null }
}

async function deliverEngagementNotification(input: {
  organizationId: string
  targetUserId: string | null
  employeeId?: string | null
  template: EngagementNotificationTemplateMessage
  linkedEntityType: string
  linkedEntityId: string
  linkedEntityLabel: string
  linkedPath: string
  useIfMissing?: boolean
}): Promise<void> {
  if (input.targetUserId) {
    try {
      const publish = input.useIfMissing
        ? publishOrgNotificationIfMissing
        : publishOrgNotification
      await publish({
        organizationId: input.organizationId,
        targetUserId: input.targetUserId,
        title: input.template.inApp.title,
        body: input.template.inApp.body,
        severity: input.linkedEntityType.includes("overdue")
          ? "warning"
          : "info",
        linkedEntityType: input.linkedEntityType,
        linkedEntityId: input.linkedEntityId,
        linkedEntityLabel: input.linkedEntityLabel,
        linkedPath: input.linkedPath,
        expiresAt: null,
      })
    } catch {
      // In-app delivery must not roll back ERP mutations.
    }
  }

  let email: string | null = null
  if (input.employeeId) {
    const contact = await getEmployeeContact({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
    })
    email = contact.email
  } else if (input.targetUserId) {
    const contact = await getEmployeeContactByUserId({
      organizationId: input.organizationId,
      targetUserId: input.targetUserId,
    })
    email = contact.email
  }

  if (!email) return

  after(() => {
    void sendAuthEmail({
      to: email,
      subject: input.template.email.subject,
      text: input.template.email.text,
      html: input.template.email.html,
    })
  })
}

export async function notifyEngagementSurveyInvitation(input: {
  organizationId: string
  invitationId: string
  surveyTitle: string
  targetUserId: string | null
  employeeId?: string | null
}): Promise<void> {
  const [linkedPath, respondUrl] = await Promise.all([
    resolveEngagementRespondLinkedPath({
      organizationId: input.organizationId,
      invitationId: input.invitationId,
    }),
    resolveEngagementRespondUrl({
      organizationId: input.organizationId,
      invitationId: input.invitationId,
    }),
  ])

  const template = buildEngagementSurveyInvitationTemplate({
    surveyTitle: input.surveyTitle,
    respondUrl,
  })

  await deliverEngagementNotification({
    organizationId: input.organizationId,
    targetUserId: input.targetUserId,
    employeeId: input.employeeId,
    template,
    linkedEntityType: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.publish,
    linkedEntityId: input.invitationId,
    linkedEntityLabel: input.surveyTitle,
    linkedPath,
    useIfMissing: true,
  })
}

export async function notifyEngagementSurveyReminder(input: {
  organizationId: string
  invitationId: string
  surveyTitle: string
  targetUserId: string | null
  employeeId?: string | null
  daysBeforeClose: number
}): Promise<void> {
  const [linkedPath, respondUrl] = await Promise.all([
    resolveEngagementRespondLinkedPath({
      organizationId: input.organizationId,
      invitationId: input.invitationId,
    }),
    resolveEngagementRespondUrl({
      organizationId: input.organizationId,
      invitationId: input.invitationId,
    }),
  ])

  const template = buildEngagementSurveyReminderTemplate({
    surveyTitle: input.surveyTitle,
    daysBeforeClose: input.daysBeforeClose,
    respondUrl,
  })

  await deliverEngagementNotification({
    organizationId: input.organizationId,
    targetUserId: input.targetUserId,
    employeeId: input.employeeId,
    template,
    linkedEntityType: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.remind,
    linkedEntityId: `${input.invitationId}:reminder:${input.daysBeforeClose}`,
    linkedEntityLabel: input.surveyTitle,
    linkedPath,
    useIfMissing: true,
  })
}

export async function notifyEngagementSurveyResend(input: {
  organizationId: string
  invitationId: string
  surveyTitle: string
  targetUserId: string | null
  employeeId?: string | null
}): Promise<void> {
  const [linkedPath, respondUrl] = await Promise.all([
    resolveEngagementRespondLinkedPath({
      organizationId: input.organizationId,
      invitationId: input.invitationId,
    }),
    resolveEngagementRespondUrl({
      organizationId: input.organizationId,
      invitationId: input.invitationId,
    }),
  ])

  const template = buildEngagementSurveyResendTemplate({
    surveyTitle: input.surveyTitle,
    respondUrl,
  })

  await deliverEngagementNotification({
    organizationId: input.organizationId,
    targetUserId: input.targetUserId,
    employeeId: input.employeeId,
    template,
    linkedEntityType: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.remind,
    linkedEntityId: input.invitationId,
    linkedEntityLabel: input.surveyTitle,
    linkedPath,
    useIfMissing: false,
  })
}

export async function notifyEngagementImprovementActionOverdue(input: {
  organizationId: string
  actionId: string
  surveyId: string
  title: string
  targetUserId: string | null
  ownerEmployeeId: string | null
  dueDate: string | null
}): Promise<void> {
  const [linkedPath, surveyUrl] = await Promise.all([
    resolveEngagementSurveyLinkedPath({
      organizationId: input.organizationId,
      surveyId: input.surveyId,
    }),
    resolveEngagementSurveyUrl({
      organizationId: input.organizationId,
      surveyId: input.surveyId,
    }),
  ])

  const template = buildEngagementImprovementOverdueTemplate({
    title: input.title,
    dueDate: input.dueDate,
    surveyUrl,
  })

  await deliverEngagementNotification({
    organizationId: input.organizationId,
    targetUserId: input.targetUserId,
    employeeId: input.ownerEmployeeId,
    template,
    linkedEntityType:
      HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.overdueNotify,
    linkedEntityId: input.actionId,
    linkedEntityLabel: input.title,
    linkedPath,
    useIfMissing: true,
  })
}
