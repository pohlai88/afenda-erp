import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
} from "@afenda/governed-surface";
import type {
  ListSurfaceRendererConfigurationInput,
  ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface/schemas";

import { hrTimeClockReadPermission } from "./hr.time.clock-integration.contract";

export type TimeClockListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type TimeClockListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type TimeClockListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildTimeClockListSearchToolbar(input: {
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

export function buildTimeClockOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildTimeClockListSearchToolbar>;
  window: TimeClockListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: readonly TimeClockListColumn[];
  rows: readonly TimeClockListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeClockReadPermission,
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

export function formatTimeClockEnumCell(value: string) {
  return value.replace(/_/g, " ");
}

export function formatTimeClockEmployeeCell(input: {
  employeeNumber: string | null;
  employeeDisplayName: string | null;
}) {
  if (!input.employeeDisplayName) return "Unmapped";
  return input.employeeNumber
    ? `${input.employeeDisplayName} (${input.employeeNumber})`
    : input.employeeDisplayName;
}

export function resolveTimeClockAdminTrailingAction(canAdmin: boolean) {
  return canAdmin
    ? resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: true,
        descriptor: {
          id: "time-clock-manage",
          label: "Manage",
          intent: "default",
        },
      })
    : resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: false,
        disabledReason: "Time clock admin permission required.",
        descriptor: {
          id: "time-clock-manage",
          label: "Manage",
          intent: "default",
        },
      });
}

export function resolveTimeClockSyncBatchRowTone(
  status: string,
): TimeClockListRow["rowTone"] {
  if (status === "failed") return "critical";
  if (status === "running" || status === "pending") return "attention";
  return "default";
}

export function resolveTimeClockValidationRowTone(
  validationStatus: string,
): TimeClockListRow["rowTone"] {
  if (validationStatus === "invalid" || validationStatus === "duplicate") {
    return "critical";
  }
  if (validationStatus === "pending" || validationStatus === "unmatched") {
    return "attention";
  }
  return "default";
}
