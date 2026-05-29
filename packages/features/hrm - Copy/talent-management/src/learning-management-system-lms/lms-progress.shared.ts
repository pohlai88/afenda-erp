import type { HrmLmsProgressStatus } from "./schemas/lms-workflow-state.shared"

export const LMS_PROGRESS_TERMINAL_STATUSES = [
  "completed",
  "failed",
  "expired",
  "cancelled",
] as const satisfies readonly HrmLmsProgressStatus[]

export function clampLmsPercentComplete(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function bumpLmsLessonPercent(input: {
  currentPercent: number
  lessonCount: number
}): number {
  if (input.lessonCount <= 0) {
    return input.currentPercent >= 100
      ? 100
      : Math.min(100, input.currentPercent + 25)
  }
  const step = Math.ceil(100 / input.lessonCount)
  return clampLmsPercentComplete(input.currentPercent + step)
}

export function deriveLmsProgressStatusFromPercent(
  percentComplete: number
): "not_started" | "in_progress" | "completed" {
  if (percentComplete <= 0) return "not_started"
  if (percentComplete >= 100) return "completed"
  return "in_progress"
}

export function deriveLmsOverdueStatus(input: {
  status: string
  enrolledAt: Date
  validityDays: number | null
  now?: Date
}): "overdue" | null {
  if (
    LMS_PROGRESS_TERMINAL_STATUSES.includes(
      input.status as (typeof LMS_PROGRESS_TERMINAL_STATUSES)[number]
    )
  ) {
    return null
  }
  if (input.status === "overdue") return "overdue"
  if (input.validityDays == null || input.validityDays <= 0) return null
  const now = input.now ?? new Date()
  const dueAt = new Date(input.enrolledAt)
  dueAt.setDate(dueAt.getDate() + input.validityDays)
  if (now > dueAt) return "overdue"
  return null
}

export function resolveLmsProgressDisplayStatus(input: {
  status: string
  percentComplete: number
  enrolledAt: Date
  validityDays: number | null
}): HrmLmsProgressStatus {
  const overdue = deriveLmsOverdueStatus({
    status: input.status,
    enrolledAt: input.enrolledAt,
    validityDays: input.validityDays,
  })
  if (overdue === "overdue") return "overdue"
  if (
    LMS_PROGRESS_TERMINAL_STATUSES.includes(
      input.status as (typeof LMS_PROGRESS_TERMINAL_STATUSES)[number]
    )
  ) {
    return input.status as HrmLmsProgressStatus
  }
  return deriveLmsProgressStatusFromPercent(input.percentComplete)
}
