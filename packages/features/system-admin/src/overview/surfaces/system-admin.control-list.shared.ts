import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type {
  ListColumn,
  ListSurfaceRow,
  ListSurfaceToolbarFilter,
} from "@afenda/governed-surface/schemas";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "./system-admin.list-surface.shared";
type BasicRow = {
  id: string;
  [key: string]: string;
};

type LinkedControlRow = Pick<
  ListSurfaceRow,
  | "id"
  | "cells"
  | "rowHref"
  | "linkColumnId"
  | "cellKinds"
  | "trailingAction"
>;

export function buildControlListSurface(input: {
  key: string;
  title: string;
  object: string;
  columns: ReadonlyArray<{
    id: string;
    header: string;
    priority?: "primary";
    pin?: "start";
  }>;
  rows: readonly BasicRow[];
  emptyTitle: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  filters?: readonly ListSurfaceToolbarFilter[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    ...input,
    columns: [...input.columns],
    rows: input.rows.map((row) => {
      const { id, ...cells } = row;
      return { id, cells };
    }),
  });
}

export function buildLinkedControlListSurface(input: {
  key: string;
  title: string;
  object: string;
  columns: ReadonlyArray<ListColumn>;
  rows: readonly LinkedControlRow[];
  emptyTitle: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  filters?: readonly ListSurfaceToolbarFilter[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "table",
      presentationProfile: "erp-operational-table",
      presentation: {
        toolbar: buildSystemAdminListToolbar({
          scope: input.object,
          searchPlaceholder:
            input.searchPlaceholder ?? `Search ${input.object}`,
          sortColumn: input.columns[0]?.id ?? "id",
          searchValue: input.searchValue,
          filters: input.filters,
        }),
      },
      requiresErpPermission: {
        module: "system-admin",
        object: input.object,
        function: "read",
      },
      pagination: buildSystemAdminStaticPagination(input.rows.length),
      surface: {
        header: { title: input.title },
        columnsId: input.key,
        rowKey: "id",
        empty: {
          variant: "muted",
          title: input.emptyTitle,
          ...(input.emptyDescription
            ? { description: input.emptyDescription }
            : {}),
        },
      },
      columns: [...input.columns],
      rows: [...input.rows],
    });
}

export function linkCell(
  href: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  return { kind: "link", href };
}

export function catalogStatusBadge(
  status: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (status === "orphan" || status === "disabled" || status === "deprecated" || status === "missing") {
    return { kind: "badge", tone: "critical" };
  }

  if (status === "unused" || status === "preview") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "positive" };
}

export function riskLevelBadge(
  riskLevel: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (riskLevel === "critical" || riskLevel === "elevated") {
    return { kind: "badge", tone: "critical" };
  }

  if (riskLevel === "high" || riskLevel === "standard") {
    return { kind: "badge", tone: "attention" };
  }

  if (riskLevel === "medium") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "default" };
}

export function permissionCoverageVerdictBadge(
  verdict: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (
    verdict === "orphan" ||
    verdict === "missing_capability" ||
    verdict === "overprivileged"
  ) {
    return { kind: "badge", tone: "critical" };
  }

  if (verdict === "unassigned" || verdict === "deprecated") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "positive" };
}

export function moduleReadinessVerdictBadge(
  verdict: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (verdict === "blocked") {
    return { kind: "badge", tone: "critical" };
  }

  if (verdict === "warning") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "positive" };
}

export function coverageVerdictBadge(
  verdict: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (
    verdict === "missing_permission" ||
    verdict === "missing_route" ||
    verdict === "missing_audit" ||
    verdict === "disabled"
  ) {
    return { kind: "badge", tone: "critical" };
  }

  if (verdict === "missing_docs") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "positive" };
}
