import type { hrOvertimeRequests } from "./hr";

export type HrOvertimeRequestStatus =
  (typeof hrOvertimeRequests.$inferSelect)["status"];

export type HrOvertimeType =
  (typeof hrOvertimeRequests.$inferSelect)["overtimeType"];

export type HrOvertimeTimingKind =
  (typeof hrOvertimeRequests.$inferSelect)["timingKind"];

/** HRM-OTM-003 — planned vs actual overtime timing. */
export const HRM_OTM_TIMING_KINDS = ["planned", "actual"] as const satisfies readonly HrOvertimeTimingKind[];

/**
 * HRM-OTM-006 — enterprise overtime day categories (maps to `hr_overtime_type` enum).
 * Includes `weekend` / `holiday` for statutory catalog completeness.
 */
export const HRM_OTM_DAY_CATEGORIES = [
  "regular",
  "rest_day",
  "off_day",
  "public_holiday",
  "night",
  "emergency",
  "weekend",
  "holiday",
] as const satisfies readonly HrOvertimeType[];

/** Statuses visible in employee "my requests" and manager/HR operational views (AC 22). */
export const HRM_OTM_VISIBLE_STATUSES = [
  "draft",
  "submitted",
  "pending",
  "approved",
  "rejected",
  "returned",
  "cancelled",
  "payroll_ready",
  "paid",
] as const satisfies readonly HrOvertimeRequestStatus[];

/** Pending approval queue — submitted or legacy pending. */
export const HRM_OTM_PENDING_APPROVAL_STATUSES = [
  "submitted",
  "pending",
] as const satisfies readonly HrOvertimeRequestStatus[];

export type HrOvertimeReportGroupBy =
  | "employee"
  | "department"
  | "manager"
  | "cost_center"
  | "legal_entity"
  | "location"
  | "overtime_type"
  | "status"
  | "period";

export type HrOvertimeEligibilityRuleRow = {
  id: string;
  policyGroupCode: string;
  overtimeType: HrOvertimeType | null;
  legalEntityCode: string | null;
  countryCode: string | null;
  workLocationCode: string | null;
  departmentId: string | null;
  roleCode: string | null;
  grade: string | null;
  employmentType: string | null;
  employeeCategory: string | null;
  eligible: boolean;
  requiresExceptionApproval: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrOvertimeEligibilityResult = {
  eligible: boolean;
  requiresExceptionApproval: boolean;
  matchedRuleId: string | null;
  reason: string;
};

export function otmRuleSpecificityScore(rule: HrOvertimeEligibilityRuleRow): number {
  let score = 0;
  if (rule.legalEntityCode) score += 256;
  if (rule.countryCode) score += 128;
  if (rule.workLocationCode) score += 64;
  if (rule.departmentId) score += 32;
  if (rule.roleCode) score += 16;
  if (rule.grade) score += 8;
  if (rule.employmentType) score += 4;
  if (rule.employeeCategory) score += 2;
  if (rule.overtimeType) score += 1;
  return score;
}

export function otmMatchesEligibilityRule(
  rule: HrOvertimeEligibilityRuleRow,
  context: {
    overtimeType: HrOvertimeType;
    legalEntityCode: string | null;
    countryCode: string | null;
    workLocationCode: string | null;
    departmentId: string | null;
    roleCode: string | null;
    grade: string | null;
    employmentType: string | null;
    employeeCategory: string | null;
    asOf: Date;
  },
): boolean {
  if (rule.effectiveFrom.getTime() > context.asOf.getTime()) {
    return false;
  }
  if (rule.effectiveTo && rule.effectiveTo.getTime() < context.asOf.getTime()) {
    return false;
  }
  if (rule.overtimeType && rule.overtimeType !== context.overtimeType) {
    return false;
  }
  if (
    rule.legalEntityCode &&
    rule.legalEntityCode !== context.legalEntityCode
  ) {
    return false;
  }
  if (rule.countryCode && rule.countryCode !== context.countryCode) {
    return false;
  }
  if (
    rule.workLocationCode &&
    rule.workLocationCode !== context.workLocationCode
  ) {
    return false;
  }
  if (rule.departmentId && rule.departmentId !== context.departmentId) {
    return false;
  }
  if (rule.roleCode && rule.roleCode !== context.roleCode) {
    return false;
  }
  if (rule.grade && rule.grade !== context.grade) {
    return false;
  }
  if (rule.employmentType && rule.employmentType !== context.employmentType) {
    return false;
  }
  if (
    rule.employeeCategory &&
    rule.employeeCategory !== context.employeeCategory
  ) {
    return false;
  }
  return true;
}

/** HRM-OTM-005 — block ineligible submit unless authorized override reason is supplied. */
export function resolveOtmEligibilityForSubmit(input: {
  result: HrOvertimeEligibilityResult;
  eligibilityExceptionReason?: string | null;
}): HrOvertimeEligibilityResult {
  if (input.result.eligible) {
    return input.result;
  }
  if (
    input.result.requiresExceptionApproval &&
    input.eligibilityExceptionReason?.trim()
  ) {
    return {
      ...input.result,
      eligible: true,
      reason: "Authorized eligibility override",
    };
  }
  return input.result;
}

export function resolveOtmEligibilityFromRules(input: {
  rules: readonly HrOvertimeEligibilityRuleRow[];
  context: Parameters<typeof otmMatchesEligibilityRule>[1];
}): HrOvertimeEligibilityResult {
  const matching = input.rules
    .filter((rule) => otmMatchesEligibilityRule(rule, input.context))
    .sort((a, b) => otmRuleSpecificityScore(b) - otmRuleSpecificityScore(a));

  const best = matching[0];
  if (!best) {
    return {
      eligible: false,
      requiresExceptionApproval: true,
      matchedRuleId: null,
      reason: "No matching eligibility rule",
    };
  }

  if (!best.eligible) {
    return {
      eligible: false,
      requiresExceptionApproval: best.requiresExceptionApproval,
      matchedRuleId: best.id,
      reason: "Employee matched an ineligible rule",
    };
  }

  return {
    eligible: true,
    requiresExceptionApproval: best.requiresExceptionApproval,
    matchedRuleId: best.id,
    reason: "Employee matched eligible rule",
  };
}

/** Parse HH:mm and compute duration minutes; returns null when invalid. */
export function computeOtmDurationMinutesFromTimeRange(input: {
  startTime: string;
  endTime: string;
}): number | null {
  const parse = (value: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }
    return hours * 60 + minutes;
  };

  const start = parse(input.startTime);
  const end = parse(input.endTime);
  if (start === null || end === null) {
    return null;
  }
  if (end <= start) {
    return end + 24 * 60 - start;
  }
  return end - start;
}

export function formatOtmDurationMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainder}m`;
}

export function formatOtmStatusLabel(status: HrOvertimeRequestStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
    case "pending":
      return "Pending approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "returned":
      return "Returned";
    case "cancelled":
      return "Cancelled";
    case "payroll_ready":
      return "Payroll ready";
    case "paid":
      return "Paid";
    default:
      return status;
  }
}

export function canTransitionOtmStatus(
  from: HrOvertimeRequestStatus,
  to: HrOvertimeRequestStatus,
): boolean {
  const transitions: Record<HrOvertimeRequestStatus, readonly HrOvertimeRequestStatus[]> = {
    draft: ["submitted", "cancelled"],
    submitted: ["approved", "rejected", "returned", "cancelled"],
    pending: ["approved", "rejected", "returned", "cancelled"],
    returned: ["submitted", "cancelled"],
    approved: ["payroll_ready"],
    rejected: [],
    cancelled: [],
    payroll_ready: ["paid"],
    paid: [],
  };
  return transitions[from]?.includes(to) ?? false;
}
