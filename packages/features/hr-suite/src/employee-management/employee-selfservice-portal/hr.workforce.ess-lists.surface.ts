import { buildHrStaticListWindow } from "../../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../compliance-regulatory-tracking/metadata";
import {
  hrWorkforceEssReadPermission,
  type HrWorkforceEssListCellValue,
  type HrWorkforceEssListRow,
} from "./hr.workforce.ess.contract";
import {
  HR_WORKFORCE_ESS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_WORKFORCE_ESS_LIST_SURFACE_PROFILE_BY_KEY,
  HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY,
  hrWorkforceEssProfileSummarySurfaceKey,
  type HrWorkforceEssListSurfaceKey,
} from "./hr.workforce.ess-surface-metadata.shared";
import { hrWorkforceEssUiCopy } from "./hr.workforce.ess-ui.copy.shared";

function formatCellValue(value: HrWorkforceEssListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(
  rows: readonly HrWorkforceEssListRow[],
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

function getRegistryEntry(surfaceKey: HrWorkforceEssListSurfaceKey) {
  const entry = HR_WORKFORCE_ESS_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown Employee Self-Service Portal list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrWorkforceEssListSurface(input: {
  readonly surfaceKey: HrWorkforceEssListSurfaceKey;
  readonly rows: readonly HrWorkforceEssListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrWorkforceEssUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(
      `Employee Self-Service Portal surface ${input.surfaceKey} must define columns.`,
    );
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrWorkforceEssReadPermission,
    profile: HR_WORKFORCE_ESS_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_WORKFORCE_ESS_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrWorkforceEssWorkbenchListSurface(input: {
  readonly rows: readonly HrWorkforceEssListRow[];
  readonly search?: string | null;
}) {
  return buildHrWorkforceEssListSurface({
    surfaceKey: hrWorkforceEssProfileSummarySurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
