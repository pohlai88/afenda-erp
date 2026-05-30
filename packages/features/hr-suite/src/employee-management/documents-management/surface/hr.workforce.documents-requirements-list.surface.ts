import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
  formatDocumentsListEnumCell,
} from "./hr.workforce.documents-list.shared";
export const hrDocumentsRequirementsSearchParam = "documentsRequirementsSearch";
import { hrDocumentsRequirementsColumnsId } from "./hr.workforce.documents-surface-columns.shared";
import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export type HrDocumentRequirementRow = {
  id: string;
  documentType: string;
  title: string;
  requiredForStatus: string | null;
  graceDaysBeforeDue: number;
};

export type HrDocumentRequirementWindow = {
  rows: readonly HrDocumentRequirementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export const hrDocumentsRequirementsSurfaceKey =
  "hr.workforce.documents.requirements.list";

export function buildHrDocumentsRequirementsListSurface(input: {
  window: HrDocumentRequirementWindow;
  searchValue?: string;
  canWrite?: boolean;
}) {
  const copy = hrDocumentsUiCopy.requirements;

  return buildDocumentsOperationalListSurface({
    primaryColumnId: "documentType",
    searchToolbar: buildDocumentsListSearchToolbar({
      param: hrDocumentsRequirementsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrDocumentsRequirementsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "documentType",
        header: copy.colType,
        pin: "start",
        minWidth: 160,
        cellKind: { kind: "text" },
      },
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "requiredForStatus",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "graceDaysBeforeDue",
        header: copy.colGraceDays,
        cellKind: { kind: "text" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        documentType: row.documentType,
        title: row.title,
        requiredForStatus: row.requiredForStatus
          ? formatDocumentsListEnumCell(row.requiredForStatus)
          : "All active",
        graceDaysBeforeDue: String(row.graceDaysBeforeDue),
        documentTypeValue: row.documentType,
        titleValue: row.title,
        requiredForStatusValue: row.requiredForStatus ?? "",
        graceDaysBeforeDueValue: String(row.graceDaysBeforeDue),
      },
      trailingAction: undefined,
    })),
  });
}
