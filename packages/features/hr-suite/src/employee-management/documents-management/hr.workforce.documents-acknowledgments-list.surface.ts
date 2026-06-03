import { hrEmployeeDetailRoutePath } from "./hr.workforce.documents-route.contract";
export const hrDocumentsAcknowledgmentsSearchParam =
  "documentsAcknowledgmentsSearch";
import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
  formatDocumentsEmployeeListCell,
} from "./hr.workforce.documents-list.shared";
import { hrDocumentsAcknowledgmentsColumnsId } from "./hr.workforce.documents-surface-columns.shared";
import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export type HrDocumentAcknowledgmentRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  policyKey: string;
  policyVersion: string;
  acknowledgmentMethod: string;
  acknowledgedAt: Date;
};

export type HrDocumentAcknowledgmentWindow = {
  rows: readonly HrDocumentAcknowledgmentRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export const hrDocumentsAcknowledgmentsSurfaceKey =
  "hr.workforce.documents.acknowledgments.list";

export function buildHrDocumentsAcknowledgmentsListSurface(input: {
  window: HrDocumentAcknowledgmentWindow;
  searchValue?: string;
}) {
  const copy = hrDocumentsUiCopy.acknowledgments;

  return buildDocumentsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildDocumentsListSearchToolbar({
      param: hrDocumentsAcknowledgmentsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrDocumentsAcknowledgmentsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "link" },
      },
      {
        id: "policyKey",
        header: copy.colPolicy,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "policyVersion",
        header: copy.colVersion,
        cellKind: { kind: "text" },
      },
      {
        id: "acknowledgedAt",
        header: copy.colAcknowledgedAt,
        cellKind: { kind: "date" },
      },
      {
        id: "acknowledgmentMethod",
        header: copy.colMethod,
        cellKind: { kind: "text" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: hrEmployeeDetailRoutePath(row.employeeId),
      linkColumnId: "employee",
      cells: {
        employee: formatDocumentsEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        policyKey: row.policyKey,
        policyVersion: row.policyVersion,
        acknowledgedAt: row.acknowledgedAt.toISOString(),
        acknowledgmentMethod: row.acknowledgmentMethod,
        employeeIdValue: row.employeeId,
      },
    })),
  });
}
