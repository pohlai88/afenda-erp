import "server-only"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmMscEmployeeObligation,
  hrmMscSafetyRequirementRule,
} from "@afenda/platform/db/schema"

import { HRM_MSC_AUDIT } from "../msc.contract"
import { refreshAllMscObligationStatusesForOrg } from "./msc-compliance-context.server"
import { computeMscObligationStatusAfterIdentification } from "./msc-compliance-status.shared"
import { resolveMscEmployeeMatchFacts } from "./msc-employee-facts.server"
import { mscRequirementRuleMatchesEmployeeFacts } from "./msc-rule-match.shared"
import { revalidateMscSurfaces } from "./msc-revalidate.server"

export type RecomputeMscObligationsResult =
  | { ok: true; created: number; updated: number; removed: number }
  | { ok: false; form?: string }

/**
 * HRM-MSC-002 — materialize employee obligations from active requirement rules.
 */
export async function recomputeMscObligationsForOrg(input: {
  organizationId: string
  userId: string
  sessionId: string | null
}): Promise<RecomputeMscObligationsResult> {
  const activeRules = await db.query.hrmMscSafetyRequirementRule.findMany({
    where: and(
      eq(hrmMscSafetyRequirementRule.organizationId, input.organizationId),
      eq(hrmMscSafetyRequirementRule.active, true)
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
    { employeeId: string; ruleId: string; siteId: string | null }
  >()

  for (const employee of employees) {
    const facts = await resolveMscEmployeeMatchFacts({
      organizationId: input.organizationId,
      employeeId: employee.id,
    })

    for (const rule of activeRules) {
      const matches = mscRequirementRuleMatchesEmployeeFacts(
        {
          countryCode: rule.countryCode,
          legalEntityRef: rule.legalEntityRef,
          roleRef: rule.roleRef,
          departmentRef: rule.departmentRef,
          riskCategory: rule.riskCategory,
        },
        facts
      )
      if (!matches) continue
      const key = `${employee.id}:${rule.id}`
      matchedPairs.set(key, {
        employeeId: employee.id,
        ruleId: rule.id,
        siteId: rule.siteId,
      })
    }
  }

  const existing = await db.query.hrmMscEmployeeObligation.findMany({
    where: eq(hrmMscEmployeeObligation.organizationId, input.organizationId),
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

  const status = computeMscObligationStatusAfterIdentification()
  const computedAt = new Date()
  let created = 0
  let updated = 0

  for (const [key, pair] of matchedPairs) {
    const existingId = existingByKey.get(key)
    if (existingId) {
      await db
        .update(hrmMscEmployeeObligation)
        .set({
          siteId: pair.siteId,
          complianceStatus: status,
          computedAt,
          updatedAt: computedAt,
        })
        .where(eq(hrmMscEmployeeObligation.id, existingId))
      updated += 1
      continue
    }

    await db.insert(hrmMscEmployeeObligation).values({
      organizationId: input.organizationId,
      employeeId: pair.employeeId,
      requirementRuleId: pair.ruleId,
      siteId: pair.siteId,
      complianceStatus: status,
      computedAt,
    })
    created += 1
  }

  const matchedKeys = new Set(matchedPairs.keys())
  const toRemove = existing.filter(
    (row) => !matchedKeys.has(`${row.employeeId}:${row.requirementRuleId}`)
  )
  if (toRemove.length > 0) {
    await db.delete(hrmMscEmployeeObligation).where(
      inArray(
        hrmMscEmployeeObligation.id,
        toRemove.map((row) => row.id)
      )
    )
  }

  await refreshAllMscObligationStatusesForOrg(input.organizationId)

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.obligationRecompute,
    organizationId: input.organizationId,
    actorUserId: input.userId,
    actorSessionId: input.sessionId,
    resourceType: "manufacturing_safety_obligation",
    resourceId: input.organizationId,
    metadata: { created, updated, removed: toRemove.length },
  })

  revalidateMscSurfaces()

  return {
    ok: true,
    created,
    updated,
    removed: toRemove.length,
  }
}
