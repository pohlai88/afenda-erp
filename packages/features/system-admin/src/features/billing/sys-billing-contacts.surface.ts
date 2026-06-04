import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface } from "../overview/sys-control-list.shared";
import type { SystemAdminBillingContactRow } from "./sys-billing-list.contract";
import { systemAdminBillingUiCopy } from "./sys-billing-ui.copy.shared";

export const systemAdminBillingContactsSurfaceKey =
  "system-admin.billing.contacts";

export function buildBillingContactsListSurface(input: {
  contacts: readonly SystemAdminBillingContactRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminBillingContactsSurfaceKey,
    title: systemAdminBillingUiCopy.contacts.title,
    object: "billing-contacts",
    columns: [
      { id: "role", header: "Role", priority: "primary", pin: "start" },
      { id: "name", header: "Name" },
      { id: "email", header: "Email" },
      { id: "source", header: "Source" },
    ],
    rows: input.contacts.map((row) => ({
      id: row.id,
      cells: {
        role: row.roleLabel,
        name: row.name,
        email: row.email,
        source: row.source === "configured" ? "Configured" : "Derived",
      },
    })),
    emptyTitle: systemAdminBillingUiCopy.contacts.emptyTitle,
    emptyDescription: systemAdminBillingUiCopy.contacts.emptyDescription,
    searchPlaceholder: systemAdminBillingUiCopy.contacts.searchPlaceholder,
  });
}
