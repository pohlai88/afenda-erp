import {
  hrCsfAuditSearchParam,
  hrCsfAuditSurfaceKey,
  hrCsfCompetenciesSearchParam,
  hrCsfCompetenciesSurfaceKey,
  hrCsfGapsSearchParam,
  hrCsfGapsSurfaceKey,
  hrCsfMatchingSearchParam,
  hrCsfMatchingSurfaceKey,
  hrCsfReportsSearchParam,
  hrCsfReportsSurfaceKey,
  hrCsfSkillsSearchParam,
  hrCsfSkillsSurfaceKey,
} from "../data/hr.talent.csf-search-params.parse.shared";
import {
  buildCsfListSearchToolbar,
  buildCsfOperationalListSurface,
  formatCsfEnumLabel,
} from "./hr.talent.csf-list.shared";
import {
  hrCsfAuditColumnsId,
  hrCsfCompetenciesColumnsId,
  hrCsfGapsColumnsId,
  hrCsfMatchingColumnsId,
  hrCsfReportsColumnsId,
  hrCsfSkillsColumnsId,
} from "./hr.talent.csf-surface-columns.shared";
import { hrCsfUiCopy } from "./hr.talent.csf-ui.copy.shared";

export function buildHrCsfCompetenciesListSurface(input: {
  rows: readonly {
    id: string;
    code: string;
    name: string;
    category: string;
    status: string;
  }[];
  searchValue?: string;
}) {
  const copy = hrCsfUiCopy.competencies;
  const filtered = filterRows(input.rows, input.searchValue, ["code", "name", "category"]);
  return buildCsfOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildCsfListSearchToolbar({
      param: hrCsfCompetenciesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: windowFor(filtered),
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCsfCompetenciesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, pin: "start", minWidth: 120, cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, priority: "primary", cellKind: { kind: "text" } },
      { id: "category", header: copy.colCategory, cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: filtered.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        category: formatCsfEnumLabel(row.category),
        status: formatCsfEnumLabel(row.status),
      },
    })),
  });
}

export function buildHrCsfSkillsListSurface(input: {
  rows: readonly {
    id: string;
    code: string;
    name: string;
    category: string;
    status: string;
  }[];
  searchValue?: string;
}) {
  const copy = hrCsfUiCopy.skills;
  const filtered = filterRows(input.rows, input.searchValue, ["code", "name", "category"]);
  return buildCsfOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildCsfListSearchToolbar({
      param: hrCsfSkillsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: windowFor(filtered),
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCsfSkillsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, pin: "start", minWidth: 120, cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, priority: "primary", cellKind: { kind: "text" } },
      { id: "category", header: copy.colCategory, cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: filtered.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        category: formatCsfEnumLabel(row.category),
        status: formatCsfEnumLabel(row.status),
      },
    })),
  });
}

export function buildHrCsfGapsListSurface(input: {
  rows: readonly {
    id: string;
    employeeDisplayName: string;
    itemName: string;
    gapKind: string;
    requiredLevel: string;
    currentLevel: string;
    severity: string;
    priority: string;
  }[];
  searchValue?: string;
}) {
  const copy = hrCsfUiCopy.gaps;
  const filtered = filterRows(input.rows, input.searchValue, [
    "employeeDisplayName",
    "itemName",
    "gapKind",
  ]);
  return buildCsfOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildCsfListSearchToolbar({
      param: hrCsfGapsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: windowFor(filtered),
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCsfGapsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", priority: "primary", cellKind: { kind: "text" } },
      { id: "item", header: copy.colItem, cellKind: { kind: "text" } },
      { id: "kind", header: copy.colKind, cellKind: { kind: "badge", tone: "default" } },
      { id: "required", header: copy.colRequired, cellKind: { kind: "text" } },
      { id: "current", header: copy.colCurrent, cellKind: { kind: "text" } },
      { id: "severity", header: copy.colSeverity, cellKind: { kind: "badge", tone: "default" } },
      { id: "priority", header: copy.colPriority, cellKind: { kind: "text" } },
    ],
    rows: filtered.map((row) => ({
      id: row.id,
      cells: {
        employee: row.employeeDisplayName,
        item: row.itemName,
        kind: formatCsfEnumLabel(row.gapKind),
        required: formatCsfEnumLabel(row.requiredLevel),
        current: formatCsfEnumLabel(row.currentLevel),
        severity: formatCsfEnumLabel(row.severity),
        priority: row.priority,
      },
    })),
  });
}

export function buildHrCsfReportsListSurface(input: {
  rows: readonly {
    id: string;
    groupLabel: string;
    employeeCount: number;
    skillCount: number;
    competencyCount: number;
    gapCount: number;
    avgProficiencyIndex: number;
  }[];
  searchValue?: string;
}) {
  const copy = hrCsfUiCopy.reports;
  const filtered = filterRows(input.rows, input.searchValue, ["groupLabel"]);
  return buildCsfOperationalListSurface({
    primaryColumnId: "group",
    searchToolbar: buildCsfListSearchToolbar({
      param: hrCsfReportsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: windowFor(filtered),
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCsfReportsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "group", header: copy.colGroup, pin: "start", priority: "primary", cellKind: { kind: "text" } },
      { id: "employees", header: copy.colEmployees, cellKind: { kind: "text" } },
      { id: "skills", header: copy.colSkills, cellKind: { kind: "text" } },
      { id: "competencies", header: copy.colCompetencies, cellKind: { kind: "text" } },
      { id: "gaps", header: copy.colGaps, cellKind: { kind: "text" } },
      { id: "avgProficiency", header: copy.colAvgProficiency, cellKind: { kind: "text" } },
    ],
    rows: filtered.map((row) => ({
      id: row.id,
      cells: {
        group: row.groupLabel,
        employees: String(row.employeeCount),
        skills: String(row.skillCount),
        competencies: String(row.competencyCount),
        gaps: String(row.gapCount),
        avgProficiency: String(row.avgProficiencyIndex),
      },
    })),
  });
}

export function buildHrCsfAuditListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      action: string;
      summary: string;
      actorAuthUserId: string | null;
      createdAt: string;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrCsfUiCopy.audit;
  return buildCsfOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildCsfListSearchToolbar({
      param: hrCsfAuditSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCsfAuditColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "action", header: copy.colAction, pin: "start", priority: "primary", cellKind: { kind: "text" } },
      { id: "summary", header: copy.colSummary, cellKind: { kind: "text" } },
      { id: "actor", header: copy.colActor, cellKind: { kind: "text" } },
      { id: "when", header: copy.colWhen, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action,
        summary: row.summary,
        actor: row.actorAuthUserId ?? "system",
        when: row.createdAt,
      },
    })),
  });
}

export function buildHrCsfMatchingListSurface(input: {
  rows: readonly {
    employeeId: string;
    employeeDisplayName: string;
    departmentName: string;
    matchScorePct: number;
    matchedSkillCount: number;
    requiredSkillCount: number;
    missingCriticalSkills: readonly string[];
  }[];
  searchValue?: string;
}) {
  const copy = hrCsfUiCopy.matching;
  const filtered = filterRows(input.rows, input.searchValue, [
    "employeeDisplayName",
    "departmentName",
  ]);
  return buildCsfOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildCsfListSearchToolbar({
      param: hrCsfMatchingSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: windowFor(filtered),
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCsfMatchingColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", priority: "primary", cellKind: { kind: "text" } },
      { id: "department", header: copy.colDepartment, cellKind: { kind: "text" } },
      { id: "score", header: copy.colScore, cellKind: { kind: "text" } },
      { id: "matched", header: copy.colMatched, cellKind: { kind: "text" } },
      { id: "missingCritical", header: copy.colMissingCritical, cellKind: { kind: "text" } },
    ],
    rows: filtered.map((row) => ({
      id: row.employeeId,
      cells: {
        employee: row.employeeDisplayName,
        department: row.departmentName,
        score: `${row.matchScorePct}%`,
        matched: `${row.matchedSkillCount}/${row.requiredSkillCount}`,
        missingCritical: row.missingCriticalSkills.join(", ") || "—",
      },
    })),
  });
}

function filterRows<T extends Record<string, unknown>>(
  rows: readonly T[],
  searchValue: string | undefined,
  keys: (keyof T)[],
) {
  const trimmed = searchValue?.trim().toLowerCase();
  if (!trimmed) {
    return [...rows];
  }
  return rows.filter((row) =>
    keys
      .map((key) => String(row[key] ?? ""))
      .join(" ")
      .toLowerCase()
      .includes(trimmed),
  );
}

function windowFor<T>(rows: readonly T[]) {
  return {
    pageSize: Math.max(rows.length, 1),
    totalCount: rows.length,
    hasNextPage: false,
  };
}

export {
  hrCsfCompetenciesSurfaceKey,
  hrCsfSkillsSurfaceKey,
  hrCsfGapsSurfaceKey,
  hrCsfReportsSurfaceKey,
  hrCsfAuditSurfaceKey,
  hrCsfMatchingSurfaceKey,
};
