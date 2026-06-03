import { eq } from "drizzle-orm";

import { hrComplianceObligations } from "./hr";

export const HR_COMPLIANCE_STATUTORY_REQUIREMENT_KIND = "statutory" as const;

export const activeStatutoryObligationKindCondition = eq(
  hrComplianceObligations.requirementKind,
  HR_COMPLIANCE_STATUTORY_REQUIREMENT_KIND,
);
