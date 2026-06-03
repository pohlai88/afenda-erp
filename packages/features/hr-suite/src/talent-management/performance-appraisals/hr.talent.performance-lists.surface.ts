import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListSurfaceProfile,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import { hrTalentPerformanceReadPermission } from "./hr.talent.performance.contract";
import type {
  HrPerformanceAuditEvent,
  HrPerformanceReportRow,
  HrPerformanceReviewRecord,
} from "./hr.talent.performance-store.shared";
import {
  hrPerformanceAppraisalsApprovalsSearchParam,
  hrPerformanceAppraisalsAuditTrailSearchParam,
  hrPerformanceAppraisalsCyclesSearchParam,
  hrPerformanceAppraisalsGoalsSearchParam,
  hrPerformanceAppraisalsOutcomesSearchParam,
  hrPerformanceAppraisalsReportsSearchParam,
  hrPerformanceAppraisalsReviewsSearchParam,
} from "./hr.talent.performance-search-params.parse.shared";
import type { HrPerCycleInput } from "./hr.talent.performance.schema";
import {
  HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_COLUMNS_BY_KEY,
  type HrPerformanceAppraisalsListSurfaceKey,
} from "./hr.talent.performance-surface-metadata.shared";
import { hrPerformanceAppraisalsUiCopy } from "./hr.talent.performance-ui.copy.shared";

type PerformanceListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type PerformanceListRow = ListSurfaceRendererConfigurationInput["rows"][number];

type PerformanceWindow<T> = {
  rows: readonly T[];
  pageSize?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  nextCursor?: string;
};

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPercent(value: number) {
  return `${Number(value.toFixed(1))}%`;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function buildPerformanceListSurface<T>(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  primaryColumnId: string;
  searchParam: string;
  searchValue?: string;
  searchPlaceholder: string;
  headerTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: PerformanceListColumn[];
  window: PerformanceWindow<T>;
  rows: PerformanceListRow[];
  presentationProfile?: Extract<
    HrSuiteListSurfaceProfile,
    "erp-operational-table" | "erp-exception-table" | "erp-audit-ledger"
  >;
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrTalentPerformanceReadPermission,
    ...(input.presentationProfile
      ? { profile: input.presentationProfile }
      : {}),
    searchToolbar: buildHrSuiteListSearchToolbar({
      param: input.searchParam,
      label: "Search",
      placeholder: input.searchPlaceholder,
      ...(input.searchValue === undefined ? {} : { value: input.searchValue }),
    }),
    window: {
      pageSize: input.window.pageSize ?? Math.max(input.rows.length, 25),
      totalCount: input.window.totalCount ?? input.rows.length,
      hasNextPage: input.window.hasNextPage ?? false,
      ...(input.window.nextCursor
        ? { nextCursor: input.window.nextCursor }
        : {}),
    },
    surface: {
      headerTitle: input.headerTitle,
      columnsId:
        HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
      rowKey: "id",
      emptyTitle: input.emptyTitle,
      emptyDescription: input.emptyDescription,
    },
    columns: input.columns,
    rows: input.rows,
  });
}

export function buildHrPerformanceAppraisalsCyclesListSurface(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  rows: readonly HrPerCycleInput[];
  searchValue?: string;
}) {
  const copy = hrPerformanceAppraisalsUiCopy.cycles;
  return buildPerformanceListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "name",
    searchParam: hrPerformanceAppraisalsCyclesSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search cycles",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      {
        id: "name",
        header: "Cycle",
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "reviewType",
        header: "Type",
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "period", header: "Period", cellKind: { kind: "text" } },
      {
        id: "submissionDeadline",
        header: "Submission",
        cellKind: { kind: "text" },
      },
      {
        id: "approvalDeadline",
        header: "Approval",
        cellKind: { kind: "text" },
      },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/performance-appraisals/cycles/${row.id}`,
      cells: {
        name: row.name,
        reviewType: formatEnumLabel(row.reviewType),
        period: `${formatDate(row.periodStart)} to ${formatDate(row.periodEnd)}`,
        submissionDeadline: formatDate(row.submissionDeadline),
        approvalDeadline: formatDate(row.approvalDeadline),
        status: formatEnumLabel(row.status),
      },
    })),
  });
}

export function buildHrPerformanceAppraisalsReviewsListSurface(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  cycles: readonly HrPerCycleInput[];
  rows: readonly HrPerformanceReviewRecord[];
  searchValue?: string;
}) {
  const cycleById = new Map(input.cycles.map((cycle) => [cycle.id, cycle]));
  const copy = hrPerformanceAppraisalsUiCopy.reviews;
  return buildPerformanceListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "employeeDisplayName",
    searchParam: hrPerformanceAppraisalsReviewsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search employee reviews",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      {
        id: "employeeDisplayName",
        header: "Employee",
        priority: "primary",
        cellKind: { kind: "text" },
      },
      { id: "cycleName", header: "Cycle", cellKind: { kind: "text" } },
      {
        id: "managerDisplayName",
        header: "Manager",
        cellKind: { kind: "text" },
      },
      {
        id: "departmentName",
        header: "Department",
        cellKind: { kind: "text" },
      },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "finalRating", header: "Rating", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/performance-appraisals/reviews/${row.id}`,
      cells: {
        employeeDisplayName: row.employeeDisplayName,
        cycleName: cycleById.get(row.cycleId)?.name ?? row.cycleId,
        managerDisplayName: row.managerDisplayName ?? "Unassigned",
        departmentName: row.departmentName,
        status: formatEnumLabel(row.status),
        finalRating: row.outcome?.finalRating ?? "Pending",
      },
    })),
  });
}

export function buildHrPerformanceAppraisalsGoalsListSurface(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  rows: readonly HrPerformanceReviewRecord[];
  searchValue?: string;
}) {
  const copy = hrPerformanceAppraisalsUiCopy.goals;
  const goals = input.rows.flatMap((review) =>
    review.goals.map((goal) => ({
      ...goal,
      employeeDisplayName: review.employeeDisplayName,
    })),
  );
  return buildPerformanceListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "title",
    searchParam: hrPerformanceAppraisalsGoalsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search goals",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: goals },
    columns: [
      {
        id: "employeeDisplayName",
        header: "Employee",
        cellKind: { kind: "text" },
      },
      {
        id: "title",
        header: "Goal",
        priority: "primary",
        cellKind: { kind: "text" },
      },
      { id: "target", header: "Target", cellKind: { kind: "text" } },
      { id: "weight", header: "Weight", cellKind: { kind: "text" } },
      { id: "progress", header: "Progress", cellKind: { kind: "text" } },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: goals.map((goal) => ({
      id: goal.id,
      cells: {
        employeeDisplayName: goal.employeeDisplayName,
        title: goal.title,
        target: goal.target,
        weight: formatPercent(goal.weight),
        progress: formatPercent(goal.progressPercent),
        status: formatEnumLabel(goal.status),
      },
    })),
  });
}

export function buildHrPerformanceAppraisalsApprovalsListSurface(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  rows: readonly HrPerformanceReviewRecord[];
  searchValue?: string;
}) {
  const copy = hrPerformanceAppraisalsUiCopy.approvals;
  const steps = input.rows.flatMap((review) =>
    review.approvalWorkflow.map((step) => ({
      ...step,
      employeeDisplayName: review.employeeDisplayName,
    })),
  );
  return buildPerformanceListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "employeeDisplayName",
    searchParam: hrPerformanceAppraisalsApprovalsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search approvals",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    presentationProfile: "erp-exception-table",
    window: { rows: steps },
    columns: [
      {
        id: "employeeDisplayName",
        header: "Employee",
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "role",
        header: "Step",
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "sequence", header: "Order", cellKind: { kind: "text" } },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "decidedAt", header: "Decided", cellKind: { kind: "text" } },
    ],
    rows: steps.map((step) => ({
      id: step.id,
      cells: {
        employeeDisplayName: step.employeeDisplayName,
        role: formatEnumLabel(step.role),
        sequence: String(step.sequence),
        status: formatEnumLabel(step.status),
        decidedAt: step.decidedAt ? formatDate(step.decidedAt) : "Pending",
      },
    })),
  });
}

export function buildHrPerformanceAppraisalsOutcomesListSurface(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  rows: readonly HrPerformanceReviewRecord[];
  searchValue?: string;
}) {
  const copy = hrPerformanceAppraisalsUiCopy.outcomes;
  const outcomes = input.rows.filter((review) => review.outcome);
  return buildPerformanceListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "employeeDisplayName",
    searchParam: hrPerformanceAppraisalsOutcomesSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search outcomes",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: outcomes },
    columns: [
      {
        id: "employeeDisplayName",
        header: "Employee",
        priority: "primary",
        cellKind: { kind: "text" },
      },
      { id: "finalRating", header: "Rating", cellKind: { kind: "text" } },
      {
        id: "performanceCategory",
        header: "Outcome",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "promotionRecommended",
        header: "Promotion",
        cellKind: { kind: "text" },
      },
      {
        id: "compensationReviewRecommended",
        header: "Comp review",
        cellKind: { kind: "text" },
      },
      { id: "finalizedAt", header: "Finalized", cellKind: { kind: "text" } },
    ],
    rows: outcomes.map((review) => ({
      id: review.id,
      cells: {
        employeeDisplayName: review.employeeDisplayName,
        finalRating: review.outcome?.finalRating ?? "",
        performanceCategory: review.outcome
          ? formatEnumLabel(review.outcome.performanceCategory)
          : "",
        promotionRecommended: review.outcome?.promotionRecommended
          ? "Yes"
          : "No",
        compensationReviewRecommended: review.outcome
          ?.compensationReviewRecommended
          ? "Yes"
          : "No",
        finalizedAt: review.finalizedAt
          ? formatDate(review.finalizedAt)
          : "Pending",
      },
    })),
  });
}

export function buildHrPerformanceAppraisalsReportsListSurface(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  rows: readonly HrPerformanceReportRow[];
  searchValue?: string;
}) {
  const copy = hrPerformanceAppraisalsUiCopy.reports;
  return buildPerformanceListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "groupLabel",
    searchParam: hrPerformanceAppraisalsReportsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search report rows",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      {
        id: "groupLabel",
        header: "Group",
        priority: "primary",
        cellKind: { kind: "text" },
      },
      { id: "reviewCount", header: "Reviews", cellKind: { kind: "text" } },
      { id: "finalizedCount", header: "Finalized", cellKind: { kind: "text" } },
      { id: "overdueCount", header: "Overdue", cellKind: { kind: "text" } },
      {
        id: "averageFinalRating",
        header: "Avg rating",
        cellKind: { kind: "text" },
      },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        groupLabel: row.groupLabel,
        reviewCount: String(row.reviewCount),
        finalizedCount: String(row.finalizedCount),
        overdueCount: String(row.overdueCount),
        averageFinalRating: row.averageFinalRating ?? "N/A",
      },
    })),
  });
}

export function buildHrPerformanceAppraisalsAuditTrailListSurface(input: {
  surfaceKey: HrPerformanceAppraisalsListSurfaceKey;
  rows: readonly HrPerformanceAuditEvent[];
  searchValue?: string;
}) {
  const copy = hrPerformanceAppraisalsUiCopy.audit;
  return buildPerformanceListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "summary",
    searchParam: hrPerformanceAppraisalsAuditTrailSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search audit events",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    presentationProfile: "erp-audit-ledger",
    window: { rows: input.rows },
    columns: [
      {
        id: "action",
        header: "Action",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "summary",
        header: "Summary",
        priority: "primary",
        cellKind: { kind: "text" },
      },
      { id: "actorId", header: "Actor", cellKind: { kind: "text" } },
      { id: "occurredAt", header: "When", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action,
        summary: row.summary,
        actorId: row.actorId,
        occurredAt: formatDate(row.occurredAt),
      },
    })),
  });
}
