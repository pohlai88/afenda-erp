export class HrLmsCommandError extends Error {
  readonly code:
    | "course_not_found"
    | "path_not_found"
    | "enrollment_not_found"
    | "attempt_limit_exceeded"
    | "passing_score_not_met"
    | "approval_required"
    | "self_enrollment_disabled"
    | "duplicate_enrollment"
    | "invalid_progress_transition";

  constructor(code: HrLmsCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrLmsCommandError";
    this.code = code;
  }
}

export const HR_LMS_PROGRESS_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "failed",
  "overdue",
  "expired",
  "renewed",
  "cancelled",
] as const;

export type HrLmsProgressStatus = (typeof HR_LMS_PROGRESS_STATUSES)[number];

export function assertHrLmsPassingScore(input: {
  score: number;
  passingScore: number | null | undefined;
}): void {
  if (input.passingScore == null) {
    return;
  }
  if (input.score < input.passingScore) {
    throw new HrLmsCommandError("passing_score_not_met");
  }
}

export function assertHrLmsAttemptLimit(input: {
  attemptCount: number;
  attemptLimit: number | null | undefined;
}): void {
  if (input.attemptLimit == null) {
    return;
  }
  if (input.attemptCount >= input.attemptLimit) {
    throw new HrLmsCommandError("attempt_limit_exceeded");
  }
}
