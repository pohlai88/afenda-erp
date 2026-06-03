import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import {
  buildLinkedControlListSurface,
  moduleReadinessVerdictBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";
import {
  formatBillingReadinessVerdictLabel,
  type BillingReadinessReport,
} from "../contracts/system-admin.billing-readiness.contract";
import type { OrganizationSubscription } from "../contracts/system-admin.billing-subscription.contract";
import { systemAdminBillingUiCopy } from "./system-admin.billing-ui.copy.shared";

export const systemAdminBillingGovernanceSurfaceKey =
  "system-admin.billing.governance";

/** @deprecated Use {@link systemAdminBillingGovernanceSurfaceKey}. */
export const systemAdminBillingSurfaceKey = systemAdminBillingGovernanceSurfaceKey;

export function buildBillingGovernanceListSurface(input: {
  readiness: BillingReadinessReport;
  subscription: OrganizationSubscription;
  seatCount: number;
  gatewaySpendAvailable: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const issueSummary =
    input.readiness.issues.length > 0
      ? input.readiness.issues.map((entry) => entry.title).join("; ")
      : "No outstanding issues";

  return buildLinkedControlListSurface({
    key: systemAdminBillingGovernanceSurfaceKey,
    title: systemAdminBillingUiCopy.governance.title,
    object: "billing-governance",
    columns: [
      { id: "area", header: "Area", priority: "primary", pin: "start" },
      { id: "signal", header: "Signal" },
      { id: "value", header: "Value", cellKind: { kind: "badge" } },
    ],
    rows: [
      {
        id: "readiness",
        cells: {
          area: "Readiness",
          signal: "Verdict",
          value: formatBillingReadinessVerdictLabel(input.readiness.verdict),
        },
        cellKinds: {
          value: moduleReadinessVerdictBadge(input.readiness.verdict),
        },
      },
      {
        id: "risks",
        cells: {
          area: "Readiness",
          signal: "Outstanding risks",
          value: issueSummary,
        },
      },
      {
        id: "plan",
        cells: {
          area: "Subscription",
          signal: "Plan",
          value: input.subscription.planKey,
        },
      },
      {
        id: "seats",
        cells: {
          area: "Subscription",
          signal: "Seats used",
          value: `${input.seatCount}/${input.subscription.seatsPurchased}`,
        },
      },
      {
        id: "gateway",
        cells: {
          area: "Usage signals",
          signal: "AI Gateway spend",
          value: input.gatewaySpendAvailable ? "Available" : "Unavailable",
        },
        cellKinds: {
          value: moduleReadinessVerdictBadge(
            input.gatewaySpendAvailable ? "ready" : "warning",
          ),
        },
      },
    ],
    emptyTitle: systemAdminBillingUiCopy.governance.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.governance.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.governance.searchPlaceholder,
  });
}
