import type { HrExpenseClaimRecord } from "../schemas/hr.payroll.expense-claim.schema";
import {
  hrExpenseClaimsSearchParam,
  hrExpenseClaimsSurfaceKey,
} from "../data/hr.payroll.expense-search-params.parse.shared";
import {
  buildExpenseListSearchToolbar,
  buildExpenseOperationalListSurface,
  formatExpenseFlagsCell,
  formatExpenseStatusCell,
  resolveExpenseClaimTrailingAction,
  resolveExpenseStatusBadgeTone,
} from "./hr.payroll.expense-list.shared";
import { hrExpenseClaimsColumnsId } from "./hr.payroll.expense-surface-columns.shared";
import { hrExpenseUiCopy } from "./hr.payroll.expense-ui.copy.shared";
import { formatExpenseEnumLabel } from "../schemas/hr.payroll.expense-form.shared";

export { hrExpenseClaimsSurfaceKey, hrExpenseClaimsSearchParam };

export type HrExpenseClaimsWindow = {
  rows: HrExpenseClaimRecord[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrExpenseClaimsListSurface(input: {
  window: HrExpenseClaimsWindow;
  searchValue?: string;
  canApprove?: boolean;
  canWrite?: boolean;
}) {
  const copy = hrExpenseUiCopy.claims;
  const { window, searchValue, canApprove = false, canWrite = false } = input;

  return buildExpenseOperationalListSurface({
    primaryColumnId: "reference",
    searchToolbar: buildExpenseListSearchToolbar({
      param: hrExpenseClaimsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrExpenseClaimsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "reference",
        header: copy.colReference,
        pin: "start",
        minWidth: 120,
        cellKind: { kind: "text" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        minWidth: 160,
        cellKind: { kind: "text" },
      },
      {
        id: "expenseDate",
        header: copy.colDate,
        cellKind: { kind: "date" },
      },
      {
        id: "category",
        header: copy.colCategory,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "amount",
        header: copy.colAmount,
        cellKind: { kind: "text" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "flags",
        header: copy.colFlags,
        cellKind: { kind: "text" },
      },
      {
        id: "reimbursable",
        header: copy.colReimbursable,
        cellKind: { kind: "text" },
      },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        reference: row.claimReference,
        employee: `${row.employeeDisplayName} (${row.employeeNumber})`,
        expenseDate: row.expenseDate,
        category: formatExpenseEnumLabel(row.category),
        amount: `${row.amount.toFixed(2)} ${row.currencyCode}`,
        status: formatExpenseStatusCell(row.status),
        flags: formatExpenseFlagsCell(row),
        reimbursable: `${row.reimbursableAmount.toFixed(2)} ${row.currencyCode}`,
        statusValue: row.status,
        employeeIdValue: row.employeeId,
        claimReferenceValue: row.claimReference,
      },
      cellKinds: {
        status: {
          kind: "badge",
          tone: resolveExpenseStatusBadgeTone(row.status),
        },
        category: { kind: "badge", tone: "default" },
      },
      trailingAction: resolveExpenseClaimTrailingAction({
        canApprove,
        canWrite,
        status: row.status,
      }),
    })),
  });
}
