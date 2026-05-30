import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
} from "./hr.workforce.documents-list.shared";
export const hrDocumentsRetentionSearchParam = "documentsRetentionSearch";
import { hrDocumentsRetentionColumnsId } from "./hr.workforce.documents-surface-columns.shared";
import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export type HrDocumentRetentionPolicyRow = {
  id: string;
  documentType: string | null;
  documentGroup: string | null;
  retentionDays: number;
  archiveOnSeparation: boolean;
};

export type HrDocumentRetentionPolicyWindow = {
  rows: readonly HrDocumentRetentionPolicyRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export const hrDocumentsRetentionSurfaceKey =
  "hr.workforce.documents.retention.list";

export function buildHrDocumentsRetentionListSurface(input: {
  window: HrDocumentRetentionPolicyWindow;
  searchValue?: string;
  canWrite?: boolean;
}) {
  const copy = hrDocumentsUiCopy.retention;

  return buildDocumentsOperationalListSurface({
    primaryColumnId: "documentType",
    searchToolbar: buildDocumentsListSearchToolbar({
      param: hrDocumentsRetentionSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrDocumentsRetentionColumnsId,
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
        id: "documentGroup",
        header: copy.colGroup,
        cellKind: { kind: "text" },
      },
      {
        id: "retentionDays",
        header: copy.colRetentionDays,
        cellKind: { kind: "text" },
      },
      {
        id: "archiveOnSeparation",
        header: copy.colArchiveOnSeparation,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        documentType: row.documentType ?? "All types",
        documentGroup: row.documentGroup ?? "All groups",
        retentionDays: String(row.retentionDays),
        archiveOnSeparation: row.archiveOnSeparation ? "Yes" : "No",
        documentTypeValue: row.documentType ?? "",
        documentGroupValue: row.documentGroup ?? "",
        retentionDaysValue: String(row.retentionDays),
        archiveOnSeparationValue: row.archiveOnSeparation ? "true" : "false",
      },
      trailingAction: undefined,
    })),
  });
}
