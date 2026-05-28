import "server-only"

import { and, asc, eq, inArray, isNull, or } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmGpgEmployeeAssignment,
  hrmGpgStepIncreaseEvent,
  hrmGpgStepIncreaseRule,
} from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import type { HrmGpgStepIncreaseEventState } from "../schemas/gpg-workflow-state.shared"
import { formatGpgPayGradeLabel } from "./gpg-display.shared"
import { listGpgPayGradesForOrg } from "./gpg-pay-structure.server"
import { findGpgSalaryTableRowForGradeStep } from "./gpg-salary-tables.server"
import {
  computeGpgNextEligibilityDate,
  countDaysUntilEligibility,
  isGpgStepEligibleAsOf,
} from "./gpg-step-eligibility.shared"
import { mapLatestClosedManagerRatingsForEmployees } from "./gpg-performance-reference.server"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import {
  buildGpgStepRulePolicyJson,
  meetsGpgMinManagerRating,
  parseGpgStepRulePolicy,
} from "./gpg-step-rule-policy.shared"
import type {
  GpgStepEligibleRow,
  GpgStepIncreaseEventRow,
  GpgStepIncreaseRuleChoiceRow,
  GpgStepIncreaseRuleRow,
  GpgStepIncreaseSummary,
} from "./gpg.types.shared"

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatEmployeeLabel(row: {
  employeeNumber: string | null
  legalName: string
  preferredName: string | null
}) {
  const name = row.preferredName?.trim() || row.legalName
  return row.employeeNumber ? `${row.employeeNumber} — ${name}` : name
}

export async function listGpgStepIncreaseRulesForOrg(
  organizationId: string
): Promise<GpgStepIncreaseRuleRow[]> {
  const rows = await db.query.hrmGpgStepIncreaseRule.findMany({
    where: eq(hrmGpgStepIncreaseRule.organizationId, organizationId),
    orderBy: [asc(hrmGpgStepIncreaseRule.code)],
  })
  return rows.map((row) => {
    const policy = parseGpgStepRulePolicy(row.policyJson)
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      waitingPeriodMonths: row.waitingPeriodMonths,
      requiresApproval: row.requiresApproval,
      minManagerRating: policy.minManagerRating ?? null,
      state: row.state as GpgStepIncreaseRuleRow["state"],
    }
  })
}

export async function listGpgActiveStepIncreaseRuleChoicesForOrg(
  organizationId: string
): Promise<GpgStepIncreaseRuleChoiceRow[]> {
  const rows = await listGpgStepIncreaseRulesForOrg(organizationId)
  return rows
    .filter((row) => row.state === "active")
    .map((row) => ({
      id: row.id,
      label: `${row.code} — ${row.name}`,
    }))
}

async function resolveDefaultActiveRule(
  organizationId: string
): Promise<(GpgStepIncreaseRuleRow & { policyJson: unknown }) | null> {
  const row = await db.query.hrmGpgStepIncreaseRule.findFirst({
    where: and(
      eq(hrmGpgStepIncreaseRule.organizationId, organizationId),
      eq(hrmGpgStepIncreaseRule.state, "active")
    ),
  })
  if (!row) return null
  const policy = parseGpgStepRulePolicy(row.policyJson)
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    waitingPeriodMonths: row.waitingPeriodMonths,
    requiresApproval: row.requiresApproval,
    minManagerRating: policy.minManagerRating ?? null,
    state: row.state as GpgStepIncreaseRuleRow["state"],
    policyJson: row.policyJson,
  }
}

async function listOpenEventAssignmentIds(organizationId: string) {
  const events = await db.query.hrmGpgStepIncreaseEvent.findMany({
    where: and(
      eq(hrmGpgStepIncreaseEvent.organizationId, organizationId),
      inArray(hrmGpgStepIncreaseEvent.state, ["pending", "approved"])
    ),
    columns: { assignmentId: true },
  })
  return new Set(
    events
      .map((row) => row.assignmentId)
      .filter((id): id is string => Boolean(id))
  )
}

export async function listGpgStepEligibleForOrg(
  organizationId: string,
  asOfDate: string = todayIsoDate()
): Promise<GpgStepEligibleRow[]> {
  const rule = await resolveDefaultActiveRule(organizationId)
  if (!rule) return []

  const policy = parseGpgStepRulePolicy(rule.policyJson)
  const minManagerRating = policy.minManagerRating

  const [assignments, grades, employees, blockedAssignmentIds] =
    await Promise.all([
      db.query.hrmGpgEmployeeAssignment.findMany({
        where: and(
          eq(hrmGpgEmployeeAssignment.organizationId, organizationId),
          eq(hrmGpgEmployeeAssignment.state, "active"),
          isNull(hrmGpgEmployeeAssignment.effectiveTo)
        ),
      }),
      listGpgPayGradesForOrg(organizationId),
      db
        .select({
          id: hrmEmployee.id,
          legalName: hrmEmployee.legalName,
          preferredName: hrmEmployee.preferredName,
          employeeNumber: hrmEmployee.employeeNumber,
        })
        .from(hrmEmployee)
        .where(eq(hrmEmployee.organizationId, organizationId)),
      listOpenEventAssignmentIds(organizationId),
    ])

  const employeeIds = assignments.map((row) => row.employeeId)
  const performanceByEmployee = await mapLatestClosedManagerRatingsForEmployees(
    {
      organizationId,
      employeeIds,
    }
  )

  const gradeMap = new Map(grades.map((row) => [row.id, row] as const))
  const employeeMap = new Map(
    employees.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )

  const eligible: GpgStepEligibleRow[] = []

  for (const assignment of assignments) {
    if (blockedAssignmentIds.has(assignment.id)) continue
    if (!assignment.salaryTableVersionId) continue

    const eligibilityDate = computeGpgNextEligibilityDate(
      assignment.effectiveFrom,
      rule.waitingPeriodMonths
    )
    if (!eligibilityDate || !isGpgStepEligibleAsOf(eligibilityDate, asOfDate)) {
      continue
    }

    const nextStep = assignment.step + 1
    const nextRow = await findGpgSalaryTableRowForGradeStep({
      organizationId,
      tableVersionId: assignment.salaryTableVersionId,
      payGradeId: assignment.payGradeId,
      step: nextStep,
    })
    if (!nextRow) continue

    const performance = performanceByEmployee.get(assignment.employeeId)
    const managerRating = performance?.managerRating ?? null
    const performanceGateMet = meetsGpgMinManagerRating({
      managerRating,
      minManagerRating,
    })
    if (!performanceGateMet) continue

    const grade = gradeMap.get(assignment.payGradeId)
    const daysUntil = countDaysUntilEligibility(eligibilityDate, asOfDate)
    if (daysUntil === null) continue

    eligible.push({
      assignmentId: assignment.id,
      employeeId: assignment.employeeId,
      employeeLabel:
        employeeMap.get(assignment.employeeId) ?? assignment.employeeId,
      payGradeLabel: grade
        ? formatGpgPayGradeLabel(grade)
        : assignment.payGradeId,
      step: assignment.step,
      nextStep,
      effectiveFrom: assignment.effectiveFrom,
      eligibilityDate,
      ruleId: rule.id,
      ruleCode: rule.code,
      daysUntilEligible: daysUntil,
      managerRating,
      performanceGateMet,
    })
  }

  return eligible.sort((a, b) => a.daysUntilEligible - b.daysUntilEligible)
}

export async function summarizeGpgStepIncreaseForOrg(
  organizationId: string
): Promise<GpgStepIncreaseSummary> {
  const [eligible, rules, pendingEvents] = await Promise.all([
    listGpgStepEligibleForOrg(organizationId),
    listGpgStepIncreaseRulesForOrg(organizationId),
    db.query.hrmGpgStepIncreaseEvent.findMany({
      where: and(
        eq(hrmGpgStepIncreaseEvent.organizationId, organizationId),
        eq(hrmGpgStepIncreaseEvent.state, "pending")
      ),
      columns: { id: true },
    }),
  ])

  return {
    eligibleCount: eligible.length,
    pendingApprovalCount: pendingEvents.length,
    activeRuleCount: rules.filter((row) => row.state === "active").length,
  }
}

export async function listGpgStepIncreaseEventsForOrg(
  organizationId: string
): Promise<GpgStepIncreaseEventRow[]> {
  const events = await db.query.hrmGpgStepIncreaseEvent.findMany({
    where: eq(hrmGpgStepIncreaseEvent.organizationId, organizationId),
    orderBy: [asc(hrmGpgStepIncreaseEvent.createdAt)],
  })
  if (events.length === 0) return []

  const ruleIds = [...new Set(events.map((row) => row.ruleId))]
  const employeeIds = [...new Set(events.map((row) => row.employeeId))]
  const assignmentIds = [
    ...new Set(
      events
        .map((row) => row.assignmentId)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const [rules, employees, assignments, grades] = await Promise.all([
    db.query.hrmGpgStepIncreaseRule.findMany({
      where: and(
        eq(hrmGpgStepIncreaseRule.organizationId, organizationId),
        inArray(hrmGpgStepIncreaseRule.id, ruleIds)
      ),
    }),
    db
      .select({
        id: hrmEmployee.id,
        legalName: hrmEmployee.legalName,
        preferredName: hrmEmployee.preferredName,
        employeeNumber: hrmEmployee.employeeNumber,
      })
      .from(hrmEmployee)
      .where(
        and(
          eq(hrmEmployee.organizationId, organizationId),
          inArray(hrmEmployee.id, employeeIds)
        )
      ),
    assignmentIds.length > 0
      ? db.query.hrmGpgEmployeeAssignment.findMany({
          where: inArray(hrmGpgEmployeeAssignment.id, assignmentIds),
        })
      : Promise.resolve([]),
    listGpgPayGradesForOrg(organizationId),
  ])

  const ruleMap = new Map(rules.map((row) => [row.id, row] as const))
  const employeeMap = new Map(
    employees.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )
  const assignmentMap = new Map(
    assignments.map((row) => [row.id, row] as const)
  )
  const gradeMap = new Map(grades.map((row) => [row.id, row] as const))

  return events.map((event) => {
    const rule = ruleMap.get(event.ruleId)
    const assignment = event.assignmentId
      ? assignmentMap.get(event.assignmentId)
      : undefined
    const grade = assignment ? gradeMap.get(assignment.payGradeId) : undefined
    const fromStep = assignment?.step ?? 0

    return {
      id: event.id,
      employeeId: event.employeeId,
      employeeLabel: employeeMap.get(event.employeeId) ?? event.employeeId,
      ruleCode: rule?.code ?? "—",
      payGradeLabel: grade ? formatGpgPayGradeLabel(grade) : "—",
      fromStep,
      toStep: fromStep > 0 ? fromStep + 1 : 0,
      eligibilityDate: event.eligibilityDate,
      state: event.state as HrmGpgStepIncreaseEventState,
      requiresApproval: rule?.requiresApproval ?? true,
    }
  })
}

export async function createGpgStepIncreaseRule(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  waitingPeriodMonths: number
  requiresApproval: boolean
  minManagerRating?: number | null
}): Promise<{ ok: true; ruleId: string } | { ok: false; form?: string }> {
  const existing = await db.query.hrmGpgStepIncreaseRule.findFirst({
    where: and(
      eq(hrmGpgStepIncreaseRule.organizationId, input.organizationId),
      eq(hrmGpgStepIncreaseRule.code, input.code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return {
      ok: false,
      form: "A step increase rule with this code already exists.",
    }
  }

  const id = crypto.randomUUID()
  const policyJson = buildGpgStepRulePolicyJson({
    minManagerRating: input.minManagerRating ?? null,
  })

  await db.insert(hrmGpgStepIncreaseRule).values({
    id,
    organizationId: input.organizationId,
    code: input.code,
    name: input.name,
    waitingPeriodMonths: input.waitingPeriodMonths,
    requiresApproval: input.requiresApproval,
    policyJson,
    state: "active",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.stepIncreaseRuleCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_step_increase_rule",
    resourceId: id,
    metadata: { code: input.code },
  })

  revalidateGpgSurfaces()
  return { ok: true, ruleId: id }
}

export async function createGpgStepIncreaseEvent(input: {
  organizationId: string
  userId: string
  assignmentId: string
  ruleId: string
}): Promise<{ ok: true; eventId: string } | { ok: false; form?: string }> {
  const assignment = await db.query.hrmGpgEmployeeAssignment.findFirst({
    where: and(
      eq(hrmGpgEmployeeAssignment.organizationId, input.organizationId),
      eq(hrmGpgEmployeeAssignment.id, input.assignmentId),
      eq(hrmGpgEmployeeAssignment.state, "active")
    ),
  })
  if (!assignment) {
    return { ok: false, form: "Active assignment not found." }
  }

  const rule = await db.query.hrmGpgStepIncreaseRule.findFirst({
    where: and(
      eq(hrmGpgStepIncreaseRule.organizationId, input.organizationId),
      eq(hrmGpgStepIncreaseRule.id, input.ruleId),
      eq(hrmGpgStepIncreaseRule.state, "active")
    ),
  })
  if (!rule) {
    return { ok: false, form: "Active step increase rule not found." }
  }

  const eligibilityDate = computeGpgNextEligibilityDate(
    assignment.effectiveFrom,
    rule.waitingPeriodMonths
  )
  if (
    !eligibilityDate ||
    !isGpgStepEligibleAsOf(eligibilityDate, todayIsoDate())
  ) {
    return {
      ok: false,
      form: "Employee is not yet eligible for a step increase.",
    }
  }

  const openEvent = await db.query.hrmGpgStepIncreaseEvent.findFirst({
    where: and(
      eq(hrmGpgStepIncreaseEvent.organizationId, input.organizationId),
      eq(hrmGpgStepIncreaseEvent.assignmentId, input.assignmentId),
      or(
        eq(hrmGpgStepIncreaseEvent.state, "pending"),
        eq(hrmGpgStepIncreaseEvent.state, "approved")
      )
    ),
    columns: { id: true },
  })
  if (openEvent) {
    return {
      ok: false,
      form: "A pending or approved step increase already exists for this assignment.",
    }
  }

  const nextStep = assignment.step + 1
  if (!assignment.salaryTableVersionId) {
    return { ok: false, form: "Assignment has no salary table version." }
  }
  const nextRow = await findGpgSalaryTableRowForGradeStep({
    organizationId: input.organizationId,
    tableVersionId: assignment.salaryTableVersionId,
    payGradeId: assignment.payGradeId,
    step: nextStep,
  })
  if (!nextRow) {
    return {
      ok: false,
      form: "No salary table row exists for the next step on this assignment.",
    }
  }

  const id = crypto.randomUUID()
  const initialState: HrmGpgStepIncreaseEventState = rule.requiresApproval
    ? "pending"
    : "approved"

  await db.insert(hrmGpgStepIncreaseEvent).values({
    id,
    organizationId: input.organizationId,
    employeeId: assignment.employeeId,
    ruleId: rule.id,
    assignmentId: assignment.id,
    eligibilityDate,
    state: initialState,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.stepIncreaseEventCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_step_increase",
    resourceId: id,
    metadata: {
      employeeId: assignment.employeeId,
      fromStep: assignment.step,
      toStep: nextStep,
    },
  })

  revalidateGpgSurfaces()

  if (!rule.requiresApproval) {
    return processGpgStepIncreaseEvent({
      organizationId: input.organizationId,
      userId: input.userId,
      eventId: id,
    }).then((result) =>
      result.ok ? { ok: true, eventId: id } : { ok: false, form: result.form }
    )
  }

  return { ok: true, eventId: id }
}

export async function decideGpgStepIncreaseEvent(input: {
  organizationId: string
  userId: string
  eventId: string
  decision: "approved" | "rejected"
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const event = await db.query.hrmGpgStepIncreaseEvent.findFirst({
    where: and(
      eq(hrmGpgStepIncreaseEvent.organizationId, input.organizationId),
      eq(hrmGpgStepIncreaseEvent.id, input.eventId)
    ),
  })
  if (!event) {
    return { ok: false, form: "Step increase event not found." }
  }
  if (event.state !== "pending") {
    return { ok: false, form: "Only pending events can be decided." }
  }

  await db
    .update(hrmGpgStepIncreaseEvent)
    .set({
      state: input.decision,
      updatedAt: new Date(),
    })
    .where(eq(hrmGpgStepIncreaseEvent.id, input.eventId))

  revalidateGpgSurfaces()

  if (input.decision === "approved") {
    return processGpgStepIncreaseEvent({
      organizationId: input.organizationId,
      userId: input.userId,
      eventId: input.eventId,
    })
  }

  return { ok: true }
}

export async function processGpgStepIncreaseEvent(input: {
  organizationId: string
  userId: string
  eventId: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const event = await db.query.hrmGpgStepIncreaseEvent.findFirst({
    where: and(
      eq(hrmGpgStepIncreaseEvent.organizationId, input.organizationId),
      eq(hrmGpgStepIncreaseEvent.id, input.eventId)
    ),
  })
  if (!event) {
    return { ok: false, form: "Step increase event not found." }
  }
  if (event.state === "processed") {
    return { ok: true }
  }
  if (event.state !== "approved") {
    return { ok: false, form: "Event must be approved before processing." }
  }
  if (!event.assignmentId) {
    return { ok: false, form: "Event is not linked to an assignment." }
  }

  const assignment = await db.query.hrmGpgEmployeeAssignment.findFirst({
    where: and(
      eq(hrmGpgEmployeeAssignment.organizationId, input.organizationId),
      eq(hrmGpgEmployeeAssignment.id, event.assignmentId),
      eq(hrmGpgEmployeeAssignment.state, "active")
    ),
  })
  if (!assignment || !assignment.salaryTableVersionId) {
    return {
      ok: false,
      form: "Active assignment with salary table is required.",
    }
  }

  const fromStep = assignment.step
  const nextStep = fromStep + 1
  const nextRow = await findGpgSalaryTableRowForGradeStep({
    organizationId: input.organizationId,
    tableVersionId: assignment.salaryTableVersionId,
    payGradeId: assignment.payGradeId,
    step: nextStep,
  })
  if (!nextRow) {
    return {
      ok: false,
      form: "No salary table row exists for the next step.",
    }
  }

  await db
    .update(hrmGpgEmployeeAssignment)
    .set({ step: nextStep, updatedAt: new Date() })
    .where(eq(hrmGpgEmployeeAssignment.id, assignment.id))

  await db
    .update(hrmGpgStepIncreaseEvent)
    .set({ state: "processed", updatedAt: new Date() })
    .where(eq(hrmGpgStepIncreaseEvent.id, event.id))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.stepIncreaseProcess,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_step_increase",
    resourceId: event.id,
    metadata: {
      employeeId: event.employeeId,
      fromStep,
      toStep: nextStep,
    },
  })

  revalidateGpgSurfaces()
  return { ok: true }
}

export async function processGpgStepIncreaseAutoBatch(input: {
  organizationId: string
  userId: string
}): Promise<
  | { ok: true; processedCount: number; skippedCount: number }
  | { ok: false; form?: string }
> {
  const rules = await listGpgStepIncreaseRulesForOrg(input.organizationId)
  const autoRules = rules.filter(
    (row) => row.state === "active" && !row.requiresApproval
  )
  if (autoRules.length === 0) {
    return {
      ok: false,
      form: "No active step increase rules with automatic processing.",
    }
  }

  const eligible = await listGpgStepEligibleForOrg(input.organizationId)
  let processedCount = 0
  let skippedCount = 0

  for (const row of eligible) {
    const result = await createGpgStepIncreaseEvent({
      organizationId: input.organizationId,
      userId: input.userId,
      assignmentId: row.assignmentId,
      ruleId: row.ruleId,
    })
    if (result.ok) {
      processedCount += 1
    } else {
      skippedCount += 1
    }
  }

  return { ok: true, processedCount, skippedCount }
}
