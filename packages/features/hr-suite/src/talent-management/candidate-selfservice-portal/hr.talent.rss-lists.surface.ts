import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  hrTalentRssReadPermission,
  type HrTalentRssListCellValue,
  type HrTalentRssListRow,
} from "./hr.talent.rss.contract";
import {
  HR_TALENT_RSS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_TALENT_RSS_LIST_SURFACE_PROFILE_BY_KEY,
  HR_TALENT_RSS_LIST_SURFACE_REGISTRY,
  type HrTalentRssListSurfaceKey,
} from "./hr.talent.rss-surface-metadata.shared";
import { hrTalentRssUiCopy } from "./hr.talent.rss-ui.copy.shared";

function formatCellValue(value: HrTalentRssListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(
  rows: readonly HrTalentRssListRow[],
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

function getRegistryEntry(surfaceKey: HrTalentRssListSurfaceKey) {
  const entry = HR_TALENT_RSS_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown Candidate Selfservice Portal list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrTalentRssListSurface(input: {
  readonly surfaceKey: HrTalentRssListSurfaceKey;
  readonly rows: readonly HrTalentRssListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrTalentRssUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(
      `Candidate Selfservice Portal surface ${input.surfaceKey} must define columns.`,
    );
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrTalentRssReadPermission,
    profile: HR_TALENT_RSS_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_TALENT_RSS_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}
