import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrTimeFwaReadPermission } from "./hr.time.fwa.contract";

export type FwaListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type FwaListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type FwaListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildFwaListSearchToolbar(input: {
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

export function buildFwaOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildFwaListSearchToolbar>;
  window: FwaListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: FwaListColumn[];
  rows: FwaListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeFwaReadPermission,
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

export function formatFwaEmployeeListCell(input: {
  employeeNumber: string;
  employeeDisplayName: string;
}) {
  return `${input.employeeDisplayName} (${input.employeeNumber})`;
}

export function formatFwaEnumCell(value: string) {
  return value.replace(/_/g, " ");
}
