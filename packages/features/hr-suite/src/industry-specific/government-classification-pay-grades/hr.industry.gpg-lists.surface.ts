import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../hr-suite-integration/metadata";
import {
  hrIndustryGpgReadPermission,
  type HrIndustryGpgListCellValue,
  type HrIndustryGpgListRow,
} from "./hr.industry.gpg.contract";
import {
  HR_INDUSTRY_GPG_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_INDUSTRY_GPG_LIST_SURFACE_PROFILE_BY_KEY,
  HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY,
  hrIndustryGpgClassificationAssignmentsSurfaceKey,
  type HrIndustryGpgListSurfaceKey,
} from "./hr.industry.gpg-surface-metadata.shared";
import { hrIndustryGpgUiCopy } from "./hr.industry.gpg-ui.copy.shared";

function formatCellValue(value: HrIndustryGpgListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(
  rows: readonly HrIndustryGpgListRow[],
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

function getRegistryEntry(surfaceKey: HrIndustryGpgListSurfaceKey) {
  const entry = HR_INDUSTRY_GPG_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown GPG list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrIndustryGpgListSurface(input: {
  readonly surfaceKey: HrIndustryGpgListSurfaceKey;
  readonly rows: readonly HrIndustryGpgListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrIndustryGpgUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(`GPG surface ${input.surfaceKey} must define columns.`);
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrIndustryGpgReadPermission,
    profile: HR_INDUSTRY_GPG_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_INDUSTRY_GPG_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrIndustryGpgWorkbenchListSurface(input: {
  readonly rows: readonly HrIndustryGpgListRow[];
  readonly search?: string | null;
}) {
  return buildHrIndustryGpgListSurface({
    surfaceKey: hrIndustryGpgClassificationAssignmentsSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
