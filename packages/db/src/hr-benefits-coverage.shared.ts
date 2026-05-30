import { HrBenefitsCommandError } from "./hr-benefits.shared";
import type { hrBenefitEnrollments } from "./schema/hr-benefits";

export const HR_BENEFIT_COVERAGE_STATUSES = [
  "pending",
  "active",
  "waived",
  "suspended",
  "terminated",
  "expired",
] as const;

export type HrBenefitCoverageStatus =
  (typeof HR_BENEFIT_COVERAGE_STATUSES)[number];

export type HrBenefitCoverageStatusValue =
  (typeof hrBenefitEnrollments.$inferSelect)["coverageStatus"];

const TERMINAL_COVERAGE_STATUSES = new Set<HrBenefitCoverageStatus>([
  "terminated",
  "expired",
]);

const ALLOWED_COVERAGE_TRANSITIONS: Record<
  HrBenefitCoverageStatus,
  readonly HrBenefitCoverageStatus[]
> = {
  pending: ["active", "waived", "terminated", "suspended"],
  active: ["suspended", "terminated", "expired", "waived"],
  waived: ["active", "terminated"],
  suspended: ["active", "terminated"],
  terminated: [],
  expired: [],
};

export function assertHrBenefitCoverageStatusTransition(
  fromStatus: HrBenefitCoverageStatus,
  toStatus: HrBenefitCoverageStatus,
) {
  if (fromStatus === toStatus) {
    return;
  }
  if (TERMINAL_COVERAGE_STATUSES.has(fromStatus)) {
    throw new HrBenefitsCommandError(
      "invalid_coverage_transition",
      `Cannot transition benefit coverage from terminal status "${fromStatus}".`,
    );
  }
  const allowed = ALLOWED_COVERAGE_TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new HrBenefitsCommandError(
      "invalid_coverage_transition",
      `Benefit coverage transition from "${fromStatus}" to "${toStatus}" is not allowed.`,
    );
  }
}

const EMPLOYMENT_EXIT_STATUSES = new Set([
  "terminated",
  "separated",
  "retired",
  "archived",
]);

const EMPLOYMENT_SUSPEND_STATUSES = new Set([
  "suspended",
  "offboarding",
  "notice_period",
]);

/** HRM-BEN-023 — map employment status to coverage adjustment. */
export function resolveBenefitCoverageStatusForEmploymentChange(
  employmentStatus: string,
): HrBenefitCoverageStatus | null {
  if (EMPLOYMENT_EXIT_STATUSES.has(employmentStatus)) {
    return "terminated";
  }
  if (EMPLOYMENT_SUSPEND_STATUSES.has(employmentStatus)) {
    return "suspended";
  }
  return null;
}

export const ADJUSTABLE_COVERAGE_STATUSES_FOR_EMPLOYMENT = new Set<
  HrBenefitCoverageStatus
>(["pending", "active", "suspended"]);
