import type { HrCareerPathingReportRow } from "./hr.talent.career-pathing.reports.shared";
import { hrCareerPathingReportsSearchParam } from "./hr.talent.career-pathing-search-params.parse.shared";
import {
  buildCareerPathingListSearchToolbar,
  buildCareerPathingOperationalListSurface,
  careerPathingWindowFor,
  filterCareerPathingRows,
} from "./hr.talent.career-pathing-list.shared";
import { hrCareerPathingUiCopy } from "./hr.talent.career-pathing-ui.copy.shared";

export const hrCareerPathingReportsColumnsId =
  "hr.talent.career-pathing.reports.columns" as const;

export const hrCareerPathingReportsSurfaceKey =
  "hr.talent.career-pathing.reports.list" as const;

/** HRM-CAR-029 — career development reports list surface. */
export function buildHrCareerPathingReportsListSurface(input: {
  rows: readonly HrCareerPathingReportRow[];
  searchValue?: string;
}) {
  const copy = hrCareerPathingUiCopy.reports;
  const filtered = filterCareerPathingRows(
    input.rows.map((row) => ({
      id: row.id,
      groupLabel: row.groupLabel,
      groupKey: row.groupKey,
      employeeCount: String(row.employeeCount),
      planCount: String(row.planCount),
      nearReadyCount: String(row.nearReadyCount),
      overdueMilestoneCount: String(row.overdueMilestoneCount),
      completedGoalCount: String(row.completedGoalCount),
    })),
    input.searchValue,
    ["groupLabel", "groupKey"],
  );

  return buildCareerPathingOperationalListSurface({
    primaryColumnId: "groupLabel",
    searchToolbar: buildCareerPathingListSearchToolbar({
      param: hrCareerPathingReportsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: careerPathingWindowFor(filtered),
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathingReportsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "groupLabel",
        header: copy.colGroup,
        priority: "primary",
        pin: "start",
        cellKind: { kind: "text" },
      },
      {
        id: "employeeCount",
        header: copy.colEmployees,
        cellKind: { kind: "text" },
      },
      {
        id: "planCount",
        header: copy.colPlans,
        cellKind: { kind: "text" },
      },
      {
        id: "nearReadyCount",
        header: copy.colNearReady,
        cellKind: { kind: "text" },
      },
      {
        id: "overdueMilestoneCount",
        header: copy.colOverdue,
        cellKind: { kind: "text" },
      },
      {
        id: "completedGoalCount",
        header: copy.colCompletedGoals,
        cellKind: { kind: "text" },
      },
    ],
    rows: filtered.map((row) => ({
      id: row.id,
      cells: {
        groupLabel: row.groupLabel,
        groupKey: row.groupKey,
        employeeCount: row.employeeCount,
        planCount: row.planCount,
        nearReadyCount: row.nearReadyCount,
        overdueMilestoneCount: row.overdueMilestoneCount,
        completedGoalCount: row.completedGoalCount,
      },
    })),
  });
}
