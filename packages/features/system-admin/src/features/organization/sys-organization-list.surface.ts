import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { TenantSettingsSnapshot } from "@afenda/db";
import { buildControlListSurface } from "../overview/sys-control-list.shared";
import { systemAdminOrganizationUiCopy } from "./sys-organization-ui.copy.shared";

export const systemAdminOrganizationSurfaceKey =
  "system-admin.organization.list";

export function buildOrganizationDefaultsListSurface(input: {
  settings: TenantSettingsSnapshot | null;
  organizationName: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const settings = input.settings;

  return buildControlListSurface({
    key: systemAdminOrganizationSurfaceKey,
    title: systemAdminOrganizationUiCopy.list.title,
    object: "organization",
    columns: [
      { id: "setting", header: "Setting", priority: "primary", pin: "start" },
      { id: "value", header: "Value" },
    ],
    rows: [
      { id: "name", setting: "Organization", value: input.organizationName },
      { id: "timezone", setting: "Timezone", value: settings?.timezone ?? "UTC" },
      { id: "locale", setting: "Locale", value: settings?.locale ?? "en-US" },
      { id: "currency", setting: "Currency", value: settings?.currency ?? "USD" },
      {
        id: "fiscal",
        setting: "Fiscal year start month",
        value: String(settings?.fiscalYearStartMonth ?? 1),
      },
      {
        id: "document-prefix",
        setting: "Document prefix",
        value: String(settings?.documentPrefixes.default ?? "AFD"),
      },
      {
        id: "numbering-prefix",
        setting: "Numbering prefix",
        value: String(settings?.numbering.defaultPrefix ?? "AFD"),
      },
      {
        id: "region",
        setting: "Data region",
        value: settings?.dataRegion ?? "us-east-1",
      },
      {
        id: "zdr",
        setting: "Zero data retention",
        value: settings?.zdrEnabled ? "Enabled" : "Disabled",
      },
    ],
    emptyTitle: systemAdminOrganizationUiCopy.list.emptyTitle,
    emptyDescription: systemAdminOrganizationUiCopy.list.emptyDescription,
    searchPlaceholder: systemAdminOrganizationUiCopy.list.searchPlaceholder,
  });
}
