import { hrPayrollRunDetailRoutePath } from "./hr.payroll.processing-route.contract";
import {
  hrPayrollAssignmentsSearchParam,
  hrPayrollAssignmentsSurfaceKey,
  hrPayrollAuditSearchParam,
  hrPayrollAuditSurfaceKey,
  hrPayrollCyclesSearchParam,
  hrPayrollCyclesSurfaceKey,
  hrPayrollPayGroupsSearchParam,
  hrPayrollPayGroupsSurfaceKey,
  hrPayrollPaymentsSearchParam,
  hrPayrollPaymentsSurfaceKey,
  hrPayrollPayslipsSearchParam,
  hrPayrollPayslipsSurfaceKey,
  hrPayrollRunsSearchParam,
  hrPayrollRunsSurfaceKey,
} from "./hr.payroll.processing-search-params.parse.shared";
import {
  buildPayrollListSearchToolbar,
  buildPayrollOperationalListSurface,
  formatPayrollEnumLabel,
} from "./hr.payroll.processing-list.shared";
import {
  hrPayrollAssignmentsColumnsId,
  hrPayrollAuditColumnsId,
  hrPayrollCyclesColumnsId,
  hrPayrollPayGroupsColumnsId,
  hrPayrollPaymentsColumnsId,
  hrPayrollPayslipsColumnsId,
  hrPayrollRunsColumnsId,
} from "./hr.payroll.processing-surface-columns.shared";
import { hrPayrollUiCopy } from "./hr.payroll.processing-ui.copy.shared";

export {
  hrPayrollCyclesSurfaceKey,
  hrPayrollPayGroupsSurfaceKey,
  hrPayrollAssignmentsSurfaceKey,
  hrPayrollRunsSurfaceKey,
  hrPayrollPayslipsSurfaceKey,
  hrPayrollPaymentsSurfaceKey,
  hrPayrollAuditSurfaceKey,
};

function formatMoney(value: string | number | null | undefined) {
  if (value == null) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildHrPayrollCyclesListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      cycleStatus: string;
      periodStartAt: Date;
      periodEndAt: Date;
      payDateAt: Date;
      currencyCode: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrPayrollUiCopy.cycles;
  return buildPayrollOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildPayrollListSearchToolbar({
      param: hrPayrollCyclesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrPayrollCyclesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, pin: "start", cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, priority: "primary", cellKind: { kind: "text" } },
      { id: "cycleStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "periodStartAt", header: copy.colPeriodStart, cellKind: { kind: "date" } },
      { id: "periodEndAt", header: copy.colPeriodEnd, cellKind: { kind: "date" } },
      { id: "payDateAt", header: copy.colPayDate, cellKind: { kind: "date" } },
      { id: "currencyCode", header: copy.colCurrency, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        cycleStatus: formatPayrollEnumLabel(row.cycleStatus),
        periodStartAt: row.periodStartAt.toISOString(),
        periodEndAt: row.periodEndAt.toISOString(),
        payDateAt: row.payDateAt.toISOString(),
        currencyCode: row.currencyCode,
      },
    })),
  });
}

export function buildHrPayrollPayGroupsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      paySchedule: string;
      payGroupStatus: string;
      currencyCode: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrPayrollUiCopy.payGroups;
  return buildPayrollOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildPayrollListSearchToolbar({
      param: hrPayrollPayGroupsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrPayrollPayGroupsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, priority: "primary", cellKind: { kind: "text" } },
      { id: "paySchedule", header: copy.colSchedule, cellKind: { kind: "badge", tone: "default" } },
      { id: "payGroupStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "currencyCode", header: copy.colCurrency, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        paySchedule: formatPayrollEnumLabel(row.paySchedule),
        payGroupStatus: formatPayrollEnumLabel(row.payGroupStatus),
        currencyCode: row.currencyCode,
      },
    })),
  });
}

export function buildHrPayrollAssignmentsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeId: string;
      employeeNumber: string;
      employeeName: string;
      assignmentStatus: string;
      effectiveFrom: Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrPayrollUiCopy.assignments;
  return buildPayrollOperationalListSurface({
    primaryColumnId: "employeeName",
    searchToolbar: buildPayrollListSearchToolbar({
      param: hrPayrollAssignmentsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrPayrollAssignmentsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employeeNumber", header: copy.colNumber, cellKind: { kind: "text" } },
      { id: "employeeName", header: copy.colEmployee, priority: "primary", cellKind: { kind: "text" } },
      { id: "assignmentStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employeeNumber: row.employeeNumber,
        employeeName: row.employeeName,
        assignmentStatus: formatPayrollEnumLabel(row.assignmentStatus),
        effectiveFrom: row.effectiveFrom.toISOString(),
      },
    })),
  });
}

export function buildHrPayrollRunsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      runNumber: number;
      runKind: string;
      runStatus: string;
      employeeCount: number;
      totalNetPay: string;
      finalizedAt: Date | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrPayrollUiCopy.runs;
  return buildPayrollOperationalListSurface({
    primaryColumnId: "runNumber",
    searchToolbar: buildPayrollListSearchToolbar({
      param: hrPayrollRunsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrPayrollRunsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "runNumber",
        header: copy.colRunNumber,
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "runKind", header: copy.colKind, cellKind: { kind: "badge", tone: "default" } },
      { id: "runStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "employeeCount", header: copy.colEmployees, cellKind: { kind: "text" } },
      { id: "totalNetPay", header: copy.colNetPay, cellKind: { kind: "text" } },
      { id: "finalizedAt", header: copy.colFinalized, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: hrPayrollRunDetailRoutePath(row.id),
      linkColumnId: "runNumber",
      cells: {
        runNumber: String(row.runNumber),
        runKind: formatPayrollEnumLabel(row.runKind),
        runStatus: formatPayrollEnumLabel(row.runStatus),
        employeeCount: String(row.employeeCount),
        totalNetPay: formatMoney(row.totalNetPay),
        finalizedAt: row.finalizedAt?.toISOString() ?? "",
      },
    })),
  });
}

export function buildHrPayrollPayslipsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      payslipNumber: string;
      employeeId: string;
      payslipStatus: string;
      netPay: string;
      essAccessible: boolean;
      finalizedAt: Date | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrPayrollUiCopy.payslips;
  return buildPayrollOperationalListSurface({
    primaryColumnId: "payslipNumber",
    searchToolbar: buildPayrollListSearchToolbar({
      param: hrPayrollPayslipsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrPayrollPayslipsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "payslipNumber", header: copy.colNumber, priority: "primary", cellKind: { kind: "text" } },
      { id: "employeeId", header: copy.colEmployee, cellKind: { kind: "text" } },
      { id: "payslipStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "netPay", header: copy.colNetPay, cellKind: { kind: "text" } },
      { id: "essAccessible", header: copy.colEss, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        payslipNumber: row.payslipNumber,
        employeeId: row.employeeId,
        payslipStatus: formatPayrollEnumLabel(row.payslipStatus),
        netPay: formatMoney(row.netPay),
        essAccessible: row.essAccessible ? "Yes" : "No",
      },
    })),
  });
}

export function buildHrPayrollPaymentsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      batchNumber: string;
      batchStatus: string;
      paymentCount: number;
      totalAmount: string;
      generatedAt: Date | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrPayrollUiCopy.payments;
  return buildPayrollOperationalListSurface({
    primaryColumnId: "batchNumber",
    searchToolbar: buildPayrollListSearchToolbar({
      param: hrPayrollPaymentsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrPayrollPaymentsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "batchNumber", header: copy.colBatch, priority: "primary", cellKind: { kind: "text" } },
      { id: "batchStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "paymentCount", header: copy.colCount, cellKind: { kind: "text" } },
      { id: "totalAmount", header: copy.colAmount, cellKind: { kind: "text" } },
      { id: "generatedAt", header: copy.colGenerated, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        batchNumber: row.batchNumber,
        batchStatus: formatPayrollEnumLabel(row.batchStatus),
        paymentCount: String(row.paymentCount),
        totalAmount: formatMoney(row.totalAmount),
        generatedAt: row.generatedAt?.toISOString() ?? "",
      },
    })),
  });
}

export function buildHrPayrollAuditListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      action: string;
      summary: string | null;
      occurredAt: Date;
      actorUserId: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrPayrollUiCopy.audit;
  return buildPayrollOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildPayrollListSearchToolbar({
      param: hrPayrollAuditSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrPayrollAuditColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "action", header: copy.colAction, priority: "primary", cellKind: { kind: "text" } },
      { id: "summary", header: copy.colSummary, cellKind: { kind: "text" } },
      { id: "occurredAt", header: copy.colOccurred, cellKind: { kind: "date" } },
      { id: "actorUserId", header: copy.colActor, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action,
        summary: row.summary ?? "—",
        occurredAt: row.occurredAt.toISOString(),
        actorUserId: row.actorUserId,
      },
    })),
  });
}
