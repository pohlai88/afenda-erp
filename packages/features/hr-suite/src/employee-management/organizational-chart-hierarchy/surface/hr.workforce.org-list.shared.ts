import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrWorkforceOrgReadPermission } from "../contracts/hr.workforce.org.contract";

export type OrgListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type OrgListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type OrgListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildOrgListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return {
    search: {
      param: input.param,
      label: input.label,
      placeholder: input.placeholder,
      value: input.value,
    },
  };
}

export function buildOrgOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildOrgListSearchToolbar>;
  window: OrgListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: OrgListColumn[];
  rows: OrgListRow[];
}) {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceOrgReadPermission,
    presentation: {
      primaryColumnId: input.primaryColumnId,
      toolbar: input.searchToolbar,
    },
    pagination: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: { title: input.surface.headerTitle },
      columnsId: input.surface.columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: input.surface.emptyTitle,
        description: input.surface.emptyDescription,
      },
    },
    columns: input.columns,
    rows: input.rows,
  });
}

export function formatOrgEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatOrgDate(value: Date | null | undefined) {
  return value ? value.toISOString() : "";
}
