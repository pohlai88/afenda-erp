import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  hrTimeLamAttendanceReadPermission,
  hrTimeLamReadPermission,
} from "../contracts/hr.time.lam.contract";

export type LamErpReadPermission =
  | typeof hrTimeLamAttendanceReadPermission
  | typeof hrTimeLamReadPermission;

export type LamListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type LamListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type LamListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildLamListSearchToolbar(input: {
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

export function buildLamOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildLamListSearchToolbar>;
  window: LamListWindow;
  requiresErpPermission?: LamErpReadPermission;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: LamListColumn[];
  rows: LamListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission:
      input.requiresErpPermission ?? hrTimeLamAttendanceReadPermission,
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

export function formatLamEmployeeListCell(input: {
  employeeNumber: string;
  employeeDisplayName: string;
}) {
  return `${input.employeeDisplayName} (${input.employeeNumber})`;
}

export function formatLamEnumCell(value: string) {
  return value.replace(/_/g, " ");
}
