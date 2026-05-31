import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrPayrollSbsReadPermission } from "../contracts/hr.payroll.sbs.contract";

export type SbsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type SbsListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type SbsListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildSbsListSearchToolbar(input: {
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

export function formatSbsEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildSbsOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar?: ReturnType<typeof buildSbsListSearchToolbar>;
  window: SbsListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: readonly SbsListColumn[];
  rows: readonly SbsListRow[];
}) {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrPayrollSbsReadPermission,
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
    columns: [...input.columns],
    rows: [...input.rows],
  });
}
