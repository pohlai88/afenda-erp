import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrTalentLmsReadPermission } from "./hr.talent.lms.contract";
import { hrLmsUiCopy } from "./hr.talent.lms-ui.copy.shared";

type LmsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function windowFor<T>(rows: readonly T[]): LmsListWindow {
  return {
    pageSize: rows.length || 25,
    totalCount: rows.length,
    hasNextPage: false,
  };
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildLmsListSurface(input: {
  primaryColumnId: string;
  surfaceKey: string;
  headerTitle: string;
  columnsId: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: ListSurfaceRendererConfigurationInput["columns"];
  rows: ListSurfaceRendererConfigurationInput["rows"];
}) {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTalentLmsReadPermission,
    presentation: {
      primaryColumnId: input.primaryColumnId,
      toolbar: {},
    },
    pagination: windowFor(input.rows),
    surface: {
      header: { title: input.headerTitle },
      columnsId: input.columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: input.emptyTitle,
        description: input.emptyDescription,
      },
    },
    columns: input.columns,
    rows: input.rows,
  });
}

export function buildHrLmsCoursesListSurface(input: {
  rows: Array<{
    id: string;
    code: string;
    title: string;
    category: string;
    courseType: string;
    courseStatus: string;
  }>;
}) {
  const copy = hrLmsUiCopy.courses;
  return buildLmsListSurface({
    primaryColumnId: "title",
    surfaceKey: "hr.talent.lms.courses.list",
    headerTitle: copy.surfaceHeaderTitle,
    columnsId: "hr.talent.lms.courses.columns",
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    columns: [
      { id: "code", header: copy.colCode, pin: "start", minWidth: 120, cellKind: { kind: "text" } },
      { id: "title", header: copy.colTitle, priority: "primary", cellKind: { kind: "text" } },
      { id: "category", header: copy.colCategory, cellKind: { kind: "badge", tone: "default" } },
      { id: "courseType", header: copy.colType, cellKind: { kind: "badge", tone: "default" } },
      { id: "courseStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        title: row.title,
        category: row.category,
        courseType: formatEnumLabel(row.courseType),
        courseStatus: formatEnumLabel(row.courseStatus),
      },
    })),
  });
}

export function buildHrLmsEmployeeOverviewListSurface(input: {
  rows: Array<{
    id: string;
    courseTitle: string;
    progressStatus: string;
    completionPercent: number;
  }>;
}) {
  const copy = hrLmsUiCopy.employeeOverview;
  return buildLmsListSurface({
    primaryColumnId: "courseTitle",
    surfaceKey: "hr.talent.lms.employee.overview",
    headerTitle: copy.surfaceHeaderTitle,
    columnsId: "hr.talent.lms.employee.columns",
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    columns: [
      { id: "courseTitle", header: copy.colCourse, priority: "primary", cellKind: { kind: "text" } },
      { id: "progressStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "completionPercent", header: copy.colProgress, cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        courseTitle: row.courseTitle,
        progressStatus: formatEnumLabel(row.progressStatus),
        completionPercent: `${row.completionPercent}%`,
      },
    })),
  });
}

export function buildHrLmsManagerOverviewListSurface(input: {
  rows: Array<{
    id: string;
    employeeDisplayName: string;
    mandatoryIncompleteCount: number;
    completionPercent: number;
  }>;
}) {
  const copy = hrLmsUiCopy.managerOverview;
  return buildLmsListSurface({
    primaryColumnId: "employeeDisplayName",
    surfaceKey: "hr.talent.lms.manager.overview",
    headerTitle: copy.surfaceHeaderTitle,
    columnsId: "hr.talent.lms.manager.columns",
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    columns: [
      { id: "employeeDisplayName", header: copy.colEmployee, priority: "primary", cellKind: { kind: "text" } },
      { id: "mandatoryIncompleteCount", header: copy.colMandatory, cellKind: { kind: "text" } },
      { id: "completionPercent", header: copy.colProgress, cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        employeeDisplayName: row.employeeDisplayName,
        mandatoryIncompleteCount: String(row.mandatoryIncompleteCount),
        completionPercent: `${row.completionPercent}%`,
      },
    })),
  });
}

export function buildHrLmsAdminOverviewListSurface(input: {
  rows: Array<{
    id: string;
    departmentName: string;
    completionPercent: number;
    overdueCount: number;
    complianceRiskCount: number;
  }>;
}) {
  const copy = hrLmsUiCopy.adminOverview;
  return buildLmsListSurface({
    primaryColumnId: "departmentName",
    surfaceKey: "hr.talent.lms.admin.overview",
    headerTitle: copy.surfaceHeaderTitle,
    columnsId: "hr.talent.lms.admin.columns",
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    columns: [
      { id: "departmentName", header: copy.colDepartment, priority: "primary", cellKind: { kind: "text" } },
      { id: "completionPercent", header: copy.colCompletion, cellKind: { kind: "text" } },
      { id: "overdueCount", header: copy.colOverdue, cellKind: { kind: "text" } },
      { id: "complianceRiskCount", header: copy.colCompliance, cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        departmentName: row.departmentName,
        completionPercent: `${row.completionPercent}%`,
        overdueCount: String(row.overdueCount),
        complianceRiskCount: String(row.complianceRiskCount),
      },
    })),
  });
}

export function buildHrLmsReportsListSurface(input: {
  rows: Array<{
    groupKey: string;
    groupLabel: string;
    rowCount: number;
    completionPercent: number;
    overdueCount: number;
  }>;
}) {
  const copy = hrLmsUiCopy.reports;
  return buildLmsListSurface({
    primaryColumnId: "groupLabel",
    surfaceKey: "hr.talent.lms.reports.list",
    headerTitle: copy.surfaceHeaderTitle,
    columnsId: "hr.talent.lms.reports.columns",
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    columns: [
      { id: "groupLabel", header: copy.colGroup, priority: "primary", cellKind: { kind: "text" } },
      { id: "rowCount", header: copy.colRows, cellKind: { kind: "text" } },
      { id: "completionPercent", header: copy.colCompletion, cellKind: { kind: "text" } },
      { id: "overdueCount", header: copy.colOverdue, cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.groupKey,
      cells: {
        groupLabel: row.groupLabel,
        rowCount: String(row.rowCount),
        completionPercent: `${row.completionPercent}%`,
        overdueCount: String(row.overdueCount),
      },
    })),
  });
}

export function buildHrLmsAuditListSurface(input: {
  rows: Array<{
    id: string;
    action: string;
    summary: string;
    occurredAt: string;
  }>;
}) {
  const copy = hrLmsUiCopy.audit;
  return buildLmsListSurface({
    primaryColumnId: "summary",
    surfaceKey: "hr.talent.lms.audit.list",
    headerTitle: copy.surfaceHeaderTitle,
    columnsId: "hr.talent.lms.audit.columns",
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    columns: [
      { id: "action", header: copy.colAction, cellKind: { kind: "badge", tone: "default" } },
      { id: "summary", header: copy.colSummary, priority: "primary", cellKind: { kind: "text" } },
      { id: "occurredAt", header: copy.colWhen, cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        action: formatEnumLabel(row.action),
        summary: row.summary,
        occurredAt: row.occurredAt,
      },
    })),
  });
}
