/** HRM-CMP-004 work eligibility posture statuses. */
export const HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES = [
  "not_applicable",
  "pending_verification",
  "eligible",
  "conditional",
  "ineligible",
  "expired",
] as const;

export type HrmComplianceWorkEligibilityStatus =
  (typeof HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES)[number];

const TERMINAL_WORK_ELIGIBILITY_STATUSES = new Set<HrmComplianceWorkEligibilityStatus>([
  "not_applicable",
  "ineligible",
  "expired",
]);

export { resolveWorkEligibilityVerifiedAt } from "@afenda/db";

export function deriveEffectiveWorkEligibilityStatus(input: {
  status: HrmComplianceWorkEligibilityStatus;
  expiresAt: Date | null | undefined;
  now?: Date;
}): HrmComplianceWorkEligibilityStatus {
  const now = input.now ?? new Date();
  const expiresAt = input.expiresAt ?? null;

  if (TERMINAL_WORK_ELIGIBILITY_STATUSES.has(input.status)) {
    return input.status;
  }

  if (expiresAt && expiresAt.getTime() < now.getTime()) {
    return "expired";
  }

  return input.status;
}
