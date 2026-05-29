import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEngagementImprovementAction,
  hrmEngagementSurvey,
} from "@afenda/platform/db/schema"

import {
  isEngagementImprovementActionOverdue,
  type HrmEngagementImprovementActionState,
} from "../schemas/engagement-improvement.shared"
import type {
  EngagementImprovementActionListRow,
  EngagementImprovementOwnerOption,
} from "../schemas/engagement-query.shared"

function formatEmployeeLabel(input: {
  employeeNumber: string
  legalName: string
  preferredName: string | null
}): string {
  const name = input.preferredName?.trim() || input.legalName
  return `${input.employeeNumber} — ${name}`
}

export async function listEngagementImprovementOwnerOptions(
  organizationId: string
): Promise<readonly EngagementImprovementOwnerOption[]> {
  const rows = await db
    .select({
      id: hrmEmployee.id,
      employeeNumber: hrmEmployee.employeeNumber,
      legalName: hrmEmployee.legalName,
      preferredName: hrmEmployee.preferredName,
    })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, organizationId),
        eq(hrmEmployee.employmentStatus, "active")
      )
    )
    .orderBy(asc(hrmEmployee.employeeNumber))

  return rows.map((row) => ({
    id: row.id,
    label: formatEmployeeLabel(row),
  }))
}

export async function listEngagementImprovementActionsForSurvey(input: {
  organizationId: string
  surveyId: string
}): Promise<readonly EngagementImprovementActionListRow[]> {
  const actions = await db
    .select({
      id: hrmEngagementImprovementAction.id,
      title: hrmEngagementImprovementAction.title,
      ownerEmployeeId: hrmEngagementImprovementAction.ownerEmployeeId,
      dueDate: hrmEngagementImprovementAction.dueDate,
      priority: hrmEngagementImprovementAction.priority,
      status: hrmEngagementImprovementAction.status,
      category: hrmEngagementImprovementAction.category,
      updatedAt: hrmEngagementImprovementAction.updatedAt,
    })
    .from(hrmEngagementImprovementAction)
    .where(
      and(
        eq(hrmEngagementImprovementAction.organizationId, input.organizationId),
        eq(hrmEngagementImprovementAction.surveyId, input.surveyId)
      )
    )
    .orderBy(
      asc(hrmEngagementImprovementAction.dueDate),
      asc(hrmEngagementImprovementAction.title)
    )

  const ownerIds = [
    ...new Set(
      actions
        .map((row) => row.ownerEmployeeId)
        .filter((id): id is string => id != null)
    ),
  ]

  const ownerLabels = new Map<string, string>()
  if (ownerIds.length > 0) {
    const owners = await db
      .select({
        id: hrmEmployee.id,
        employeeNumber: hrmEmployee.employeeNumber,
        legalName: hrmEmployee.legalName,
        preferredName: hrmEmployee.preferredName,
      })
      .from(hrmEmployee)
      .where(
        and(
          eq(hrmEmployee.organizationId, input.organizationId),
          inArray(hrmEmployee.id, ownerIds)
        )
      )

    for (const owner of owners) {
      ownerLabels.set(owner.id, formatEmployeeLabel(owner))
    }
  }

  return actions.map((row) => {
    const status = row.status as HrmEngagementImprovementActionState
    const dueDate = row.dueDate ? String(row.dueDate).slice(0, 10) : null

    return {
      id: row.id,
      title: row.title,
      ownerLabel: row.ownerEmployeeId
        ? (ownerLabels.get(row.ownerEmployeeId) ?? null)
        : null,
      dueDate,
      priority: row.priority,
      status,
      category: row.category,
      isOverdue: isEngagementImprovementActionOverdue({
        dueDate: row.dueDate,
        status,
      }),
      updatedAt: row.updatedAt,
    }
  })
}

export async function assertEngagementSurveyAllowsImprovementActions(input: {
  organizationId: string
  surveyId: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const [survey] = await db
    .select({ state: hrmEngagementSurvey.state })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) return { ok: false, message: "Survey not found." }
  if (survey.state !== "published" && survey.state !== "closed") {
    return {
      ok: false,
      message:
        "Improvement actions are available after the survey is published.",
    }
  }
  return { ok: true }
}
