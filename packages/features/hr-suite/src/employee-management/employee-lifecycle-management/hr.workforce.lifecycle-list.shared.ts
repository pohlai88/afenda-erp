import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrWorkforceLifecycleReadPermission } from "./hr.workforce.lifecycle.contract";

export type LifecycleListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type LifecycleListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type LifecycleListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildLifecycleListSearchToolbar(input: {
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
      value: input.value ?? "",
    },
  } as const;
}

export function buildLifecycleOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildLifecycleListSearchToolbar>;
  window: LifecycleListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: LifecycleListColumn[];
  rows: LifecycleListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceLifecycleReadPermission,
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

export function formatLifecycleEmploymentStatusLabel(
  status: string,
): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
