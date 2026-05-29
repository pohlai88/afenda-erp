import "server-only"

import {
  buildGovernedListSurface,
  buildGovernedListExportToolbarPresentation,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  mergeGovernedListToolbarPresentation,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import type {
  TrainingAnalyticsSummary,
  TrainingCourseCompletionStat,
} from "./training-analytics.queries.server"
import type {
  HrmTrainingAssignmentRow,
  HrmTrainingCourseRow,
  HrmTrainingRecord,
} from "./training.types.shared"

const TRAINING_READ_PERMISSION = {
  module: "hrm" as const,
  object: "training" as const,
  function: "read" as const,
}

function trainingListHeader(columnsId: string) {
  return { title: columnsId }
}

type TrainingCatalogListCopy = {
  empty: string
  colCode: string
  colName: string
  colDelivery: string
  colStatutory: string
  colState: string
}

export function buildTrainingCatalogListSurfaceConfiguration(
  courses: readonly HrmTrainingCourseRow[],
  copy: TrainingCatalogListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    surface: {
      header: trainingListHeader("hrm-training-catalog"),
      columnsId: "hrm-training-catalog",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "delivery", header: copy.colDelivery },
      { id: "statutory", header: copy.colStatutory },
      { id: "state", header: copy.colState },
    ],
    rows: courses.map((course) => ({
      id: course.id,
      cells: {
        code: course.code,
        name: course.name,
        delivery: course.deliveryMode,
        statutory: course.statutoryFlag
          ? (course.statutoryAuthorityCode ?? "yes")
          : "—",
        state: course.state,
      },
    })),
  })
}

type TrainingAssignmentListCopy = {
  empty: string
  colEmployee: string
  colCourse: string
  colDue: string
  colState: string
  colPriority: string
  formatDue: (value: Date) => string
}

export function buildTrainingAssignmentListSurfaceConfiguration(
  assignments: readonly HrmTrainingAssignmentRow[],
  orgSlug: string,
  copy: TrainingAssignmentListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    surface: {
      header: trainingListHeader("hrm-training-assignments"),
      columnsId: "hrm-training-assignments",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "course", header: copy.colCourse },
      { id: "due", header: copy.colDue, cellKind: { kind: "date" } },
      { id: "state", header: copy.colState },
      { id: "priority", header: copy.colPriority },
    ],
    rows: assignments.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        course: row.courseName,
        due: row.dueAt ? copy.formatDue(row.dueAt as Date) : "—",
        state: row.state,
        priority: row.priority,
      },
    })),
  })
}

type TrainingAnalyticsCourseListCopy = {
  empty: string
  colCourse: string
  colCompletionRate: string
  colAssignments: string
  colCompletions: string
  exportReport: string
}

export function buildTrainingAnalyticsCourseListSurfaceConfiguration(
  stats: readonly TrainingCourseCompletionStat[],
  copy: TrainingAnalyticsCourseListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    presentation: mergeGovernedListToolbarPresentation(
      {
        primaryColumnId: "course",
        narrowMode: "auto",
        toolbar: {
          search: {
            param: "trainingAnalyticsSearch",
            label: "Search courses",
            placeholder: "Search course code or name",
          },
          sort: {
            label: "Sort",
            param: "trainingAnalyticsSort",
            options: [
              {
                label: copy.colCompletionRate,
                value: "completion-desc",
                columnId: "completionRate",
                direction: "desc",
              },
              {
                label: copy.colCourse,
                value: "course-asc",
                columnId: "course",
                direction: "asc",
              },
            ],
          },
        },
      },
      buildGovernedListExportToolbarPresentation({
        actionId: "hrm.training.analytics.export",
        label: copy.exportReport,
      }).toolbar ?? {}
    ),
    surface: {
      header: trainingListHeader("hrm-training-analytics-courses"),
      columnsId: "hrm-training-analytics-courses",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "course", header: copy.colCourse },
      { id: "completionRate", header: copy.colCompletionRate, align: "end" },
      { id: "assignments", header: copy.colAssignments, align: "end" },
      { id: "completions", header: copy.colCompletions, align: "end" },
    ],
    rows: stats.map((row) => ({
      id: row.courseId,
      cells: {
        course: `${row.courseCode} ${row.courseName}`,
        completionRate: `${row.completionRate}%`,
        assignments: row.assignmentCount,
        completions: row.completedCount,
      },
    })),
  })
}

export const TRAINING_ANALYTICS_STAT_SURFACE_KEY =
  "hrm:training:analytics-summary"

type TrainingAnalyticsStatCopy = {
  openAssignments: string
  totalRecords: string
  expiring90: string
  totalCost: string
  lmsLinkedCourses: string
  lmsLinkedCompletions: string
}

export function buildTrainingAnalyticsStatConfiguration(
  summary: TrainingAnalyticsSummary,
  copy: TrainingAnalyticsStatCopy
): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.openAssignments,
        value: String(summary.openAssignments),
        tone: "default",
      },
      {
        label: copy.totalRecords,
        value: String(summary.totalRecords),
        tone: "default",
      },
      {
        label: copy.expiring90,
        value: String(summary.expiringWithin90Days),
        tone: summary.expiringWithin90Days > 0 ? "attention" : "default",
      },
      {
        label: copy.totalCost,
        value: summary.totalCostAmount ?? "—",
        tone: "default",
      },
      {
        label: copy.lmsLinkedCourses,
        value: String(summary.lmsLinkedCourseCount),
        tone: "default",
      },
      {
        label: copy.lmsLinkedCompletions,
        value: String(summary.lmsLinkedCompletedCount),
        tone:
          summary.lmsLinkedCompletedCount > 0 &&
          summary.lmsLinkedCompletedCount < summary.lmsLinkedCourseCount
            ? "attention"
            : "default",
      },
    ],
  })
}

type TrainingFeedbackListCopy = {
  empty: string
  colCourse: string
  colCount: string
  colAverage: string
}

export type TrainingFeedbackAggregateRow = {
  readonly courseId: string
  readonly courseCode: string
  readonly courseName: string
  readonly feedbackCount: number
  readonly averageRating: number | null
}

export function buildTrainingFeedbackListSurfaceConfiguration(
  rows: readonly TrainingFeedbackAggregateRow[],
  copy: TrainingFeedbackListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    surface: {
      header: trainingListHeader("hrm-training-feedback"),
      columnsId: "hrm-training-feedback",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "course", header: copy.colCourse },
      { id: "count", header: copy.colCount, align: "end" },
      { id: "average", header: copy.colAverage, align: "end" },
    ],
    rows: rows.map((row) => ({
      id: row.courseId,
      cells: {
        course: `${row.courseCode} ${row.courseName}`,
        count: row.feedbackCount,
        average: row.averageRating !== null ? `${row.averageRating}/5` : "—",
      },
    })),
  })
}

type TrainingSessionRosterListCopy = {
  colEmployee: string
  colAttendance: string
  colState: string
}

type TrainingRecordListCopy = {
  empty: string
  colCourse: string
  colCompleted: string
  colVerification: string
  colExpires: string
  formatDate: (value: Date) => string
}

type EmployeeDetailTrainingAssignmentListCopy = {
  empty: string
  colCourse: string
  colDue: string
  colState: string
  formatDue: (value: Date) => string
}

export function buildEmployeeDetailTrainingAssignmentListSurfaceConfiguration(
  assignments: readonly HrmTrainingAssignmentRow[],
  copy: EmployeeDetailTrainingAssignmentListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    surface: {
      header: trainingListHeader("hrm-employee-training-assignments"),
      columnsId: "hrm-employee-training-assignments",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "course", header: copy.colCourse },
      { id: "due", header: copy.colDue, cellKind: { kind: "date" } },
      { id: "state", header: copy.colState },
    ],
    rows: assignments.map((row) => ({
      id: row.id,
      cells: {
        course: row.courseName,
        due: row.dueAt ? copy.formatDue(row.dueAt as Date) : "—",
        state: row.state,
      },
    })),
  })
}

type TrainingOrgRecordListCopy = TrainingRecordListCopy & {
  colEmployee: string
}

export function buildTrainingOrgRecordsListSurfaceConfiguration(
  records: readonly HrmTrainingRecord[],
  orgSlug: string,
  copy: TrainingOrgRecordListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    surface: {
      header: trainingListHeader("hrm-training-org-records"),
      columnsId: "hrm-training-org-records",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "course", header: copy.colCourse },
      {
        id: "completed",
        header: copy.colCompleted,
        cellKind: { kind: "date" },
      },
      {
        id: "verification",
        header: copy.colVerification,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "expires", header: copy.colExpires },
    ],
    rows: records.map((record) => ({
      id: record.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, record.employeeId, "employee"),
      cells: {
        employee: `${record.employeeName} (${record.employeeNumber})`,
        course: record.courseName,
        completed: copy.formatDate(record.completedAt),
        verification: record.verificationState,
        expires: record.expiresAt ? copy.formatDate(record.expiresAt) : "—",
      },
      trailingAction:
        record.verificationState === "self_attested"
          ? { state: "ready" as const }
          : { state: "hidden" as const },
    })),
  })
}

export function buildTrainingRecordListSurfaceConfiguration(
  records: readonly HrmTrainingRecord[],
  copy: TrainingRecordListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    surface: {
      header: trainingListHeader("hrm-training-records"),
      columnsId: "hrm-training-records",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "course", header: copy.colCourse },
      {
        id: "completed",
        header: copy.colCompleted,
        cellKind: { kind: "date" },
      },
      {
        id: "verification",
        header: copy.colVerification,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "expires", header: copy.colExpires },
    ],
    rows: records.map((record) => ({
      id: record.id,
      cells: {
        course: record.courseName,
        completed: copy.formatDate(record.completedAt),
        verification: record.verificationState,
        expires: record.expiresAt ? copy.formatDate(record.expiresAt) : "—",
      },
    })),
  })
}

export function buildTrainingSessionRosterListSurfaceConfiguration(
  roster: readonly HrmTrainingAssignmentRow[],
  orgSlug: string,
  copy: TrainingSessionRosterListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: TRAINING_READ_PERMISSION,
    surface: {
      header: trainingListHeader("hrm-training-session-roster"),
      columnsId: "hrm-training-session-roster",
      rowKey: "id",
      empty: { variant: "muted", title: "—" },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "attendance", header: copy.colAttendance },
      { id: "state", header: copy.colState },
    ],
    rows: roster.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        attendance: row.attendance ?? "—",
        state: row.state,
      },
    })),
  })
}
