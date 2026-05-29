import "server-only"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFhcEmployeeObligation,
  hrmFhcRequirementRule,
} from "@afenda/platform/db/schema"

import { HRM_FHC_AUDIT } from "../fhc.contract"
import { refreshAllFhcObligationStatusesForOrg } from "./fhc-compliance-context.server"
import { computeFhcObligationStatusAfterIdentification } from "./fhc-compliance-status.shared"
import { resolveFhcEmployeeMatchFacts } from "./fhc-employee-facts.server"
import { fhcRequirementRuleMatchesEmployeeFacts } from "./fhc-rule-match.shared"
import { emitFhcExpiryAlertsForOrg } from "./fhc-expiry-notification.server"
import { revalidateFhcSurfaces } from "./fhc-revalidate.server"

export type RecomputeFhcObligationsResult =
  | { ok: true; created: number; updated: number; removed: number }
  | { ok: false; form?: string }

/**
 * HRM-FHC-002 — materialize employee obligations from active requirement rules.
 */
export async function recomputeFhcObligationsForOrg(input: {
  organizationId: string
  userId: string
  sessionId: string | null
}): Promise<RecomputeFhcObligationsResult> {
  const activeRules = await db.query.hrmFhcRequirementRule.findMany({
    where: and(
      eq(hrmFhcRequirementRule.organizationId, input.organizationId),
      eq(hrmFhcRequirementRule.active, true)
    ),
  })

  const employees = await db
    .select({ id: hrmEmployee.id })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.employmentStatus, "active"),
        isNull(hrmEmployee.archivedAt)
      )
    )

  const matchedPairs = new Map<
    string,
    { employeeId: string; ruleId: string; outletId: string | null }
  >()

  for (const employee of employees) {
    const facts = await resolveFhcEmployeeMatchFacts({
      organizationId: input.organizationId,
      employeeId: employee.id,
    })

    for (const rule of activeRules) {
      const matches = fhcRequirementRuleMatchesEmployeeFacts(
        {
          countryCode: rule.countryCode,
          legalEntityRef: rule.legalEntityRef,
          roleRef: rule.roleRef,
          departmentRef: rule.departmentRef,
          employeeCategoryRef: rule.employeeCategoryRef,
        },
        facts
      )
      if (!matches) continue
      const key = `${employee.id}:${rule.id}`
      matchedPairs.set(key, {
        employeeId: employee.id,
        ruleId: rule.id,
        outletId: rule.outletId,
      })
    }
  }

  const existing = await db.query.hrmFhcEmployeeObligation.findMany({
    where: eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
    columns: {
      id: true,
      employeeId: true,
      requirementRuleId: true,
    },
  })

  const existingByKey = new Map(
    existing.map((row) => [
      `${row.employeeId}:${row.requirementRuleId}`,
      row.id,
    ])
  )

  const status = computeFhcObligationStatusAfterIdentification()
  const computedAt = new Date()
  let created = 0
  let updated = 0

  for (const [key, pair] of matchedPairs) {
    const existingId = existingByKey.get(key)
    if (existingId) {
      await db
        .update(hrmFhcEmployeeObligation)
        .set({
          outletId: pair.outletId,
          complianceStatus: status,
          computedAt,
          updatedAt: computedAt,
        })
        .where(eq(hrmFhcEmployeeObligation.id, existingId))
      updated += 1
      continue
    }

    await db.insert(hrmFhcEmployeeObligation).values({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      employeeId: pair.employeeId,
      requirementRuleId: pair.ruleId,
      outletId: pair.outletId,
      complianceStatus: status,
      computedAt,
    })
    created += 1
  }

  const staleIds = existing
    .filter(
      (row) => !matchedPairs.has(`${row.employeeId}:${row.requirementRuleId}`)
    )
    .map((row) => row.id)

  let removed = 0
  if (staleIds.length > 0) {
    await db
      .delete(hrmFhcEmployeeObligation)
      .where(
        and(
          eq(hrmFhcEmployeeObligation.organizationId, input.organizationId),
          inArray(hrmFhcEmployeeObligation.id, staleIds)
        )
      )
    removed = staleIds.length
  }

  await refreshAllFhcObligationStatusesForOrg(input.organizationId)

  try {
    await emitFhcExpiryAlertsForOrg({
      organizationId: input.organizationId,
      actorUserId: input.userId,
    })
  } catch {
    // Alerts are best-effort and must not fail obligation recompute.
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.obligationRecompute,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_obligation",
    resourceId: input.organizationId,
    metadata: { created, updated, removed },
  })

  revalidateFhcSurfaces()

  return { ok: true, created, updated, removed }
}
