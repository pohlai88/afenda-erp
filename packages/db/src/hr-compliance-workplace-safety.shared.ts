import { eq } from "drizzle-orm";

import { hrComplianceObligations } from "./schema/hr";

/** HRM-CMP-006 obligation requirement kind for workplace safety tracking. */
export const HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND = "safety" as const;

export const activeWorkplaceSafetyObligationKindCondition = eq(
  hrComplianceObligations.requirementKind,
  HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND,
);
