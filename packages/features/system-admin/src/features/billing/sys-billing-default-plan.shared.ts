import { SYSTEM_ADMIN_BILLING_DEFAULT_PLAN_KEY } from "./sys-billing.limits.shared";
import type { SystemAdminBillingPlanRow } from "./sys-billing-plans.contract";

export function resolveSystemAdminBillingDefaultPlanKey(input: {
  plans: readonly SystemAdminBillingPlanRow[];
  currentPlanKey: string;
}) {
  const configuredDefault = process.env.STRIPE_DEFAULT_PLAN_KEY?.trim();
  if (configuredDefault) {
    return configuredDefault;
  }

  if (input.plans.some((plan) => plan.key === input.currentPlanKey)) {
    return input.currentPlanKey;
  }

  return input.plans[0]?.key ?? SYSTEM_ADMIN_BILLING_DEFAULT_PLAN_KEY;
}
