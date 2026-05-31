import type { HrCompensationApprovalRules } from "./schema/hr-compensation-planning";

export type HrCompensationApprovalRoutingStep =
  HrCompensationApprovalRules["steps"][number];

export type HrCompensationApprovalRouteContext = {
  budgetImpact: number;
  proposedSalary: number;
  increasePercent: number;
  legalEntityCode: string | null;
  departmentId: string | null;
  grade: string | null;
  managerEmployeeId: string | null;
};

const DEFAULT_COMPENSATION_APPROVAL_STEPS: readonly HrCompensationApprovalRoutingStep[] =
  [
    { role: "manager", order: 0 },
    { role: "hr", order: 1, minAmount: 0 },
    { role: "finance", order: 2, minAmount: 5000 },
  ];

function matchesCompensationRoutingStep(
  step: HrCompensationApprovalRoutingStep,
  context: HrCompensationApprovalRouteContext,
): boolean {
  const amount = context.budgetImpact;

  if (step.minAmount != null && amount < step.minAmount) return false;
  if (step.maxAmount != null && amount > step.maxAmount) return false;

  if (step.minPercent != null && context.increasePercent < step.minPercent) {
    return false;
  }
  if (step.maxPercent != null && context.increasePercent > step.maxPercent) {
    return false;
  }

  if (step.budgetImpactMin != null && amount < step.budgetImpactMin) {
    return false;
  }
  if (step.budgetImpactMax != null && amount > step.budgetImpactMax) {
    return false;
  }

  if (
    step.legalEntityCodes?.length &&
    context.legalEntityCode &&
    !step.legalEntityCodes.includes(context.legalEntityCode)
  ) {
    return false;
  }
  if (
    step.legalEntityCode != null &&
    context.legalEntityCode !== step.legalEntityCode
  ) {
    return false;
  }

  if (
    step.departmentIds?.length &&
    context.departmentId &&
    !step.departmentIds.includes(context.departmentId)
  ) {
    return false;
  }
  if (step.departmentId != null && context.departmentId !== step.departmentId) {
    return false;
  }

  if (step.grades?.length && context.grade && !step.grades.includes(context.grade)) {
    return false;
  }
  if (step.grade != null && context.grade !== step.grade) {
    return false;
  }

  if (
    step.managerEmployeeIds?.length &&
    context.managerEmployeeId &&
    !step.managerEmployeeIds.includes(context.managerEmployeeId)
  ) {
    return false;
  }
  if (
    step.managerEmployeeId != null &&
    context.managerEmployeeId !== step.managerEmployeeId
  ) {
    return false;
  }

  if (step.role === "manager" && !context.managerEmployeeId) {
    return false;
  }

  return true;
}

/** CPM-023/024 — resolve applicable approval steps for a recommendation. */
export function resolveHrCompensationApprovalSteps(input: {
  approvalRules: HrCompensationApprovalRules | null | undefined;
  context: HrCompensationApprovalRouteContext;
}): readonly HrCompensationApprovalRoutingStep[] {
  const configured = input.approvalRules?.steps?.length
    ? input.approvalRules.steps
    : DEFAULT_COMPENSATION_APPROVAL_STEPS;

  return [...configured]
    .sort((a, b) => a.order - b.order)
    .filter((step) => matchesCompensationRoutingStep(step, input.context));
}
