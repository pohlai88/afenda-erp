import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface } from "../overview/sys-control-list.shared";
import {
  formatOrganizationSubscriptionStatusLabel,
  type OrganizationSubscription,
} from "./sys-billing-subscription.contract";
import { systemAdminBillingUiCopy } from "./sys-billing-ui.copy.shared";

export const systemAdminBillingSubscriptionSurfaceKey =
  "system-admin.billing.subscription";

export function buildBillingSubscriptionListSurface(input: {
  subscription: OrganizationSubscription;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { subscription } = input;

  return buildLinkedControlListSurface({
    key: systemAdminBillingSubscriptionSurfaceKey,
    title: systemAdminBillingUiCopy.subscription.title,
    object: "billing-subscription",
    columns: [
      { id: "field", header: "Field", priority: "primary", pin: "start" },
      { id: "value", header: "Value" },
    ],
    rows: [
      {
        id: "plan",
        cells: { field: "Plan", value: subscription.planKey },
      },
      {
        id: "status",
        cells: {
          field: "Status",
          value: formatOrganizationSubscriptionStatusLabel(subscription.status),
        },
      },
      {
        id: "seats",
        cells: {
          field: "Seats",
          value: `${subscription.seatsUsed}/${subscription.seatsPurchased}`,
        },
      },
      {
        id: "provider",
        cells: {
          field: "Provider linkage",
          value: subscription.providerLinkage,
        },
      },
      {
        id: "started",
        cells: { field: "Started", value: subscription.startsAt },
      },
      ...(subscription.renewsAt
        ? [
            {
              id: "renews",
              cells: { field: "Renews", value: subscription.renewsAt },
            },
          ]
        : []),
    ],
    emptyTitle: systemAdminBillingUiCopy.subscription.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.subscription.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.subscription.searchPlaceholder,
  });
}
