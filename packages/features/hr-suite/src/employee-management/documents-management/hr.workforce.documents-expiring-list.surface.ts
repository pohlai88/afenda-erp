import type { HrEmployeeDocumentWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "./hr.workforce.documents-route.contract";
import {
  deriveHrDocumentExpiryPosture,
} from "./hr.workforce.documents-status.shared";
import { maskHrDocumentSensitiveText } from "./hr.workforce.documents-sensitive-access.shared";
export const hrDocumentsExpiringSearchParam = "documentsExpiringSearch";
import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
  formatDocumentsEmployeeListCell,
  formatDocumentsListEnumCell,
  resolveDocumentsExpiryPostureBadgeTone,
} from "./hr.workforce.documents-list.shared";
import { hrDocumentsExpiringColumnsId } from "./hr.workforce.documents-surface-columns.shared";
import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export const hrDocumentsExpiringSurfaceKey =
  "hr.workforce.documents.expiring.list";

export function buildHrDocumentsExpiringListSurface(input: {
  window: HrEmployeeDocumentWindow;
  searchValue?: string;
  canViewSensitive?: boolean;
}) {
  const copy = hrDocumentsUiCopy.expiring;
  const canViewSensitive = input.canViewSensitive ?? false;

  return buildDocumentsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildDocumentsListSearchToolbar({
      param: hrDocumentsExpiringSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrDocumentsExpiringColumnsId,
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
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "documentType",
        header: copy.colType,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "effectiveTo",
        header: copy.colExpiry,
        cellKind: { kind: "date" },
      },
      {
        id: "posture",
        header: copy.colPosture,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: input.window.rows.map((row) => {
      const posture = deriveHrDocumentExpiryPosture({
        effectiveTo: row.effectiveTo,
      });

      return {
        id: row.id,
        rowHref: hrEmployeeDetailRoutePath(row.employeeId),
        linkColumnId: "employee",
        rowTone: posture === "expired" ? ("critical" as const) : posture === "expiring" ? ("attention" as const) : ("default" as const),
        cells: {
          employee: formatDocumentsEmployeeListCell({
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
          }),
          title: maskHrDocumentSensitiveText(row.title, canViewSensitive),
          documentType: formatDocumentsListEnumCell(row.documentType),
          effectiveTo: row.effectiveTo?.toISOString() ?? "",
          posture: formatDocumentsListEnumCell(posture),
          postureValue: posture,
          employeeIdValue: row.employeeId,
        },
        cellKinds: {
          posture: {
            kind: "badge",
            tone: resolveDocumentsExpiryPostureBadgeTone(posture),
          },
        },
      };
    }),
  });
}
