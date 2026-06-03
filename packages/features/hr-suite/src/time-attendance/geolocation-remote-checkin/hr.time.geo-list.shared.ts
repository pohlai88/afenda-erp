import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
} from "@afenda/governed-surface";
import type { ActionDescriptor } from "@afenda/governed-surface/schemas";
import type {
  ListSurfaceRendererConfigurationInput,
  ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface/schemas";

import { hrTimeGeoReadPermission } from "./hrs-geolocation-contract";

export type GeoListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type GeoListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type GeoListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildGeoListSearchToolbar(input: {
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

const geoExceptionDecideDescriptor = {
  id: "geo-exception-decide",
  label: "Decide",
  intent: "approval",
} satisfies ActionDescriptor;

export function resolveGeoPendingExceptionTrailingAction(canWrite: boolean) {
  return canWrite
    ? resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: true,
        descriptor: geoExceptionDecideDescriptor,
      })
    : resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: false,
        disabledReason: "Geolocation update permission required.",
        descriptor: geoExceptionDecideDescriptor,
      });
}

export function resolveGeoIntegrationExposureRowTone(
  exposureStatus: string,
): GeoListRow["rowTone"] {
  if (
    exposureStatus === "not_exposed" ||
    exposureStatus === "raw_without_approved_day" ||
    exposureStatus === "approved_day_open"
  ) {
    return "attention";
  }
  if (exposureStatus === "pending_review") {
    return "attention";
  }
  return "default";
}

export function buildGeoOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildGeoListSearchToolbar>;
  window: GeoListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: GeoListColumn[];
  rows: GeoListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeGeoReadPermission,
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

export function formatGeoEmployeeCell(input: {
  employeeNumber: string | null;
  employeeDisplayName: string | null;
}) {
  if (!input.employeeDisplayName) return "Org-wide";
  return input.employeeNumber
    ? `${input.employeeDisplayName} (${input.employeeNumber})`
    : input.employeeDisplayName;
}

export function formatGeoEnumCell(value: string) {
  return value.replace(/_/g, " ");
}
