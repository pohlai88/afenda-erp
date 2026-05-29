import { z } from "zod"

import {
  HRM_ENGAGEMENT_CATEGORIES,
  HRM_ENGAGEMENT_IMPROVEMENT_ACTION_STATES,
} from "./engagement-workflow.shared"

export const HRM_ENGAGEMENT_IMPROVEMENT_PRIORITIES = [
  "low",
  "medium",
  "high",
] as const

export type HrmEngagementImprovementPriority =
  (typeof HRM_ENGAGEMENT_IMPROVEMENT_PRIORITIES)[number]

export const hrmEngagementImprovementPrioritySchema = z.enum(
  HRM_ENGAGEMENT_IMPROVEMENT_PRIORITIES
)

export const hrmEngagementImprovementActionStateSchema = z.enum(
  HRM_ENGAGEMENT_IMPROVEMENT_ACTION_STATES
)

export type HrmEngagementImprovementActionState = z.infer<
  typeof hrmEngagementImprovementActionStateSchema
>

const TERMINAL_IMPROVEMENT_STATUSES =
  new Set<HrmEngagementImprovementActionState>(["completed", "cancelled"])

/** UTC calendar day for due-date comparison (HRM-ENG-028). */
export function startOfUtcCalendarDay(reference: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate()
    )
  )
}

/** Normalizes form/DB due dates to `YYYY-MM-DD` for Drizzle `date()` columns. */
export function parseEngagementImprovementDueDate(
  value: string | null | undefined
): string | null {
  if (value == null || value === "") return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10)
}

export function isEngagementImprovementActionOverdue(input: {
  dueDate: string | null | undefined
  status: HrmEngagementImprovementActionState
  reference?: Date
}): boolean {
  if (TERMINAL_IMPROVEMENT_STATUSES.has(input.status)) return false
  const due = parseEngagementImprovementDueDate(input.dueDate ?? undefined)
  if (!due) return false
  const dueAt = new Date(`${due}T00:00:00.000Z`).getTime()
  return dueAt < startOfUtcCalendarDay(input.reference).getTime()
}

const ALLOWED_STATUS_TRANSITIONS: Record<
  HrmEngagementImprovementActionState,
  readonly HrmEngagementImprovementActionState[]
> = {
  open: ["open", "in_progress", "completed", "cancelled"],
  in_progress: ["in_progress", "completed", "cancelled"],
  completed: ["completed"],
  cancelled: ["cancelled"],
}

export function canTransitionEngagementImprovementStatus(
  from: HrmEngagementImprovementActionState,
  to: HrmEngagementImprovementActionState
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to)
}

export const hrmEngagementImprovementCategorySchema = z.enum(
  HRM_ENGAGEMENT_CATEGORIES
)
