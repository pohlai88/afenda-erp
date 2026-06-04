import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface } from "../overview/sys-control-list.shared";
import type { SystemAdminBillingPaymentRow } from "./sys-billing-list.contract";
import { systemAdminBillingUiCopy } from "./sys-billing-ui.copy.shared";

export const systemAdminBillingPaymentsSurfaceKey =
  "system-admin.billing.payments";

export function buildBillingPaymentsListSurface(input: {
  payments: readonly SystemAdminBillingPaymentRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminBillingPaymentsSurfaceKey,
    title: systemAdminBillingUiCopy.payments.title,
    object: "billing-payments",
    columns: [
      { id: "method", header: "Method", priority: "primary", pin: "start" },
      { id: "status", header: "Status" },
      { id: "lastActivity", header: "Last activity" },
    ],
    rows: input.payments.map((row) => ({
      id: row.id,
      cells: {
        method: row.method,
        status: row.status,
        lastActivity: row.lastActivity,
      },
    })),
    emptyTitle: systemAdminBillingUiCopy.payments.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.payments.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.payments.searchPlaceholder,
  });
}
