import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  hrIndustryFhcReadPermission,
  type HrIndustryFhcListCellValue,
  type HrIndustryFhcListRow,
} from "./hr.industry.fhc.contract";
import {
  HR_INDUSTRY_FHC_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_INDUSTRY_FHC_LIST_SURFACE_PROFILE_BY_KEY,
  HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY,
  hrIndustryFhcEmployeeComplianceSurfaceKey,
  type HrIndustryFhcListSurfaceKey,
} from "./hr.industry.fhc-surface-metadata.shared";
import { hrIndustryFhcUiCopy } from "./hr.industry.fhc-ui.copy.shared";

function formatCellValue(value: HrIndustryFhcListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(rows: readonly HrIndustryFhcListRow[]): HrSuiteListRow[] {
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

function getRegistryEntry(surfaceKey: HrIndustryFhcListSurfaceKey) {
  const entry = HR_INDUSTRY_FHC_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown FHC list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrIndustryFhcListSurface(input: {
  readonly surfaceKey: HrIndustryFhcListSurfaceKey;
  readonly rows: readonly HrIndustryFhcListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrIndustryFhcUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(`FHC surface ${input.surfaceKey} must define columns.`);
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrIndustryFhcReadPermission,
    profile: HR_INDUSTRY_FHC_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_INDUSTRY_FHC_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrIndustryFhcWorkbenchListSurface(input: {
  readonly rows: readonly HrIndustryFhcListRow[];
  readonly search?: string | null;
}) {
  return buildHrIndustryFhcListSurface({
    surfaceKey: hrIndustryFhcEmployeeComplianceSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
