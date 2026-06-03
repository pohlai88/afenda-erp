import { eq } from "drizzle-orm";

import { hrComplianceObligations } from "./hr";

export const HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND = "labor_law" as const;

export function buildEmployeeObligationTrackingKey(
  employeeId: string,
  obligationId: string,
): string {
  return `${employeeId}:${obligationId}`;
}

export const activeLaborLawObligationKindCondition = eq(
  hrComplianceObligations.requirementKind,
  HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND,
);
