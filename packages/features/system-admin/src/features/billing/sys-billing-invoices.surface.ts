import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface } from "../overview/sys-control-list.shared";
import type { SystemAdminBillingInvoiceRow } from "./sys-billing-list.contract";
import { systemAdminBillingUiCopy } from "./sys-billing-ui.copy.shared";

export const systemAdminBillingInvoicesSurfaceKey =
  "system-admin.billing.invoices";

export function buildBillingInvoicesListSurface(input: {
  invoices: readonly SystemAdminBillingInvoiceRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminBillingInvoicesSurfaceKey,
    title: systemAdminBillingUiCopy.invoices.title,
    object: "billing-invoices",
    columns: [
      { id: "reference", header: "Reference", priority: "primary", pin: "start" },
      { id: "period", header: "Period" },
      { id: "amount", header: "Amount" },
      { id: "status", header: "Status" },
    ],
    rows: input.invoices.map((row) => ({
      id: row.id,
      cells: {
        reference: row.reference,
        period: row.period,
        amount: row.amount,
        status: row.status,
      },
    })),
    emptyTitle: systemAdminBillingUiCopy.invoices.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.invoices.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.invoices.searchPlaceholder,
  });
}
