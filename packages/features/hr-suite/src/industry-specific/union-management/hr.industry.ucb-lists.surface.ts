import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  hrIndustryUcbReadPermission,
  type HrIndustryUcbListCellValue,
  type HrIndustryUcbListRow,
} from "./hr.industry.ucb.contract";
import {
  HR_INDUSTRY_UCB_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_INDUSTRY_UCB_LIST_SURFACE_PROFILE_BY_KEY,
  HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY,
  hrIndustryUcbWorkbenchSurfaceKey,
  type HrIndustryUcbListSurfaceKey,
} from "./hr.industry.ucb-surface-metadata.shared";
import { hrIndustryUcbUiCopy } from "./hr.industry.ucb-ui.copy.shared";

function formatCellValue(value: HrIndustryUcbListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(
  rows: readonly HrIndustryUcbListRow[],
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

function getRegistryEntry(surfaceKey: HrIndustryUcbListSurfaceKey) {
  const entry = HR_INDUSTRY_UCB_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown UCB list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrIndustryUcbListSurface(input: {
  readonly surfaceKey: HrIndustryUcbListSurfaceKey;
  readonly rows: readonly HrIndustryUcbListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrIndustryUcbUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(`UCB surface ${input.surfaceKey} must define columns.`);
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrIndustryUcbReadPermission,
    profile: HR_INDUSTRY_UCB_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_INDUSTRY_UCB_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrIndustryUcbWorkbenchListSurface(input: {
  readonly rows: readonly HrIndustryUcbListRow[];
  readonly search?: string | null;
}) {
  return buildHrIndustryUcbListSurface({
    surfaceKey: hrIndustryUcbWorkbenchSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
