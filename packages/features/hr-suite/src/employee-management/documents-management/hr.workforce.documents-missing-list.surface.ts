import type { HrDocumentMissingMandatoryWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "./hr.workforce.documents-route.contract";
export const hrDocumentsMissingSearchParam = "documentsMissingSearch";
import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
  formatDocumentsEmployeeListCell,
  formatDocumentsListEnumCell,
} from "./hr.workforce.documents-list.shared";
import { hrDocumentsMissingColumnsId } from "./hr.workforce.documents-surface-columns.shared";
import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export const hrDocumentsMissingSurfaceKey =
  "hr.workforce.documents.missing.list";

export function buildHrDocumentsMissingListSurface(input: {
  window: HrDocumentMissingMandatoryWindow;
  searchValue?: string;
}) {
  const copy = hrDocumentsUiCopy.missing;

  return buildDocumentsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildDocumentsListSearchToolbar({
      param: hrDocumentsMissingSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrDocumentsMissingColumnsId,
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
        id: "requirement",
        header: copy.colRequirement,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "documentType",
        header: copy.colType,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "posture",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: hrEmployeeDetailRoutePath(row.employeeId),
      linkColumnId: "employee",
      rowTone: "attention" as const,
      cells: {
        employee: formatDocumentsEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        requirement: row.requirementTitle,
        documentType: formatDocumentsListEnumCell(row.documentType),
        posture: formatDocumentsListEnumCell(row.posture),
        employeeIdValue: row.employeeId,
      },
    })),
  });
}
