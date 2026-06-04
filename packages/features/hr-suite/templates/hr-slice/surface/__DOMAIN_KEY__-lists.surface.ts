import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../../hr-suite-integration/metadata";
import {
  __IDENTIFIER_CAMEL__ReadPermission,
  type __IDENTIFIER__ListCellValue,
  type __IDENTIFIER__ListRow,
} from "../contracts/__DOMAIN_KEY__.contract";
import {
  __CONSTANT_PREFIX___LIST_SURFACE_COLUMNS_BY_KEY,
  __CONSTANT_PREFIX___LIST_SURFACE_PROFILE_BY_KEY,
  __CONSTANT_PREFIX___LIST_SURFACE_REGISTRY,
  __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
  type __IDENTIFIER__ListSurfaceKey,
} from "./__DOMAIN_KEY__-surface-metadata.shared";
import { __IDENTIFIER_CAMEL__UiCopy } from "./__DOMAIN_KEY__-ui.copy.shared";

function formatCellValue(value: __IDENTIFIER__ListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(
  rows: readonly __IDENTIFIER__ListRow[],
): HrSuiteListRow[] {
  return rows.map((row) => ({
    id: row.id,
    ...(row.rowHref ? { rowHref: row.rowHref } : {}),
    ...(row.rowTone ? { rowTone: row.rowTone } : {}),
    cells: Object.fromEntries(
      Object.entries(row.cells).map(([key, value]) => [
        key,
        formatCellValue(value),
      ]),
    ),
  }));
}

function getRegistryEntry(surfaceKey: __IDENTIFIER__ListSurfaceKey) {
  const entry = __CONSTANT_PREFIX___LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown __CAPABILITY_TITLE__ list surface: ${surfaceKey}`);
  }
  return entry;
}

export function build__IDENTIFIER__ListSurface(input: {
  readonly surfaceKey: __IDENTIFIER__ListSurfaceKey;
  readonly rows: readonly __IDENTIFIER__ListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = __IDENTIFIER_CAMEL__UiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(
      `__CAPABILITY_TITLE__ surface ${input.surfaceKey} must define columns.`,
    );
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: __IDENTIFIER_CAMEL__ReadPermission,
    profile: __CONSTANT_PREFIX___LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
    searchToolbar: buildHrSuiteListSearchToolbarFromRegistryEntry(
      entry,
      input.searchValue,
    ),
    window: buildHrStaticListWindow({ rowCount: rows.length }),
    surface: {
      headerTitle: copy.title,
      columnsId: input.surfaceKey,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: __CONSTANT_PREFIX___LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function build__IDENTIFIER__WorkbenchListSurface(input: {
  readonly rows: readonly __IDENTIFIER__ListRow[];
  readonly search?: string | null;
}) {
  return build__IDENTIFIER__ListSurface({
    surfaceKey: __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
