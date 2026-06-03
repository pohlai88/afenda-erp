import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import { hrTimeAatReadPermission } from "./hr.time.aat.contract";

export type AatListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type AatListColumn =
  ListSurfaceRendererConfigurationResolvedInput["columns"][number];
type AatListRow = ListSurfaceRendererConfigurationResolvedInput["rows"][number];

export function buildAatListSearchToolbar(input: {
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

export function buildAatOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildAatListSearchToolbar>;
  window: AatListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: AatListColumn[];
  rows: AatListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeAatReadPermission,
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

export function formatAatRiskLevelLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
