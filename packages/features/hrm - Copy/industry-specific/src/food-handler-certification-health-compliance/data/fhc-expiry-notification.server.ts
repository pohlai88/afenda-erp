import "server-only"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { sendAuthEmail } from "@afenda/platform/auth/auth-mail.server"
import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFhcEmployeeObligation,
} from "@afenda/platform/db/schema"
import { DEFAULT_APP_LOCALE } from "@afenda/platform/i18n/locales.shared"
import { getSiteUrl } from "@afenda/platform/site"
import { publishOrgNotificationIfMissing } from "../../_integration/org-notifications.server"

import { HRM_FHC_AUDIT } from "../fhc.contract"

const FHC_APPS_LINKED_PATH = "/apps/hrm/food-handler-compliance"

function fhcComplianceWorkbenchUrl(): string {
  return `${getSiteUrl()}/${DEFAULT_APP_LOCALE}/o`
}

/**
 * HRM-FHC-014 — in-app org notifications and optional email for expiring obligations.
 * In-app requires linkedUserId; email uses employee work email when present.
 */
export async function emitFhcExpiryAlertsForOrg(input: {
  organizationId: string
  actorUserId: string | null
}): Promise<{
  emittedInApp: number
  emittedEmail: number
  skipped: number
}> {
  const obligations = await db.query.hrmFhcEmployeeObligation.findMany({
    where: and(
      eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
      eq(hrmFhcEmployeeObligation.complianceStatus, "expiring")
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
          title: "Food handler certification expiring soon",
          body: `${label}: a food handler permit or health certificate is expiring within 30 days. Review obligations on the compliance surface.`,
          severity: "warning",
          linkedEntityType: "erp.hrm.food_handler_compliance.alert",
          linkedEntityId: obligation.id,
          linkedEntityLabel: label,
          linkedPath: FHC_APPS_LINKED_PATH,
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
            subject: "Food handler certification expiring soon",
            text: [
              `${label},`,
              "",
              "A food handler permit or health certificate on your record is expiring within 30 days.",
              "Sign in to your organization workbench and open Food handler compliance to review obligations.",
              "",
              `Workbench: ${fhcComplianceWorkbenchUrl()}`,
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
      action: HRM_FHC_AUDIT.expiryAlert,
      actorUserId: input.actorUserId,
      organizationId: input.organizationId,
      resourceType: "food_handler_compliance_alert",
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
