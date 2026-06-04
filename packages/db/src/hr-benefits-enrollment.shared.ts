import type { hrBenefitEnrollments } from "./dbx-hr-benefits";

export const HR_BENEFIT_COVERAGE_LEVELS = [
  "employee_only",
  "employee_spouse",
  "employee_children",
  "family",
] as const;

export type HrBenefitCoverageLevel = (typeof HR_BENEFIT_COVERAGE_LEVELS)[number];

export const HR_BENEFIT_DEPENDENT_RELATIONSHIPS = [
  "spouse",
  "child",
  "domestic_partner",
  "other",
] as const;

export type HrBenefitDependentRelationship =
  (typeof HR_BENEFIT_DEPENDENT_RELATIONSHIPS)[number];

export type HrBenefitEnrollmentDependentInput = {
  dependentName: string;
  relationship: HrBenefitDependentRelationship;
  dateOfBirth?: Date | null;
  dependentReferenceId?: string | null;
  coverageStartDate: Date;
  coverageEndDate?: Date | null;
};

const SPOUSE_RELATIONSHIPS = new Set<HrBenefitDependentRelationship>([
  "spouse",
  "domestic_partner",
]);

const CHILD_RELATIONSHIPS = new Set<HrBenefitDependentRelationship>(["child"]);

/** HRM-BEN-011 — coverage tier must match plan dependent support. */
export function assertCoverageLevelAllowedForPlan(input: {
  allowsDependents: boolean;
  coverageLevel: HrBenefitCoverageLevel;
}): void {
  if (input.allowsDependents) {
    return;
  }
  if (input.coverageLevel !== "employee_only") {
    throw new Error("coverage_level_not_allowed");
  }
}

/** HRM-BEN-012 — coverage window must be chronologically valid. */
export function assertBenefitCoverageDatesValid(input: {
  coverageStartDate: Date;
  coverageEndDate?: Date | null;
}): void {
  if (
    input.coverageEndDate &&
    input.coverageEndDate.getTime() < input.coverageStartDate.getTime()
  ) {
    throw new Error("coverage_dates_invalid");
  }
}

function assertRelationshipAllowedForCoverageLevel(
  coverageLevel: HrBenefitCoverageLevel,
  relationship: HrBenefitDependentRelationship,
): void {
  if (coverageLevel === "employee_spouse" && !SPOUSE_RELATIONSHIPS.has(relationship)) {
    throw new Error("dependent_relationship_not_allowed");
  }
  if (coverageLevel === "employee_children" && !CHILD_RELATIONSHIPS.has(relationship)) {
    throw new Error("dependent_relationship_not_allowed");
  }
  if (
    coverageLevel === "family" &&
    !SPOUSE_RELATIONSHIPS.has(relationship) &&
    !CHILD_RELATIONSHIPS.has(relationship)
  ) {
    throw new Error("dependent_relationship_not_allowed");
  }
}

/** HRM-BEN-009 / HRM-BEN-010 / HRM-BEN-011 — dependents must match selected coverage tier. */
export function validateEnrollmentDependents(input: {
  coverageLevel: HrBenefitCoverageLevel;
  dependents: readonly HrBenefitEnrollmentDependentInput[];
}): void {
  if (input.coverageLevel === "employee_only" && input.dependents.length > 0) {
    throw new Error("dependents_not_allowed");
  }

  for (const dependent of input.dependents) {
    const name = dependent.dependentName.trim();
    if (!name) {
      throw new Error("dependent_name_required");
    }

    assertRelationshipAllowedForCoverageLevel(
      input.coverageLevel,
      dependent.relationship,
    );

    if (CHILD_RELATIONSHIPS.has(dependent.relationship) && !dependent.dateOfBirth) {
      throw new Error("dependent_date_of_birth_required");
    }

    assertBenefitCoverageDatesValid({
      coverageStartDate: dependent.coverageStartDate,
      coverageEndDate: dependent.coverageEndDate,
    });
  }
}

export function isDependentEligibilityVerified(
  dependent: HrBenefitEnrollmentDependentInput,
): boolean {
  const name = dependent.dependentName.trim();
  if (!name) {
    return false;
  }

  if (CHILD_RELATIONSHIPS.has(dependent.relationship)) {
    return dependent.dateOfBirth instanceof Date;
  }

  return SPOUSE_RELATIONSHIPS.has(dependent.relationship);
}

/** HRM-BEN-013 / HRM-BEN-014 — store plan contribution amounts on enrollment. */
export function resolveEnrollmentContributionRows(input: {
  organizationId: string;
  enrollmentId: string;
  currencyCode: string;
  employerContributionAmount: string | null;
  employeeContributionAmount: string | null;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
}): Array<{
  organizationId: string;
  enrollmentId: string;
  payer: "employer" | "employee";
  amount: string;
  currencyCode: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}> {
  const rows: Array<{
    organizationId: string;
    enrollmentId: string;
    payer: "employer" | "employee";
    amount: string;
    currencyCode: string;
    effectiveFrom: Date;
    effectiveTo: Date | null;
  }> = [];

  if (input.employerContributionAmount?.trim()) {
    rows.push({
      organizationId: input.organizationId,
      enrollmentId: input.enrollmentId,
      payer: "employer",
      amount: input.employerContributionAmount.trim(),
      currencyCode: input.currencyCode,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    });
  }

  if (input.employeeContributionAmount?.trim()) {
    rows.push({
      organizationId: input.organizationId,
      enrollmentId: input.enrollmentId,
      payer: "employee",
      amount: input.employeeContributionAmount.trim(),
      currencyCode: input.currencyCode,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    });
  }

  return rows;
}

export type HrBenefitEnrollmentCoverageLevel =
  (typeof hrBenefitEnrollments.$inferSelect)["coverageLevel"];

