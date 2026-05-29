import "server-only"

import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmMscEmployeeObligation,
  hrmMscMachine,
  hrmMscRegulatoryReference,
  hrmMscSafetyRequirementRule,
  hrmMscSite,
  hrmMscWorkRestriction,
} from "@afenda/platform/db/schema"

import { HRM_MSC_AUDIT } from "../msc.contract"
import { refreshMscObligationComplianceStatus } from "./msc-compliance-context.server"
import { revalidateMscSurfaces } from "./msc-revalidate.server"
import type {
  HrmMscRegulatoryFramework,
  HrmMscRestrictionScope,
} from "../schemas/msc-workflow-state.shared"

async function assertEmployeeInOrg(input: {
  organizationId: string
  employeeId: string
}): Promise<{ ok: true } | { ok: false; form: string }> {
  const row = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.id, input.employeeId),
      eq(hrmEmployee.organizationId, input.organizationId)
    ),
    columns: { id: true },
  })
  if (!row) {
    return { ok: false, form: "Employee was not found in this organization." }
  }
  return { ok: true }
}

async function assertObligationInOrg(input: {
  organizationId: string
  obligationId: string
  employeeId: string
}): Promise<{ ok: true } | { ok: false; form: string }> {
  const row = await db.query.hrmMscEmployeeObligation.findFirst({
    where: eq(hrmMscEmployeeObligation.id, input.obligationId),
    columns: { id: true, organizationId: true, employeeId: true },
  })
  if (!row || row.organizationId !== input.organizationId) {
    return { ok: false, form: "Obligation was not found." }
  }
  if (row.employeeId !== input.employeeId) {
    return {
      ok: false,
      form: "Obligation does not belong to the selected employee.",
    }
  }
  return { ok: true }
}

export async function createMscRegulatoryReference(input: {
  organizationId: string
  userId: string
  framework: HrmMscRegulatoryFramework
  referenceCode?: string | null
  referenceLabel?: string | null
  notes?: string | null
  siteId?: string | null
  requirementRuleId?: string | null
}): Promise<{ ok: true; referenceId: string } | { ok: false; form?: string }> {
  if (input.siteId) {
    const site = await db.query.hrmMscSite.findFirst({
      where: eq(hrmMscSite.id, input.siteId),
      columns: { id: true, organizationId: true },
    })
    if (!site || site.organizationId !== input.organizationId) {
      return { ok: false, form: "Site was not found." }
    }
  }

  if (input.requirementRuleId) {
    const rule = await db.query.hrmMscSafetyRequirementRule.findFirst({
      where: eq(hrmMscSafetyRequirementRule.id, input.requirementRuleId),
      columns: { id: true, organizationId: true },
    })
    if (!rule || rule.organizationId !== input.organizationId) {
      return { ok: false, form: "Requirement rule was not found." }
    }
  }

  const referenceId = crypto.randomUUID()
  await db.insert(hrmMscRegulatoryReference).values({
    id: referenceId,
    organizationId: input.organizationId,
    siteId: input.siteId ?? null,
    requirementRuleId: input.requirementRuleId ?? null,
    framework: input.framework,
    referenceCode: input.referenceCode?.trim() || null,
    referenceLabel: input.referenceLabel?.trim() || null,
    notes: input.notes?.trim() || null,
    createdByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.regulatoryReferenceCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_regulatory_reference",
    resourceId: referenceId,
    metadata: { framework: input.framework },
  })

  revalidateMscSurfaces()
  return { ok: true, referenceId }
}

export async function createMscWorkRestriction(input: {
  organizationId: string
  userId: string
  employeeId: string
  obligationId?: string | null
  machineId?: string | null
  restrictionScope: HrmMscRestrictionScope
  effectiveFrom: string
  effectiveTo?: string | null
  reason?: string | null
}): Promise<
  { ok: true; restrictionId: string } | { ok: false; form?: string }
> {
  const employeeCheck = await assertEmployeeInOrg({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  })
  if (!employeeCheck.ok) {
    return { ok: false, form: employeeCheck.form }
  }

  if (input.obligationId) {
    const obligationCheck = await assertObligationInOrg({
      organizationId: input.organizationId,
      obligationId: input.obligationId,
      employeeId: input.employeeId,
    })
    if (!obligationCheck.ok) {
      return { ok: false, form: obligationCheck.form }
    }
  }

  if (input.machineId) {
    const machine = await db.query.hrmMscMachine.findFirst({
      where: eq(hrmMscMachine.id, input.machineId),
      columns: { id: true, organizationId: true },
    })
    if (!machine || machine.organizationId !== input.organizationId) {
      return { ok: false, form: "Machine was not found." }
    }
  }

  const effectiveFrom = input.effectiveFrom.trim()
  if (!effectiveFrom) {
    return { ok: false, form: "Effective from date is required." }
  }

  const restrictionId = crypto.randomUUID()
  await db.insert(hrmMscWorkRestriction).values({
    id: restrictionId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    obligationId: input.obligationId ?? null,
    machineId: input.machineId ?? null,
    restrictionScope: input.restrictionScope,
    effectiveFrom,
    effectiveTo: input.effectiveTo?.trim() || null,
    reason: input.reason?.trim() || null,
    createdByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.workRestrictionCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_work_restriction",
    resourceId: restrictionId,
    metadata: {
      employeeId: input.employeeId,
      restrictionScope: input.restrictionScope,
    },
  })

  if (input.obligationId) {
    await refreshMscObligationComplianceStatus({
      organizationId: input.organizationId,
      obligationId: input.obligationId,
    })
  }

  revalidateMscSurfaces()
  return { ok: true, restrictionId }
}
