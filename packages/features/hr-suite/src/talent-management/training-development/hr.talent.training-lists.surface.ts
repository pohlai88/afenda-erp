import { buildHrStaticListWindow } from "../../../hr-suite-integration";
import {
  buildHrSuiteListSearchToolbarFromRegistryEntry,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListRow,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  hrTalentTrainingReadPermission,
  type HrTrainingListCellValue,
  type HrTrainingListRow,
} from "./hr.talent.training.contract";
import {
  HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY,
  HR_TRAINING_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_TRAINING_LIST_SURFACE_PROFILE_BY_KEY,
  hrTrainingCoursesSurfaceKey,
  type HrTrainingListSurfaceKey,
} from "./hr.talent.training-surface-metadata.shared";
import { hrTalentTrainingUiCopy } from "./hr.talent.training-ui.copy.shared";

function formatCellValue(value: HrTrainingListCellValue): string {
  if (value === null) return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function formatListRows(rows: readonly HrTrainingListRow[]): readonly HrSuiteListRow[] {
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

function getRegistryEntry(surfaceKey: HrTrainingListSurfaceKey) {
  const entry = HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY.find(
    (candidate) => candidate.surfaceKey === surfaceKey,
  );
  if (!entry) {
    throw new Error(`Unknown Training & Development list surface: ${surfaceKey}`);
  }
  return entry;
}

export function buildHrTrainingListSurface(input: {
  readonly surfaceKey: HrTrainingListSurfaceKey;
  readonly rows: readonly HrTrainingListRow[];
  readonly searchValue?: string | null;
}) {
  const entry = getRegistryEntry(input.surfaceKey);
  const copy = hrTalentTrainingUiCopy.listSections[input.surfaceKey];
  const rows = formatListRows(input.rows);
  const primaryColumn = entry.columns[0];

  if (!primaryColumn) {
    throw new Error(`Training surface ${input.surfaceKey} must define columns.`);
  }

  return buildHrSuiteOperationalListSurface({
    primaryColumnId: primaryColumn.id,
    readPermission: hrTalentTrainingReadPermission,
    profile: HR_TRAINING_LIST_SURFACE_PROFILE_BY_KEY[input.surfaceKey],
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
    columns: HR_TRAINING_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
    rows,
  });
}

export const buildHrTalentTrainingListSurface = buildHrTrainingListSurface;

export function buildHrTalentTrainingWorkbenchListSurface(input: {
  readonly rows: readonly HrTrainingListRow[];
  readonly search?: string | null;
}) {
  return buildHrTrainingListSurface({
    surfaceKey: hrTrainingCoursesSurfaceKey,
    rows: input.rows,
    searchValue: input.search,
  });
}
