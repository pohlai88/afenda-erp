/** HRM-AAT-026 — leave types whose absence reasons are treated as sensitive. */
export const HRM_AAT_SENSITIVE_LEAVE_TYPES = [
  "medical",
  "sick",
  "hospitalization",
  "maternity",
  "paternity",
  "compassionate",
] as const;

export type HrAatSensitiveLeaveType = (typeof HRM_AAT_SENSITIVE_LEAVE_TYPES)[number];

export const AAT_SENSITIVE_REASON_MASK = "Restricted";

export function isHrAatSensitiveLeaveType(
  leaveType: string | null | undefined,
): leaveType is HrAatSensitiveLeaveType {
  if (!leaveType) {
    return false;
  }
  return (HRM_AAT_SENSITIVE_LEAVE_TYPES as readonly string[]).includes(leaveType);
}

export function canViewHrAatSensitiveReason(input: {
  canViewSensitiveReasons: boolean;
  actorEmployeeIds: readonly string[];
  subjectEmployeeId: string;
}): boolean {
  if (input.canViewSensitiveReasons) {
    return true;
  }
  return input.actorEmployeeIds.includes(input.subjectEmployeeId);
}

export function maskHrAatAbsenceReason(input: {
  reason: string | null | undefined;
  leaveType: string | null | undefined;
  canViewSensitiveReasons: boolean;
  actorEmployeeIds: readonly string[];
  subjectEmployeeId: string;
}): string | null {
  const trimmed = input.reason?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  const mayView = canViewHrAatSensitiveReason({
    canViewSensitiveReasons: input.canViewSensitiveReasons,
    actorEmployeeIds: input.actorEmployeeIds,
    subjectEmployeeId: input.subjectEmployeeId,
  });

  if (mayView) {
    return trimmed;
  }

  if (isHrAatSensitiveLeaveType(input.leaveType)) {
    return AAT_SENSITIVE_REASON_MASK;
  }

  return trimmed;
}
