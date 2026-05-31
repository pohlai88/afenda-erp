export class HrCompensationCommandError extends Error {
  readonly code:
    | "cycle_not_found"
    | "pool_not_found"
    | "participant_not_found"
    | "recommendation_not_found"
    | "employee_not_found"
    | "invalid_eligibility_config"
    | "invalid_budget_pool_scope"
    | "invalid_increase_input"
    | "justification_required"
    | "recommendation_locked"
    | "invalid_status_transition"
    | "approval_step_not_found"
    | "salary_change_exists";

  constructor(code: HrCompensationCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrCompensationCommandError";
    this.code = code;
  }
}

export function parseNumeric(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatNumeric(value: number, scale = 4): string {
  return value.toFixed(scale);
}

export const HR_COMPENSATION_LOCKED_STATUSES = [
  "approved",
] as const;

export const HR_COMPENSATION_EDITABLE_STATUSES = [
  "draft",
  "submitted",
  "hr_review",
  "pending_approval",
  "returned",
] as const;

export function isHrCompensationRecommendationLocked(
  status: string,
  lockedAt: Date | null | undefined,
): boolean {
  return (
    lockedAt != null ||
    (HR_COMPENSATION_LOCKED_STATUSES as readonly string[]).includes(status)
  );
}
