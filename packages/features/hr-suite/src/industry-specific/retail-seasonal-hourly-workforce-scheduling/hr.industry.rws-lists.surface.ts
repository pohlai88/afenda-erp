import { buildHrStaticListWindow } from "../../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  hrIndustryRwsReadPermission,
  type HrIndustryRwsListCellValue,
  type HrIndustryRwsListRow,
} from "./hr.industry.rws.contract";
import {
  HR_INDUSTRY_RWS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_INDUSTRY_RWS_LIST_SURFACE_PROFILE_BY_KEY,
  HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY,
  hrIndustryRwsWorkbenchSurfaceKey,
  type HrIndustryRwsListSurfaceKey,
} from "./hr.industry.rws-surface-metadata.shared";
import { hrIndustryRwsUiCopy } from "./hr.industry.rws-ui.copy.shared";

function formatCellValue(value: HrIndustryRwsListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(rows: readonly HrIndustryRwsListRow[]): HrSuiteListRow[] {
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

function getRegistryEntry(surfaceKey: HrIndustryRwsListSurfaceKey) {
  const entry = HR_INDUSTRY_RWS_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown RWS list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrIndustryRwsListSurface(input: {
  readonly surfaceKey: HrIndustryRwsListSurfaceKey;
  readonly rows: readonly HrIndustryRwsListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrIndustryRwsUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(`RWS surface ${input.surfaceKey} must define columns.`);
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrIndustryRwsReadPermission,
    profile: HR_INDUSTRY_RWS_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_INDUSTRY_RWS_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrIndustryRwsWorkbenchListSurface(input: {
  readonly rows: readonly HrIndustryRwsListRow[];
  readonly search?: string | null;
}) {
  return buildHrIndustryRwsListSurface({
    surfaceKey: hrIndustryRwsWorkbenchSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
