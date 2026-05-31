import type {
  HrBonusApprovalRoutingConfig,
  HrBonusApprovalRoutingStep,
} from "./schema/hr-bonus-incentive";

export type HrBonusApprovalRouteContext = {
  planType: string;
  payoutAmount: number;
  legalEntityCode: string | null;
  departmentId: string | null;
  grade: string | null;
  managerEmployeeId: string | null;
  budgetImpact?: number | null;
};

const DEFAULT_BONUS_APPROVAL_STEPS: readonly HrBonusApprovalRoutingStep[] = [
  { role: "manager", order: 0 },
  { role: "hr", order: 1, minAmount: 0 },
  { role: "finance", order: 2, minAmount: 5000 },
];

function matchesRoutingStep(
  step: HrBonusApprovalRoutingStep,
  context: HrBonusApprovalRouteContext,
): boolean {
  const amount = context.payoutAmount;
  if (step.minAmount != null && amount < step.minAmount) return false;
  if (step.maxAmount != null && amount > step.maxAmount) return false;
  if (
    step.planTypes?.length &&
    !step.planTypes.includes(context.planType)
  ) {
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
    step.departmentIds?.length &&
    context.departmentId &&
    !step.departmentIds.includes(context.departmentId)
  ) {
    return false;
  }
  if (step.grades?.length && context.grade && !step.grades.includes(context.grade)) {
    return false;
  }
  if (
    step.budgetImpactMin != null &&
    (context.budgetImpact ?? amount) < step.budgetImpactMin
  ) {
    return false;
  }
  if (step.role === "manager" && !context.managerEmployeeId) {
    return false;
  }
  return true;
}

/** BON-022 — resolve applicable approval steps for a payout. */
export function resolveHrBonusApprovalSteps(input: {
  routingConfig: HrBonusApprovalRoutingConfig | null | undefined;
  context: HrBonusApprovalRouteContext;
}): readonly HrBonusApprovalRoutingStep[] {
  const configured = input.routingConfig?.steps?.length
    ? input.routingConfig.steps
    : DEFAULT_BONUS_APPROVAL_STEPS;

  return [...configured]
    .sort((a, b) => a.order - b.order)
    .filter((step) => matchesRoutingStep(step, input.context));
}
