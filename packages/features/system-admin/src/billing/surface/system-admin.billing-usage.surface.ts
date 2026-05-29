import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface } from "../../overview/surfaces/system-admin.control-list.shared";
import type { BillingPostureSnapshot } from "../contracts/system-admin.billing-posture.contract";
import { systemAdminBillingUiCopy } from "./system-admin.billing-ui.copy.shared";

export const systemAdminBillingUsageSurfaceKey = "system-admin.billing.usage";

export function buildBillingUsageListSurface(
  input: BillingPostureSnapshot,
): ListSurfaceRendererConfigurationResolvedInput {
  const gatewayValue = input.gatewaySpendAuthenticationFailed
    ? "Gateway API key rejected — refresh AI_GATEWAY_API_KEY"
    : input.gatewaySpendAvailable
      ? `$${input.gatewayCostUsd.toFixed(4)} (${input.gatewaySpendEntryCount} tag groups, MTD)`
      : "Unavailable — configure AI Gateway API key";

  return buildLinkedControlListSurface({
    key: systemAdminBillingUsageSurfaceKey,
    title: systemAdminBillingUiCopy.usage.title,
    object: "billing-usage",
    columns: [
      { id: "line", header: "Signal", priority: "primary", pin: "start" },
      { id: "value", header: "Value" },
    ],
    rows: [
      {
        id: "machine-usage",
        cells: {
          line: "Machine usage events",
          value: String(input.aiUsageEventCount),
        },
      },
      {
        id: "lynx-runs",
        cells: {
          line: "Lynx runs",
          value: String(input.lynxRunCount),
        },
      },
      {
        id: "gateway-spend",
        cells: {
          line: "AI Gateway spend (MTD)",
          value: gatewayValue,
        },
      },
      {
        id: "seats",
        cells: {
          line: "Active seats observed",
          value: String(input.subscription.seatsUsed),
        },
      },
    ],
    emptyTitle: systemAdminBillingUiCopy.usage.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.usage.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.usage.searchPlaceholder,
  });
}

/** @deprecated Use {@link buildBillingUsageListSurface}. */
export function buildBillingPostureListSurface(
  input: Parameters<typeof buildBillingUsageListSurface>[0],
) {
  return buildBillingUsageListSurface(input);
}
