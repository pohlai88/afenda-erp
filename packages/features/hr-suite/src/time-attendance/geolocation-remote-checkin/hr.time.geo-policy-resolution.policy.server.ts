import {
  evaluateHrGeoEmployeeEligibility,
  listHrGeoEligibilityRules,
  type HrGeoEligibilityRuleRow,
} from "@afenda/db";

export type { HrGeoEligibilityRuleRow };

export { resolveGeoEligibilityFromRules, ruleSpecificityScore, matchesGeoEligibilityRule } from "@afenda/db";

/** HRM-GEO-008/009 — scoped policy matching priority for remote check-in. */
export async function resolveHrGeoPolicyForEmployee(input: {
  organizationId: string;
  employeeId: string;
  policyGroupCode?: string;
  asOf?: Date;
}) {
  return evaluateHrGeoEmployeeEligibility(input);
}

export async function listHrGeoPolicyRules(input: {
  organizationId: string;
  policyGroupCode?: string;
}) {
  return listHrGeoEligibilityRules(input);
}
