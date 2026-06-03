import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";

import {
  hrTimeSftCoverageSurfaceKey,
  hrTimeSftMySwapsSurfaceKey,
  hrTimeSftReadPermission,
  hrTimeSftScheduleChangePendingSurfaceKey,
  hrTimeSftSwapPendingSurfaceKey,
} from "./hr.time.sft.contract";

export {
  hrTimeSftCoverageSurfaceKey,
  hrTimeSftSwapPendingSurfaceKey,
  hrTimeSftMySwapsSurfaceKey,
  hrTimeSftScheduleChangePendingSurfaceKey,
};

export const hrTimeSftCoverageColumnsId = "hr.time.sft.coverage.columns";
export const hrTimeSftSwapPendingColumnsId = "hr.time.sft.swap-pending.columns";
export const hrTimeSftMySwapsColumnsId = "hr.time.sft.my-swaps.columns";
export const hrTimeSftScheduleChangePendingColumnsId =
  "hr.time.sft.schedule-change-pending.columns";

export const hrTimeSftCoverageSearchParam = "sftCoverageSearch";
export const hrTimeSftSwapPendingSearchParam = "sftSwapPendingSearch";
export const hrTimeSftMySwapsSearchParam = "sftMySwapsSearch";
export const hrTimeSftScheduleChangePendingSearchParam =
  "sftScheduleChangePendingSearch";

export type SftListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type SftListColumn =
  ListSurfaceRendererConfigurationResolvedInput["columns"][number];
type SftListRow = ListSurfaceRendererConfigurationResolvedInput["rows"][number];

export function buildSftListSearchToolbar(input: {
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

export function buildSftOperationalListSurface(input: {
  surfaceKey?: string;
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildSftListSearchToolbar>;
  window: SftListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: SftListColumn[];
  rows: SftListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeSftReadPermission,
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

export function formatSftEnumCell(value: string): string {
  return value.replace(/_/g, " ");
}

export const formatSftEnumLabel = formatSftEnumCell;

export function formatSftWorkingHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatSftMismatchReason(value: string | null): string {
  if (!value) {
    return "Aligned";
  }
  return formatSftEnumCell(value);
}

export function formatSftPayrollRefKind(value: string): string {
  return formatSftEnumCell(value);
}

export function formatSftEmployeeCell(input: {
  employeeNumber: string;
  employeeDisplayName: string;
}): string {
  return `${input.employeeDisplayName} (${input.employeeNumber})`;
}
