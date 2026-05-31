import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrTalentCsfReadPermission } from "../contracts/hr.talent.csf.contract";

export type CsfListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type CsfListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type CsfListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildCsfListSearchToolbar(input: {
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

export function formatCsfEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildCsfOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildCsfListSearchToolbar>;
  window: CsfListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: readonly CsfListColumn[];
  rows: readonly CsfListRow[];
}) {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTalentCsfReadPermission,
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
