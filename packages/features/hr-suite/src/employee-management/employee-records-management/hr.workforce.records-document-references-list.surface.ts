import type { HrEmployeeDocumentReferencesWindow } from "@afenda/db";

import {
  buildRecordsListSearchToolbar,
  buildRecordsOperationalListSurface,
} from "./hr.workforce.records-list.shared";
import { hrEmployeeDetailRoutePath } from "./hr.workforce.records-route.contract";
import { hrRecordsDocumentReferencesColumnsId } from "./hr.workforce.records-surface-columns.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export const hrRecordsDocumentReferencesSurfaceKey =
  "hr.workforce.records.document-references.list";

export const hrRecordsDocumentReferencesSearchParam =
  "recordsDocumentReferencesSearch";

export function buildHrRecordsDocumentReferencesListSurface(input: {
  window: HrEmployeeDocumentReferencesWindow;
  searchValue?: string;
  linkEmployees?: boolean;
}): ReturnType<typeof buildRecordsOperationalListSurface> {
  const copy = hrRecordsUiCopy.documentReferences;
  const linkEmployees = input.linkEmployees ?? true;

  return buildRecordsOperationalListSurface({
    primaryColumnId: "title",
    searchToolbar: buildRecordsListSearchToolbar({
      param: hrRecordsDocumentReferencesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrRecordsDocumentReferencesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "employee",
        header: copy.colEmployee,
        wrap: true,
        minWidth: 180,
      },
      {
        id: "documentType",
        header: copy.colType,
        wrap: true,
        minWidth: 140,
      },
      {
        id: "verification",
        header: copy.colVerification,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "effectiveFrom",
        header: copy.colEffectiveFrom,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "effectiveTo",
        header: copy.colEffectiveTo,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        employee: `${row.employeeNumber} · ${row.employeeDisplayName}`,
        documentType: row.documentType,
        verification: row.verificationStatus,
        effectiveFrom: row.effectiveFrom.toISOString(),
        effectiveTo: row.effectiveTo?.toISOString() ?? "",
      },
      cellKinds: {
        verification: {
          kind: "badge",
          tone:
            row.verificationStatus === "verified"
              ? "default"
              : row.verificationStatus === "rejected"
                ? "attention"
                : "default",
        },
      },
      ...(linkEmployees
        ? { rowHref: hrEmployeeDetailRoutePath(row.employeeId) }
        : {}),
    })),
  });
}
