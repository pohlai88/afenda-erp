import { deriveWorkEligibilityEffectiveStatus } from "@afenda/db";

import { toEnumMember } from "./hr.workforce.compliance-enum-guard.shared";

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

export { resolveWorkEligibilityVerifiedAt } from "@afenda/db";

export function deriveEffectiveWorkEligibilityStatus(input: {
  status: HrmComplianceWorkEligibilityStatus;
  expiresAt: Date | null | undefined;
  now?: Date;
}): HrmComplianceWorkEligibilityStatus {
  return toEnumMember(
    deriveWorkEligibilityEffectiveStatus({
      status: input.status,
      expiresAt: input.expiresAt ?? null,
      now: input.now ?? new Date(),
    }),
    HRM_COMPLIANCE_WORK_ELIGIBILITY_STATUSES,
    "work eligibility status",
  );
}
