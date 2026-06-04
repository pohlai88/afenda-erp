import {
  formatStripePlanPrice,
  listStripeBillingPlans,
} from "@afenda/billing/server";
import type { SystemAdminBillingPlanRow } from "./sys-billing-plans.contract";

export function mapStripeBillingPlansToRows(): readonly SystemAdminBillingPlanRow[] {
  return listStripeBillingPlans().map((plan) => ({
    id: plan.key,
    key: plan.key,
    name: plan.name,
    description: plan.description,
    priceLabel: formatStripePlanPrice(plan),
    priceId: plan.priceId,
  }));
}
