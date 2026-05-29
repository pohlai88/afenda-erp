import { eq } from "drizzle-orm";

import { hrComplianceObligations } from "./schema/hr";

export const HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND =
  "policy_acknowledgement" as const;

export const activePolicyAcknowledgementObligationKindCondition = eq(
  hrComplianceObligations.requirementKind,
  HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND,
);
