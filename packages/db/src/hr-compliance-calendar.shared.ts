/** HRM-CMP-010 / HRM-CMP-016 — UTC calendar-day deadline posture. */
export const HR_COMPLIANCE_DEADLINE_POSTURES = [
  "upcoming",
  "due_today",
  "overdue",
] as const;

export type HrComplianceDeadlinePosture =
  (typeof HR_COMPLIANCE_DEADLINE_POSTURES)[number];

export function utcComplianceDayBounds(now: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return { start, end };
}

export function deriveComplianceDeadlinePosture(input: {
  deadlineAt: Date;
  now?: Date;
}): HrComplianceDeadlinePosture {
  const now = input.now ?? new Date();
  const { start: startOfToday, end: endOfToday } = utcComplianceDayBounds(now);

  if (input.deadlineAt.getTime() < startOfToday.getTime()) {
    return "overdue";
  }

  if (input.deadlineAt.getTime() < endOfToday.getTime()) {
    return "due_today";
  }

  return "upcoming";
}
