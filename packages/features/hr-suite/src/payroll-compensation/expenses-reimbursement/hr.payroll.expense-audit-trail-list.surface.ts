import type { HrExpenseAuditEvent } from "./hr.payroll.expense-store.shared";
import {
  hrExpenseAuditTrailSearchParam,
  hrExpenseAuditTrailSurfaceKey,
} from "./hr.payroll.expense-search-params.parse.shared";
import {
  buildExpenseListSearchToolbar,
  buildExpenseOperationalListSurface,
} from "./hr.payroll.expense-list.shared";
import { hrExpenseAuditTrailColumnsId } from "./hr.payroll.expense-surface-columns.shared";
import { hrExpenseUiCopy } from "./hr.payroll.expense-ui.copy.shared";

export { hrExpenseAuditTrailSurfaceKey, hrExpenseAuditTrailSearchParam };

export type HrExpenseAuditTrailWindow = {
  rows: HrExpenseAuditEvent[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrExpenseAuditTrailListSurface(input: {
  window: HrExpenseAuditTrailWindow;
  searchValue?: string;
}) {
  const copy = hrExpenseUiCopy.audit;
  const { window, searchValue } = input;

  return buildExpenseOperationalListSurface({
    primaryColumnId: "when",
    searchToolbar: buildExpenseListSearchToolbar({
      param: hrExpenseAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrExpenseAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "when",
        header: copy.colWhen,
        pin: "start",
        minWidth: 160,
        cellKind: { kind: "date" },
      },
      { id: "reference", header: copy.colReference, cellKind: { kind: "text" } },
      { id: "action", header: copy.colAction, cellKind: { kind: "text" } },
      { id: "actor", header: copy.colActor, cellKind: { kind: "text" } },
      { id: "detail", header: copy.colDetail, cellKind: { kind: "text" } },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        when: row.createdAt,
        reference: row.claimReference,
        action: row.action,
        actor: row.actorUserId,
        detail: row.detail,
      },
    })),
  });
}
