/** HRM-CMP-001 obligation kinds for register configuration. */
export const HRM_COMPLIANCE_OBLIGATION_KINDS = [
  "policy_acknowledgement",
  "filing",
  "work_authorization",
  "document",
  "training",
  "labor_law",
  "safety",
  "statutory",
  "other",
] as const;

export type HrmComplianceObligationKind =
  (typeof HRM_COMPLIANCE_OBLIGATION_KINDS)[number];

export const HRM_COMPLIANCE_OBLIGATION_STATUSES = [
  "active",
  "archived",
] as const;

export type HrmComplianceObligationStatus =
  (typeof HRM_COMPLIANCE_OBLIGATION_STATUSES)[number];

export {
  appliesComplianceObligationToEmployee,
  type HrComplianceObligationScope as ComplianceObligationScope,
  type HrEmployeeComplianceScope as EmployeeComplianceScope,
} from "@afenda/db";

export function formatComplianceObligationScope(input: {
  readonly countryCode?: string | null;
  readonly legalEntityCode?: string | null;
  readonly workLocationCode?: string | null;
  readonly employmentType?: string | null;
  readonly workerCategory?: string | null;
  readonly departmentName?: string | null;
}): string {
  const parts = [
    input.countryCode?.trim(),
    input.legalEntityCode?.trim(),
    input.workLocationCode?.trim(),
    input.employmentType?.trim(),
    input.workerCategory?.trim(),
    input.departmentName?.trim(),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "All employees";
}
