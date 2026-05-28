import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { TenantSettingsSnapshot } from "@afenda/db";

export const systemAdminSettingsSurfaceKey = "system-admin.settings.list";

function pagination(total: number) {
  return {
    pageSize: Math.max(1, total),
    totalCount: total,
    hasNextPage: false,

  };
}

export function buildTenantSettingsListSurface(input: {
  settings: TenantSettingsSnapshot | null;
  organizationName: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const settings = input.settings;
  const rows = [
    { id: "org", setting: "Organization", value: input.organizationName },
    {
      id: "timezone",
      setting: "Timezone",
      value: settings?.timezone ?? "UTC",
    },
    {
      id: "locale",
      setting: "Locale",
      value: settings?.locale ?? "en-US",
    },
    {
      id: "currency",
      setting: "Currency",
      value: settings?.currency ?? "USD",
    },
    {
      id: "fiscal",
      setting: "Fiscal year start month",
      value: String(settings?.fiscalYearStartMonth ?? 1),
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
  ];

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "settingsQ",
          label: "Search",
          placeholder: "Search tenant settings",
        },
        sort: {
          label: "Sort",
          param: "settingsSort",
          options: [
            {
              label: "Setting A-Z",
              value: "setting-asc",
              columnId: "setting",
              direction: "asc",
            },
            {
              label: "Setting Z-A",
              value: "setting-desc",
              columnId: "setting",
              direction: "desc",
            },
          ],
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["settingsQ", "settingsSort"],
      },
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "settings",
      function: "read",
    },
    pagination: pagination(rows.length),
    surface: {
      header: { title: "Tenant settings" },
      columnsId: "system-admin-settings",
      rowKey: "id",
      empty: { variant: "muted", title: "Tenant settings are not initialized." },
    },
    columns: [
      {
        id: "setting",
        header: "Setting",
        priority: "primary" as const,
        pin: "start" as const,
      },
      { id: "value", header: "Value" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: { setting: row.setting, value: row.value },
    })),
  });
}
