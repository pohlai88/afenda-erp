import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import { hrCpmCycleDetailRoutePath } from "./hr.payroll.cpm-route.contract";
import {
  hrCpmAuditSearchParam,
  hrCpmAuditSurfaceKey,
  hrCpmCyclesSearchParam,
  hrCpmCyclesSurfaceKey,
  hrCpmParticipantsSearchParam,
  hrCpmParticipantsSurfaceKey,
  hrCpmRecommendationsSearchParam,
  hrCpmRecommendationsSurfaceKey,
  hrCpmReportsSearchParam,
  hrCpmReportsSurfaceKey,
} from "./hr.payroll.cpm-search-params.parse.shared";
import {
  buildCpmListSearchToolbar,
  buildCpmOperationalListSurface,
  formatCpmEnumLabel,
} from "./hr.payroll.cpm-list.shared";
import {
  hrCpmAuditColumnsId,
  hrCpmCyclesColumnsId,
  hrCpmParticipantsColumnsId,
  hrCpmRecommendationsColumnsId,
  hrCpmReportsColumnsId,
} from "./hr.payroll.cpm-surface-columns.shared";
import { hrCpmUiCopy } from "./hr.payroll.cpm-ui.copy.shared";

export {
  hrCpmCyclesSurfaceKey,
  hrCpmParticipantsSurfaceKey,
  hrCpmRecommendationsSurfaceKey,
  hrCpmReportsSurfaceKey,
  hrCpmAuditSurfaceKey,
};

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildHrCpmCyclesListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      code: string;
      name: string;
      cycleType: string;
      cycleStatus: string;
      effectiveDate: Date;
      currencyCode: string;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrCpmUiCopy.cycles;
  return buildCpmOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildCpmListSearchToolbar({
      param: hrCpmCyclesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCpmCyclesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "code",
        header: copy.colCode,
        pin: "start",
        minWidth: 120,
        cellKind: { kind: "link" },
      },
      { id: "name", header: copy.colName, priority: "primary", cellKind: { kind: "text" } },
      { id: "cycleType", header: copy.colType, cellKind: { kind: "badge", tone: "default" } },
      { id: "cycleStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "effectiveDate", header: copy.colEffective, cellKind: { kind: "date" } },
      { id: "currencyCode", header: copy.colCurrency, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: hrCpmCycleDetailRoutePath(row.id),
      linkColumnId: "code",
      cells: {
        code: row.code,
        name: row.name,
        cycleType: formatCpmEnumLabel(row.cycleType),
        cycleStatus: formatCpmEnumLabel(row.cycleStatus),
        effectiveDate: row.effectiveDate.toISOString(),
        currencyCode: row.currencyCode,
      },
    })),
  });
}

export function buildHrCpmParticipantsListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      employeeNumber: string;
      employeeName: string;
      eligibilityStatus: string;
      currentSalary: number | null;
      currentGrade: string | null;
      legalEntityCode: string | null;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrCpmUiCopy.participants;
  return buildCpmOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildCpmListSearchToolbar({
      param: hrCpmParticipantsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCpmParticipantsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", minWidth: 200, cellKind: { kind: "text" } },
      { id: "eligibilityStatus", header: copy.colEligibility, cellKind: { kind: "badge", tone: "default" } },
      { id: "currentSalary", header: copy.colSalary, cellKind: { kind: "text" } },
      { id: "currentGrade", header: copy.colGrade, cellKind: { kind: "text" } },
      { id: "legalEntityCode", header: copy.colEntity, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} — ${row.employeeName}`,
        eligibilityStatus: formatCpmEnumLabel(row.eligibilityStatus),
        currentSalary: formatMoney(row.currentSalary),
        currentGrade: row.currentGrade ?? "—",
        legalEntityCode: row.legalEntityCode ?? "—",
      },
    })),
  });
}

export function buildHrCpmRecommendationsListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      employeeNumber: string;
      employeeName: string;
      adjustmentType: string;
      recommendationStatus: string;
      currentSalary: number;
      proposedSalary: number;
      overBudget: boolean;
      bandFlag: string | null;
      lockedAt?: Date | null;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
  canWrite?: boolean;
  canApprove?: boolean;
}) {
  const copy = hrCpmUiCopy.recommendations;
  const canWrite = input.canWrite ?? false;
  const canApprove = input.canApprove ?? false;

  return buildCpmOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildCpmListSearchToolbar({
      param: hrCpmRecommendationsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCpmRecommendationsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", minWidth: 200, cellKind: { kind: "text" } },
      { id: "adjustmentType", header: copy.colType, cellKind: { kind: "badge", tone: "default" } },
      { id: "recommendationStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "currentSalary", header: copy.colCurrent, cellKind: { kind: "text" } },
      { id: "proposedSalary", header: copy.colProposed, cellKind: { kind: "text" } },
      { id: "flags", header: copy.colFlags, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => {
      const flags = [
        row.overBudget ? "Over budget" : null,
        row.bandFlag ? formatCpmEnumLabel(row.bandFlag) : null,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: row.id,
        cells: {
          employee: `${row.employeeNumber} — ${row.employeeName}`,
          adjustmentType: formatCpmEnumLabel(row.adjustmentType),
          recommendationStatus: row.recommendationStatus,
          currentSalary: formatMoney(row.currentSalary),
          proposedSalary: formatMoney(row.proposedSalary),
          flags: flags || "—",
          lockedAt: row.lockedAt?.toISOString() ?? "",
          canSubmitCpm: canWrite ? "true" : "false",
          canReviewCpm: canApprove ? "true" : "false",
          canFinalizeCpm: canApprove ? "true" : "false",
        },
        trailingAction:
          canWrite || canApprove
            ? resolveListSurfaceRowTrailingAction({
                allowed: true,
                descriptor: {
                  id: "cpm-recommendation-workflow",
                  label: "Manage recommendation",
                  intent: "approval",
                },
              })
            : undefined,
      };
    }),
  });
}

export function buildHrCpmReportsListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      cycleId: string;
      departmentId: string | null;
      managerEmployeeId: string | null;
      legalEntityCode: string | null;
      grade: string | null;
      budgetPoolId: string | null;
      recommendationStatus: string;
      count: number;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrCpmUiCopy.reports;
  return buildCpmOperationalListSurface({
    primaryColumnId: "recommendationStatus",
    searchToolbar: buildCpmListSearchToolbar({
      param: hrCpmReportsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCpmReportsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "cycleId", header: copy.colCycle, cellKind: { kind: "text" } },
      { id: "departmentId", header: copy.colDepartment, cellKind: { kind: "text" } },
      { id: "managerEmployeeId", header: copy.colManager, cellKind: { kind: "text" } },
      { id: "legalEntityCode", header: copy.colEntity, cellKind: { kind: "text" } },
      { id: "grade", header: copy.colGrade, cellKind: { kind: "text" } },
      { id: "budgetPoolId", header: copy.colPool, cellKind: { kind: "text" } },
      {
        id: "recommendationStatus",
        header: copy.colStatus,
        priority: "primary",
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "count", header: copy.colCount, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        cycleId: row.cycleId,
        departmentId: row.departmentId ?? "—",
        managerEmployeeId: row.managerEmployeeId ?? "—",
        legalEntityCode: row.legalEntityCode ?? "—",
        grade: row.grade ?? "—",
        budgetPoolId: row.budgetPoolId ?? "—",
        recommendationStatus: formatCpmEnumLabel(row.recommendationStatus),
        count: String(row.count),
      },
    })),
  });
}

export function buildHrCpmAuditListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      action: string;
      summary: string | null;
      occurredAt: Date;
      actorUserId: string;
      cycleId: string | null;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrCpmUiCopy.audit;
  return buildCpmOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildCpmListSearchToolbar({
      param: hrCpmAuditSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCpmAuditColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "occurredAt", header: copy.colOccurred, pin: "start", cellKind: { kind: "date" } },
      { id: "action", header: copy.colAction, priority: "primary", cellKind: { kind: "text" } },
      { id: "summary", header: copy.colSummary, cellKind: { kind: "text" } },
      { id: "actorUserId", header: copy.colActor, cellKind: { kind: "text" } },
      { id: "cycleId", header: copy.colCycle, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        occurredAt: row.occurredAt.toISOString(),
        action: row.action,
        summary: row.summary ?? "—",
        actorUserId: row.actorUserId,
        cycleId: row.cycleId ?? "—",
      },
    })),
  });
}
