import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface } from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminBillingEntitlementRow } from "../contracts/system-admin.billing-list.contract";
import { systemAdminBillingUiCopy } from "./system-admin.billing-ui.copy.shared";

export const systemAdminBillingEntitlementsSurfaceKey =
  "system-admin.billing.entitlements";

export function buildBillingEntitlementsListSurface(input: {
  entitlements: readonly SystemAdminBillingEntitlementRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminBillingEntitlementsSurfaceKey,
    title: systemAdminBillingUiCopy.entitlements.title,
    object: "billing-entitlements",
    columns: [
      { id: "key", header: "Entitlement", priority: "primary", pin: "start" },
      { id: "status", header: "Status" },
      { id: "source", header: "Source" },
    ],
    rows: input.entitlements.map((row) => ({
      id: row.id,
      cells: {
        key: row.label,
        status: row.status,
        source: row.source,
      },
    })),
    emptyTitle: systemAdminBillingUiCopy.entitlements.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.entitlements.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.entitlements.searchPlaceholder,
  });
}
