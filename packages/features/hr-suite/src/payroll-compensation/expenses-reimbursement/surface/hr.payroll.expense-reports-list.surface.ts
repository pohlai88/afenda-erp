import type { HrExpenseReportRow } from "../data/hr.payroll.expense-store.shared";
import {
  hrExpenseReportsSearchParam,
  hrExpenseReportsSurfaceKey,
} from "../data/hr.payroll.expense-search-params.parse.shared";
import {
  buildExpenseListSearchToolbar,
  buildExpenseOperationalListSurface,
} from "./hr.payroll.expense-list.shared";
import { hrExpenseReportsColumnsId } from "./hr.payroll.expense-surface-columns.shared";
import { hrExpenseUiCopy } from "./hr.payroll.expense-ui.copy.shared";
import { formatExpenseEnumLabel } from "../schemas/hr.payroll.expense-form.shared";

export { hrExpenseReportsSurfaceKey, hrExpenseReportsSearchParam };

export type HrExpenseReportsWindow = {
  rows: HrExpenseReportRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrExpenseReportsListSurface(input: {
  window: HrExpenseReportsWindow;
  searchValue?: string;
}) {
  const copy = hrExpenseUiCopy.reports;
  const { window, searchValue } = input;

  return buildExpenseOperationalListSurface({
    primaryColumnId: "period",
    searchToolbar: buildExpenseListSearchToolbar({
      param: hrExpenseReportsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrExpenseReportsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "period",
        header: copy.colPeriod,
        pin: "start",
        minWidth: 100,
        cellKind: { kind: "text" },
      },
      { id: "department", header: copy.colDepartment, cellKind: { kind: "text" } },
      {
        id: "category",
        header: copy.colCategory,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "claimCount", header: copy.colCount, cellKind: { kind: "text" } },
      { id: "total", header: copy.colTotal, cellKind: { kind: "text" } },
      { id: "currency", header: copy.colCurrency, cellKind: { kind: "text" } },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        period: row.periodLabel,
        department: row.department,
        category: formatExpenseEnumLabel(row.category),
        status: formatExpenseEnumLabel(row.status),
        claimCount: String(row.claimCount),
        total: row.totalAmount,
        currency: row.currencyCode,
      },
    })),
  });
}
