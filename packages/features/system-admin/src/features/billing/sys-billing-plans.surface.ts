import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface } from "../overview/sys-control-list.shared";
import type { SystemAdminBillingPlanRow } from "./sys-billing-plans.contract";
import { systemAdminBillingUiCopy } from "./sys-billing-ui.copy.shared";

export const systemAdminBillingPlansSurfaceKey = "system-admin.billing.plans";

export function buildBillingPlansListSurface(input: {
  plans: readonly SystemAdminBillingPlanRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminBillingPlansSurfaceKey,
    title: systemAdminBillingUiCopy.plans.title,
    object: "billing-plans",
    columns: [
      { id: "name", header: "Plan", priority: "primary", pin: "start" },
      { id: "price", header: "Price" },
      { id: "description", header: "Description" },
    ],
    rows: input.plans.map((plan) => ({
      id: plan.id,
      cells: {
        name: plan.name,
        price: plan.priceLabel,
        description: plan.description,
      },
    })),
    emptyTitle: systemAdminBillingUiCopy.plans.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.plans.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.plans.searchPlaceholder,
  });
}
