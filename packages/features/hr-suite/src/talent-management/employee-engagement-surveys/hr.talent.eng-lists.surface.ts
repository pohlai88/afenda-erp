import { buildHrStaticListWindow } from "../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  hrTalentEngReadPermission,
  type HrTalentEngListCellValue,
  type HrTalentEngListRow,
} from "./hr.talent.eng.contract";
import {
  HR_TALENT_ENG_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_TALENT_ENG_LIST_SURFACE_PROFILE_BY_KEY,
  HR_TALENT_ENG_LIST_SURFACE_REGISTRY,
  hrTalentEngSurveysSurfaceKey,
  type HrTalentEngListSurfaceKey,
} from "./hr.talent.eng-surface-metadata.shared";
import { hrTalentEngUiCopy } from "./hr.talent.eng-ui.copy.shared";

function formatCellValue(value: HrTalentEngListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toSurfaceRows(
  rows: readonly HrTalentEngListRow[],
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

function getRegistryEntry(surfaceKey: HrTalentEngListSurfaceKey) {
  const entry = HR_TALENT_ENG_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(
      `Unknown Employee Engagement Surveys list surface: ${surfaceKey}`,
    );
  }
  return entry;
}

export function buildHrTalentEngListSurface(input: {
  readonly surfaceKey: HrTalentEngListSurfaceKey;
  readonly rows: readonly HrTalentEngListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrTalentEngUiCopy.listSections[input.surfaceKey];
  const rows = toSurfaceRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(
      `Employee Engagement Surveys surface ${input.surfaceKey} must define columns.`,
    );
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrTalentEngReadPermission,
    profile: HR_TALENT_ENG_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_TALENT_ENG_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export function buildHrTalentEngWorkbenchListSurface(input: {
  readonly rows: readonly HrTalentEngListRow[];
  readonly search?: string | null;
}) {
  return buildHrTalentEngListSurface({
    surfaceKey: hrTalentEngSurveysSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
