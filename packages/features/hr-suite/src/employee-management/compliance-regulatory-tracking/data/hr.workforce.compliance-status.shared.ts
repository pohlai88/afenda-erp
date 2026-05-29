export const HRM_COMPLIANCE_AREAS = [
  "document",
  "work_authorization",
  "training",
  "acknowledgement",
  "filing",
  "safety",
  "labor_law",
  "statutory",
  "privacy",
  "integration",
  "other",
] as const;

export type HrmComplianceArea = (typeof HRM_COMPLIANCE_AREAS)[number];

export const HRM_COMPLIANCE_EXCEPTION_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type HrmComplianceExceptionSeverity =
  (typeof HRM_COMPLIANCE_EXCEPTION_SEVERITIES)[number];

/** HRM-CMP-015 requirement posture statuses (employee-level tracking). */
export const HRM_COMPLIANCE_REQUIREMENT_STATUSES = [
  "compliant",
  "pending",
  "at_risk",
  "overdue",
  "expired",
  "waived",
  "non_compliant",
] as const;

export type HrmComplianceRequirementStatus =
  (typeof HRM_COMPLIANCE_REQUIREMENT_STATUSES)[number];

/** Days before due date when a pending requirement is treated as at risk. */
export const HRM_COMPLIANCE_AT_RISK_WINDOW_DAYS = 14;

const REQUIREMENT_STATUS_PRIORITY: Record<HrmComplianceRequirementStatus, number> =
  {
    non_compliant: 7,
    expired: 6,
    overdue: 5,
    at_risk: 4,
    pending: 3,
    waived: 2,
    compliant: 1,
  };

const AT_RISK_WINDOW_MS = HRM_COMPLIANCE_AT_RISK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

const TERMINAL_REQUIREMENT_STATUSES = new Set<HrmComplianceRequirementStatus>([
  "compliant",
  "waived",
  "non_compliant",
  "expired",
]);

export function deriveEffectiveLaborLawRequirementStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate: Date | null | undefined;
  now?: Date;
}): HrmComplianceRequirementStatus {
  const now = input.now ?? new Date();
  const dueDate = input.dueDate ?? null;

  if (TERMINAL_REQUIREMENT_STATUSES.has(input.status)) {
    return input.status;
  }

  if (dueDate) {
    if (dueDate.getTime() < now.getTime()) {
      return "overdue";
    }
    if (dueDate.getTime() - now.getTime() <= AT_RISK_WINDOW_MS) {
      return "at_risk";
    }
  }

  return input.status;
}

export function worstComplianceRequirementStatus(
  statuses: readonly HrmComplianceRequirementStatus[],
): HrmComplianceRequirementStatus {
  if (statuses.length === 0) return "compliant";
  return statuses.reduce((worst, next) =>
    REQUIREMENT_STATUS_PRIORITY[next] > REQUIREMENT_STATUS_PRIORITY[worst]
      ? next
      : worst,
  );
}
