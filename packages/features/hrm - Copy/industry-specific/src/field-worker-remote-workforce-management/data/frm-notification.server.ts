import "server-only"

import { cache } from "react"
import { and, eq } from "drizzle-orm"

import { publishOrgNotificationIfMissing } from "../../_integration/org-notifications.server"
import { getOrganizationSlugById } from "@afenda/platform/auth/org-slug.server"
import { db } from "@afenda/platform/db"
import { hrmEmployee } from "@afenda/platform/db/schema"
import { organizationAppsPath } from "@afenda/platform/org-apps-module-paths"

import { HRM_FRM_AUDIT } from "../frm.contract"
import type { HrmFrmExceptionCode } from "../schemas/frm-workflow-state.shared"

export type FrmNotificationEvent =
  | "assignment_created"
  | "exception_opened"
  | "travel_non_compliant"
  | "per_diem_approved"
  | "checkin_overdue"

const EVENT_TITLE: Record<FrmNotificationEvent, string> = {
  assignment_created: "Field assignment updated",
  exception_opened: "Field attendance exception",
  travel_non_compliant: "Travel compliance attention needed",
  per_diem_approved: "Per diem reference approved",
  checkin_overdue: "Field check-in overdue",
}

const EVENT_AUDIT_TYPE: Record<FrmNotificationEvent, string> = {
  assignment_created: HRM_FRM_AUDIT.assignmentCreate,
  exception_opened: HRM_FRM_AUDIT.exceptionDetect,
  travel_non_compliant: HRM_FRM_AUDIT.travelStatusCreate,
  per_diem_approved: HRM_FRM_AUDIT.perDiemReferenceApprove,
  checkin_overdue: HRM_FRM_AUDIT.checkinOverdue,
}

const resolveFrmLinkedPath = cache(
  async (organizationId: string): Promise<string> => {
    const slug = await getOrganizationSlugById(organizationId)
    if (!slug) return "/apps/hrm/field-workforce"
    return `${organizationAppsPath(slug, "hrm")}/field-workforce`
  }
)

async function resolveEmployeeLinkedUserId(input: {
  organizationId: string
  employeeId: string
}): Promise<string | null> {
  const employee = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.organizationId, input.organizationId),
      eq(hrmEmployee.id, input.employeeId)
    ),
    columns: { linkedUserId: true },
  })
  return employee?.linkedUserId ?? null
}

export async function notifyFrmLifecycle(input: {
  readonly organizationId: string
  readonly resourceId: string
  readonly event: FrmNotificationEvent
  readonly targetUserId: string | null
  readonly bodyDetail?: string | null
  readonly linkedPath?: string | null
  readonly severity?: "info" | "warning"
}): Promise<void> {
  if (!input.targetUserId) return

  const linkedPath =
    input.linkedPath ?? (await resolveFrmLinkedPath(input.organizationId))
  const detail = input.bodyDetail?.trim()
  const bodyParts = [EVENT_TITLE[input.event] + ".", detail].filter(Boolean)

  try {
    await publishOrgNotificationIfMissing({
      organizationId: input.organizationId,
      targetUserId: input.targetUserId,
      title: EVENT_TITLE[input.event],
      body: bodyParts.join(" "),
      severity: input.severity ?? "info",
      linkedEntityType: EVENT_AUDIT_TYPE[input.event],
      linkedEntityId: input.resourceId,
      linkedEntityLabel: "field_workforce",
      linkedPath,
      expiresAt: null,
    })
  } catch {
    // In-app delivery must not roll back field workforce mutations.
  }
}

export async function notifyFrmEmployeeLifecycle(input: {
  readonly organizationId: string
  readonly employeeId: string
  readonly resourceId: string
  readonly event: FrmNotificationEvent
  readonly bodyDetail?: string | null
  readonly severity?: "info" | "warning"
}): Promise<void> {
  const targetUserId = await resolveEmployeeLinkedUserId({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  })
  await notifyFrmLifecycle({
    organizationId: input.organizationId,
    resourceId: input.resourceId,
    event: input.event,
    targetUserId,
    bodyDetail: input.bodyDetail,
    severity: input.severity,
  })
}

export async function notifyFrmManagerLifecycle(input: {
  readonly organizationId: string
  readonly managerEmployeeId: string
  readonly resourceId: string
  readonly event: FrmNotificationEvent
  readonly bodyDetail?: string | null
  readonly severity?: "info" | "warning"
}): Promise<void> {
  const targetUserId = await resolveEmployeeLinkedUserId({
    organizationId: input.organizationId,
    employeeId: input.managerEmployeeId,
  })
  await notifyFrmLifecycle({
    organizationId: input.organizationId,
    resourceId: input.resourceId,
    event: input.event,
    targetUserId,
    bodyDetail: input.bodyDetail,
    severity: input.severity,
  })
}

export async function notifyFrmCheckinOverdue(input: {
  readonly organizationId: string
  readonly assignmentId: string
  readonly employeeId: string
  readonly managerEmployeeId: string | null
  readonly workDate: string
}): Promise<void> {
  const detail = `No clock-in recorded for ${input.workDate}.`
  await notifyFrmEmployeeLifecycle({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    resourceId: input.assignmentId,
    event: "checkin_overdue",
    bodyDetail: detail,
    severity: "warning",
  })

  if (!input.managerEmployeeId) return
  await notifyFrmManagerLifecycle({
    organizationId: input.organizationId,
    managerEmployeeId: input.managerEmployeeId,
    resourceId: input.assignmentId,
    event: "checkin_overdue",
    bodyDetail: `Team member: ${detail}`,
    severity: "warning",
  })
}

export async function notifyFrmExceptionOpened(input: {
  readonly organizationId: string
  readonly exceptionId: string
  readonly employeeId: string
  readonly managerEmployeeId: string | null
  readonly exceptionCode: HrmFrmExceptionCode
  readonly exceptionDate: string
}): Promise<void> {
  const detail = `${input.exceptionCode.replaceAll("_", " ")} on ${input.exceptionDate}.`
  await notifyFrmEmployeeLifecycle({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    resourceId: input.exceptionId,
    event: "exception_opened",
    bodyDetail: detail,
    severity: "warning",
  })

  if (!input.managerEmployeeId) return
  const managerUserId = await resolveEmployeeLinkedUserId({
    organizationId: input.organizationId,
    employeeId: input.managerEmployeeId,
  })
  await notifyFrmLifecycle({
    organizationId: input.organizationId,
    resourceId: input.exceptionId,
    event: "exception_opened",
    targetUserId: managerUserId,
    bodyDetail: `Team member: ${detail}`,
    severity: "warning",
  })
}
