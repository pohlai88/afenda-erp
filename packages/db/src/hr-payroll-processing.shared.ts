export class HrPayrollCommandError extends Error {
  readonly code:
    | "run_not_found"
    | "cycle_not_found"
    | "group_not_found"
    | "employee_not_found"
    | "payslip_not_found"
    | "batch_not_found"
    | "invalid_status_transition"
    | "run_locked"
    | "blocking_validation_errors"
    | "not_authorized"
    | "already_finalized"
    | "already_closed";

  constructor(code: HrPayrollCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrPayrollCommandError";
    this.code = code;
  }
}

export function parsePayrollNumeric(value: string | null | undefined): number {
  if (value === null || value === undefined || value.trim() === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPayrollNumeric(value: number, scale = 2): string {
  return value.toFixed(scale);
}

export const HR_PAYROLL_LOCKED_STATUSES = ["locked", "closed", "cancelled"] as const;

export const HR_PAYROLL_EDITABLE_STATUSES = [
  "draft",
  "open",
  "input_collection",
  "validation",
  "preview",
  "pending_approval",
  "approved",
] as const;

export function isHrPayrollRunLocked(
  status: string,
  lockedAt: Date | null | undefined,
): boolean {
  return (
    lockedAt != null ||
    (HR_PAYROLL_LOCKED_STATUSES as readonly string[]).includes(status)
  );
}

const PAYROLL_RUN_TRANSITIONS: Record<string, readonly string[]> = {
  draft: ["validation", "open"],
  open: ["input_collection", "validation"],
  input_collection: ["validation"],
  validation: ["preview", "draft"],
  preview: ["pending_approval", "validation"],
  pending_approval: ["approved", "preview"],
  approved: ["locked", "pending_approval"],
  locked: ["closed"],
  closed: ["cancelled"],
  cancelled: [],
};

export function assertHrPayrollRunStatusTransition(
  current: string,
  next: string,
): void {
  const allowed = PAYROLL_RUN_TRANSITIONS[current];
  if (!allowed?.includes(next)) {
    throw new HrPayrollCommandError(
      "invalid_status_transition",
      `Cannot transition payroll run from ${current} to ${next}`,
    );
  }
}
