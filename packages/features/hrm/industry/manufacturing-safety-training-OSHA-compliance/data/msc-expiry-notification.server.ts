import "server-only"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { sendAuthEmail } from "@afenda/platform/auth/auth-mail.server"
import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmEmployee, hrmMscEmployeeObligation } from "@afenda/platform/db/schema"
import { DEFAULT_APP_LOCALE } from "@afenda/platform/i18n/locales.shared"
import { getSiteUrl } from "@afenda/platform/site"
import { publishOrgNotificationIfMissing } from "../../_integration/org-notifications.server"

import { HRM_MSC_AUDIT } from "../msc.contract"

const MSC_APPS_LINKED_PATH = "/apps/hrm/manufacturing-safety"

function mscComplianceWorkbenchUrl(): string {
  return `${getSiteUrl()}/${DEFAULT_APP_LOCALE}/o`
}

/** HRM-MSC-023 — in-app notifications and optional email for expiring obligations. */
export async function emitMscExpiryAlertsForOrg(input: {
  organizationId: string
  actorUserId: string | null
}): Promise<{
  emittedInApp: number
  emittedEmail: number
  skipped: number
}> {
  const obligations = await db.query.hrmMscEmployeeObligation.findMany({
    where: and(
      eq(hrmMscEmployeeObligation.organizationId, input.organizationId),
      eq(hrmMscEmployeeObligation.complianceStatus, "expiring")
    ),
    columns: { id: true, employeeId: true },
  })

  if (obligations.length === 0) {
    return { emittedInApp: 0, emittedEmail: 0, skipped: 0 }
  }

  const employeeIds = [...new Set(obligations.map((row) => row.employeeId))]
  const employees = await db
    .select({
      id: hrmEmployee.id,
      legalName: hrmEmployee.legalName,
      preferredName: hrmEmployee.preferredName,
      linkedUserId: hrmEmployee.linkedUserId,
      email: hrmEmployee.email,
    })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        inArray(hrmEmployee.id, employeeIds),
        isNull(hrmEmployee.archivedAt)
      )
    )

  const employeeById = new Map(employees.map((row) => [row.id, row]))
  let emittedInApp = 0
  let emittedEmail = 0
  let skipped = 0

  const notifiedEmployeeIds = new Set<string>()

  for (const obligation of obligations) {
    const employee = employeeById.get(obligation.employeeId)
    const label =
      employee?.preferredName?.trim() ||
      employee?.legalName?.trim() ||
      "Employee"

    let delivered = false

    const targetUserId = employee?.linkedUserId ?? null
    if (targetUserId) {
      try {
        const result = await publishOrgNotificationIfMissing({
          organizationId: input.organizationId,
          targetUserId,
          title: "Manufacturing safety certification expiring soon",
          body: `${label}: a safety certification or training obligation is expiring within 30 days. Review obligations on the manufacturing safety surface.`,
          severity: "warning",
          linkedEntityType: "erp.hrm.manufacturing_safety.alert",
          linkedEntityId: obligation.id,
          linkedEntityLabel: label,
          linkedPath: MSC_APPS_LINKED_PATH,
          expiresAt: null,
        })
        if (result.created) emittedInApp += 1
        delivered = result.created || delivered
      } catch {
        // best-effort in-app
      }
    }

    if (!notifiedEmployeeIds.has(obligation.employeeId)) {
      const emailRaw = employee?.email?.trim()
      const email = emailRaw && emailRaw.includes("@") ? emailRaw : null
      if (email) {
        try {
          await sendAuthEmail({
            to: email,
            subject: "Manufacturing safety certification expiring soon",
            text: [
              `${label},`,
              "",
              "A safety certification or training obligation on your record is expiring within 30 days.",
              "Sign in to your organization workbench and open Manufacturing safety to review obligations.",
              "",
              `Workbench: ${mscComplianceWorkbenchUrl()}`,
            ].join("\n"),
          })
          emittedEmail += 1
          delivered = true
        } catch {
          // best-effort email
        }
      }
      notifiedEmployeeIds.add(obligation.employeeId)
    }

    if (!delivered) skipped += 1
  }

  if ((emittedInApp > 0 || emittedEmail > 0) && input.actorUserId) {
    await writeIamAuditEventFromNextHeaders({
      action: HRM_MSC_AUDIT.expiryAlert,
      actorUserId: input.actorUserId,
      organizationId: input.organizationId,
      resourceType: "manufacturing_safety_alert",
      resourceId: input.organizationId,
      metadata: {
        emittedInApp,
        emittedEmail,
        skipped,
        obligationCount: obligations.length,
      },
    })
  }

  return { emittedInApp, emittedEmail, skipped }
}
