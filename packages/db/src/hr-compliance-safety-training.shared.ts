import { eq } from "drizzle-orm";

import { hrComplianceObligations } from "./schema/hr";

/** HRM-CMP-007 obligation requirement kind for mandatory training and certification tracking. */
export const HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND = "training" as const;

export const activeSafetyTrainingObligationKindCondition = eq(
  hrComplianceObligations.requirementKind,
  HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND,
);

export function isSafetyTrainingRequirementKind(kind: string): boolean {
  return kind === HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND;
}

export { buildEmployeeObligationTrackingKey } from "./hr-compliance-labor-law.shared";
