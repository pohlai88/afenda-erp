import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrWorkforceRecordsReadPermission } from "./hr.workforce.records.contract";

export type RecordsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type RecordsListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type RecordsListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildRecordsListSearchToolbar(input: {
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

export function buildRecordsOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildRecordsListSearchToolbar>;
  window: RecordsListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: RecordsListColumn[];
  rows: RecordsListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceRecordsReadPermission,
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

export function formatRecordsEmploymentStatusLabel(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatRecordsMissingFieldsLabel(fields: readonly string[]): string {
  return fields
    .map((field) =>
      field
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    )
    .join(", ");
}

export function formatRecordsAssignmentStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatRecordsEventKindLabel(kind: string): string {
  return kind
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveRecordsListTrailingAction(canWrite: boolean) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: true,
  });
}
