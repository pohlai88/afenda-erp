import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type {
  HrCareerRoleCompareResult,
  HrCareerSkillGapCompareResult,
} from "@afenda/db";

import {
  hrCareerPathFrameworksSearchParam,
  hrCareerPathFrameworksSurfaceKey,
  hrCareerPathPlanGoalsSurfaceKey,
  hrCareerPathPlansSearchParam,
  hrCareerPathPlansSurfaceKey,
  hrCareerPathSkillGapsSearchParam,
  hrCareerPathSkillGapsSurfaceKey,
  hrCareerPathTargetRolesSurfaceKey,
} from "./hr.talent.career-pathing-search-params.parse.shared";
import {
  buildCareerPathListSearchToolbar,
  buildCareerPathOperationalListSurface,
  formatCareerPathEnumLabel,
} from "./hr.talent.career-pathing-list.shared";
import {
  hrCareerPathFrameworksColumnsId,
  hrCareerPathPlanGoalsColumnsId,
  hrCareerPathPlansColumnsId,
  hrCareerPathSkillGapsColumnsId,
  hrCareerPathTargetRolesColumnsId,
  hrCareerPathUiCopy,
} from "./hr.talent.career-pathing-ui.copy.shared";

export {
  hrCareerPathFrameworksSurfaceKey,
  hrCareerPathTargetRolesSurfaceKey,
  hrCareerPathSkillGapsSurfaceKey,
  hrCareerPathPlansSurfaceKey,
  hrCareerPathPlanGoalsSurfaceKey,
};

function buildGapRows(input: {
  gapCompare: HrCareerSkillGapCompareResult | null;
  roleCompare: HrCareerRoleCompareResult | null;
  searchValue?: string;
}) {
  const rows: Array<{
    id: string;
    cells: Record<string, string>;
    rowTone?: "attention" | "default";
  }> = [];

  for (const gap of input.roleCompare?.structureGaps ?? []) {
    if (!gap.target) {
      continue;
    }
    rows.push({
      id: `structure-${gap.field}`,
      rowTone: gap.matched ? "default" : "attention",
      cells: {
        dimension: formatCareerPathEnumLabel(gap.field),
        required: gap.target ?? "—",
        current: gap.current ?? "—",
        gap: gap.matched ? "Met" : "Gap",
      },
    });
  }

  for (const gap of input.gapCompare?.skillGaps ?? []) {
    if (!gap.gap) {
      continue;
    }
    rows.push({
      id: `skill-${gap.skillCode}`,
      rowTone: "attention",
      cells: {
        dimension: gap.label ?? gap.skillCode,
        required: String(gap.requiredLevel),
        current: gap.currentLevel === null ? "—" : String(gap.currentLevel),
        gap: "Skill gap",
      },
    });
  }

  for (const gap of input.gapCompare?.competencyGaps ?? []) {
    if (!gap.gap) {
      continue;
    }
    rows.push({
      id: `competency-${gap.competencyCode}`,
      rowTone: "attention",
      cells: {
        dimension: gap.label ?? gap.competencyCode,
        required: String(gap.requiredLevel),
        current: gap.currentLevel === null ? "—" : String(gap.currentLevel),
        gap: "Competency gap",
      },
    });
  }

  const filter = input.searchValue?.trim().toLowerCase();
  if (!filter) {
    return rows;
  }

  return rows.filter((row) =>
    Object.values(row.cells).some((value) => value.toLowerCase().includes(filter)),
  );
}

export function buildHrCareerPathFrameworksListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      pathKind: string;
      frameworkStatus: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrCareerPathUiCopy.frameworks;
  return buildCareerPathOperationalListSurface({
    surfaceKey: hrCareerPathFrameworksSurfaceKey,
    primaryColumnId: "name",
    searchToolbar: buildCareerPathListSearchToolbar({
      param: hrCareerPathFrameworksSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathFrameworksColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, pin: "start", cellKind: { kind: "text" } },
      {
        id: "pathKind",
        header: copy.colPathKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        pathKind: formatCareerPathEnumLabel(row.pathKind),
        status: formatCareerPathEnumLabel(row.frameworkStatus),
      },
    })),
  });
}

export function buildHrCareerPathTargetRolesListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeNumber: string;
      employeeName: string;
      targetRoleTitle: string;
      jobFamily: string | null;
      grade: string | null;
      targetRoleSource: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
}) {
  const copy = hrCareerPathUiCopy.targetRoles;
  return buildCareerPathOperationalListSurface({
    surfaceKey: hrCareerPathTargetRolesSurfaceKey,
    primaryColumnId: "targetRole",
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathTargetRolesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", cellKind: { kind: "text" } },
      { id: "targetRole", header: copy.colTargetRole, pin: "start", cellKind: { kind: "text" } },
      { id: "jobFamily", header: copy.colJobFamily, cellKind: { kind: "text" } },
      { id: "grade", header: copy.colGrade, cellKind: { kind: "text" } },
      { id: "source", header: copy.colSource, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.employeeName}`,
        targetRole: row.targetRoleTitle,
        jobFamily: row.jobFamily ?? "—",
        grade: row.grade ?? "—",
        source: formatCareerPathEnumLabel(row.targetRoleSource),
      },
    })),
  });
}

export function buildHrCareerPathSkillGapsListSurface(input: {
  gapCompare: HrCareerSkillGapCompareResult | null;
  roleCompare: HrCareerRoleCompareResult | null;
  searchValue?: string;
}) {
  const copy = hrCareerPathUiCopy.skillGaps;
  const rows = buildGapRows(input);

  return buildCareerPathOperationalListSurface({
    surfaceKey: hrCareerPathSkillGapsSurfaceKey,
    primaryColumnId: "dimension",
    searchToolbar: buildCareerPathListSearchToolbar({
      param: hrCareerPathSkillGapsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: {
      pageSize: Math.max(rows.length, 1),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathSkillGapsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "dimension", header: copy.colDimension, priority: "primary", cellKind: { kind: "text" } },
      { id: "required", header: copy.colRequired, cellKind: { kind: "text" } },
      { id: "current", header: copy.colCurrent, cellKind: { kind: "text" } },
      { id: "gap", header: copy.colGap, cellKind: { kind: "badge", tone: "attention" } },
    ],
    rows,
  });
}

export function buildHrCareerPathPlansListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeNumber: string;
      employeeName: string;
      code: string;
      title: string;
      planStatus: string;
      targetCompletionDate: Date | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrCareerPathUiCopy.plans;
  return buildCareerPathOperationalListSurface({
    surfaceKey: hrCareerPathPlansSurfaceKey,
    primaryColumnId: "title",
    searchToolbar: buildCareerPathListSearchToolbar({
      param: hrCareerPathPlansSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathPlansColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, cellKind: { kind: "text" } },
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "title", header: copy.colTitle, pin: "start", cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "targetDate", header: copy.colTargetDate, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.employeeName}`,
        code: row.code,
        title: row.title,
        status: formatCareerPathEnumLabel(row.planStatus),
        targetDate: row.targetCompletionDate?.toISOString() ?? "—",
      },
    })),
  });
}

const OPEN_GOAL_STATUSES = new Set([
  "not_started",
  "in_progress",
  "overdue",
  "blocked",
  "deferred",
]);

/** HRM-CAR-012 — Pattern C trailing prep on open development goals. */
export function buildHrCareerPathPlanGoalsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      goalType: string;
      title: string;
      goalStatus: string;
      priority: string;
      progressPercent: number;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  canWrite?: boolean;
}) {
  const copy = hrCareerPathUiCopy.planGoals;
  const canWrite = input.canWrite ?? false;

  return buildCareerPathOperationalListSurface({
    surfaceKey: hrCareerPathPlanGoalsSurfaceKey,
    primaryColumnId: "title",
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathPlanGoalsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "title", header: copy.colTitle, priority: "primary", pin: "start", cellKind: { kind: "text" } },
      { id: "type", header: copy.colType, cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "priority", header: copy.colPriority, cellKind: { kind: "text" } },
      { id: "progress", header: copy.colProgress, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => {
      const isOpen = OPEN_GOAL_STATUSES.has(row.goalStatus);
      return {
        id: row.id,
        trailingAction:
          isOpen && canWrite
            ? resolveListSurfaceRowTrailingAction({
                visible: true,
                allowed: true,
              })
            : resolveListSurfaceRowTrailingAction({
                visible: isOpen,
                allowed: false,
                disabledReason: "Write permission required to update goal status.",
              }),
        cells: {
          title: row.title,
          type: formatCareerPathEnumLabel(row.goalType),
          status: formatCareerPathEnumLabel(row.goalStatus),
          priority: formatCareerPathEnumLabel(row.priority),
          progress: `${row.progressPercent}%`,
        },
      };
    }),
  });
}
