import { hrCareerPathingReadinessSearchParam } from "../data/hr.talent.career-pathing-search-params.parse.shared";
import { formatCareerReadinessLevelLabel } from "../data/hr.talent.career-pathing-readiness.shared";
import {
  buildCareerPathingListSearchToolbar,
  buildCareerPathingOperationalListSurface,
  careerPathingWindowFor,
  filterCareerPathingRows,
  formatCareerPathingEnumLabel,
} from "./hr.talent.career-pathing-list.shared";
import { hrCareerPathingUiCopy } from "./hr.talent.career-pathing-ui.copy.shared";

export const hrCareerPathingReadinessColumnsId =
  "hr.talent.career-pathing.readiness.columns" as const;

export const hrCareerPathingReadinessSurfaceKey =
  "hr.talent.career-pathing.readiness.list" as const;

/** HRM-CAR-023/024 — readiness progress list surface. */
export function buildHrCareerPathingReadinessListSurface(input: {
  rows: Array<{
    id: string;
    employeeNumber: string;
    employeeName: string;
    targetRoleTitle: string | null;
    readinessLevel: string;
    readinessScore: string | null;
    computedAt: Date;
  }>;
  searchValue?: string;
}) {
  const copy = hrCareerPathingUiCopy.readiness;
  const searchableRows = input.rows.map((row) => ({
    id: row.id,
    employeeNumber: row.employeeNumber,
    employeeName: row.employeeName,
    targetRoleTitle: row.targetRoleTitle ?? "",
    readinessLevel: row.readinessLevel,
    readinessScore: row.readinessScore ?? "",
    computedAt: row.computedAt.toISOString(),
  }));
  const filtered = filterCareerPathingRows(searchableRows, input.searchValue, [
    "employeeNumber",
    "employeeName",
    "targetRoleTitle",
    "readinessLevel",
  ]);

  return buildCareerPathingOperationalListSurface({
    primaryColumnId: "employeeName",
    searchToolbar: buildCareerPathingListSearchToolbar({
      param: hrCareerPathingReadinessSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: careerPathingWindowFor(filtered),
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathingReadinessColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employeeNumber",
        header: "Number",
        pin: "start",
        minWidth: 120,
        cellKind: { kind: "text" },
      },
      {
        id: "employeeName",
        header: copy.colEmployee,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "targetRoleTitle",
        header: copy.colTargetRole,
        cellKind: { kind: "text" },
        minWidth: 180,
      },
      {
        id: "readinessLevel",
        header: copy.colLevel,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "readinessScore",
        header: copy.colScore,
        cellKind: { kind: "text" },
      },
      {
        id: "computedAt",
        header: copy.colComputedAt,
        cellKind: { kind: "date" },
        minWidth: 160,
      },
    ],
    rows: filtered.map((row) => ({
      id: row.id,
      cells: {
        employeeNumber: row.employeeNumber,
        employeeName: row.employeeName,
        targetRoleTitle: row.targetRoleTitle || "—",
        readinessLevel: formatCareerReadinessLevelLabel(
          row.readinessLevel as Parameters<typeof formatCareerReadinessLevelLabel>[0],
        ),
        readinessScore: row.readinessScore ? `${row.readinessScore}%` : "—",
        computedAt: row.computedAt,
        readinessLevelValue: formatCareerPathingEnumLabel(row.readinessLevel),
      },
    })),
  });
}
