import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrTalentCareerPathReadPermission } from "../contracts/hr.talent.career-pathing.contract";

export type CareerPathingListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type CareerPathingListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type CareerPathingListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildCareerPathingListSearchToolbar(input: {
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

export function formatCareerPathingEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildCareerPathingOperationalListSurface(input: {
  surfaceKey?: string;
  primaryColumnId: string;
  searchToolbar?: ReturnType<typeof buildCareerPathingListSearchToolbar>;
  window: CareerPathingListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: CareerPathingListColumn[];
  rows: CareerPathingListRow[];
}) {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTalentCareerPathReadPermission,
    ...(input.surfaceKey ? { surfaceKey: input.surfaceKey } : {}),
    presentation: {
      primaryColumnId: input.primaryColumnId,
      ...(input.searchToolbar ? { toolbar: input.searchToolbar } : {}),
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

/** @deprecated Use `buildCareerPathingOperationalListSurface`. */
export const buildCareerPathOperationalListSurface =
  buildCareerPathingOperationalListSurface;
export const buildCareerPathListSearchToolbar = buildCareerPathingListSearchToolbar;
export const formatCareerPathEnumLabel = formatCareerPathingEnumLabel;

export function buildCareerPathingEmbeddedListSurfaceErrorConfiguration(input: {
  title?: string;
  description?: string;
}) {
  return {
    variant: "muted" as const,
    title: input.title ?? "Could not load this section",
    description:
      input.description ??
      "Career pathing data is temporarily unavailable. Retry or contact your administrator.",
  };
}

export function filterCareerPathingRows<T extends Record<string, string>>(
  rows: readonly T[],
  searchValue: string | undefined,
  keys: readonly (keyof T)[],
): T[] {
  const trimmed = searchValue?.trim().toLowerCase();
  if (!trimmed) {
    return [...rows];
  }
  return rows.filter((row) =>
    keys.some((key) => String(row[key] ?? "").toLowerCase().includes(trimmed)),
  );
}

export function careerPathingWindowFor<T>(rows: readonly T[]): CareerPathingListWindow {
  return {
    pageSize: rows.length || 25,
    totalCount: rows.length,
    hasNextPage: false,
  };
}
