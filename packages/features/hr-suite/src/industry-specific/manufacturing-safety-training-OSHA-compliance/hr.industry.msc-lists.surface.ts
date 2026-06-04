import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../hr-suite-integration/metadata";
import {
  hrIndustryMscReadPermission,
  type HrIndustryMscListCellValue,
  type HrIndustryMscListRow,
} from "./hr.industry.msc.contract";
import {
  HR_INDUSTRY_MSC_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_INDUSTRY_MSC_LIST_SURFACE_PROFILE_BY_KEY,
  HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY,
  hrIndustryMscWorkbenchSurfaceKey,
  type HrIndustryMscListSurfaceKey,
} from "./hr.industry.msc-surface-metadata.shared";
import { hrIndustryMscUiCopy } from "./hr.industry.msc-ui.copy.shared";

function formatCellValue(value: HrIndustryMscListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(rows: readonly HrIndustryMscListRow[]): HrSuiteListRow[] {
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

function getRegistryEntry(surfaceKey: HrIndustryMscListSurfaceKey) {
  const entry = HR_INDUSTRY_MSC_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown MSC list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrIndustryMscListSurface(input: {
  readonly surfaceKey: HrIndustryMscListSurfaceKey;
  readonly rows: readonly HrIndustryMscListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrIndustryMscUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(`MSC surface ${input.surfaceKey} must define columns.`);
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrIndustryMscReadPermission,
    profile: HR_INDUSTRY_MSC_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_INDUSTRY_MSC_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrIndustryMscWorkbenchListSurface(input: {
  readonly rows: readonly HrIndustryMscListRow[];
  readonly search?: string | null;
}) {
  return buildHrIndustryMscListSurface({
    surfaceKey: hrIndustryMscWorkbenchSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
