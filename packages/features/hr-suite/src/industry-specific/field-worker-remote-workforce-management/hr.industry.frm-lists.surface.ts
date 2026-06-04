import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../hr-suite-integration/metadata";
import {
  hrIndustryFrmReadPermission,
  type HrIndustryFrmListCellValue,
  type HrIndustryFrmListRow,
} from "./hr.industry.frm.contract";
import {
  HR_INDUSTRY_FRM_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_INDUSTRY_FRM_LIST_SURFACE_PROFILE_BY_KEY,
  HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY,
  hrIndustryFrmAssignmentsSurfaceKey,
  type HrIndustryFrmListSurfaceKey,
} from "./hr.industry.frm-surface-metadata.shared";
import { hrIndustryFrmUiCopy } from "./hr.industry.frm-ui.copy.shared";

function formatCellValue(value: HrIndustryFrmListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(rows: readonly HrIndustryFrmListRow[]): HrSuiteListRow[] {
  return rows.map((row) => ({
    id: row.id,
    ...(row.rowHref ? { rowHref: row.rowHref } : {}),
    ...(row.rowTone ? { rowTone: "attention" as const } : {}),
    cells: Object.fromEntries(
      Object.entries(row.cells).map(([key, value]) => [
        key,
        formatCellValue(value),
      ]),
    ),
  }));
}

function getRegistryEntry(surfaceKey: HrIndustryFrmListSurfaceKey) {
  const entry = HR_INDUSTRY_FRM_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown FRM list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrIndustryFrmListSurface(input: {
  readonly surfaceKey: HrIndustryFrmListSurfaceKey;
  readonly rows: readonly HrIndustryFrmListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrIndustryFrmUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(`FRM surface ${input.surfaceKey} must define columns.`);
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrIndustryFrmReadPermission,
    profile: HR_INDUSTRY_FRM_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_INDUSTRY_FRM_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrIndustryFrmWorkbenchListSurface(input: {
  readonly rows: readonly HrIndustryFrmListRow[];
  readonly search?: string | null;
}) {
  return buildHrIndustryFrmListSurface({
    surfaceKey: hrIndustryFrmAssignmentsSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
