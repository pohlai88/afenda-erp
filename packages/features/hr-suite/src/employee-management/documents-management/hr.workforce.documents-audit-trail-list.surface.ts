import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
  formatDocumentsListEnumCell,
} from "./hr.workforce.documents-list.shared";
export const hrDocumentsAuditTrailSearchParam = "documentsAuditTrailSearch";
import { hrDocumentsAuditTrailColumnsId } from "./hr.workforce.documents-surface-columns.shared";
import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export type HrDocumentAuditTrailRow = {
  id: string;
  occurredAt: Date;
  action: string;
  actorUserId: string | null;
  summary: string;
  documentId: string | null;
  employeeId: string | null;
};

export type HrDocumentAuditTrailWindow = {
  rows: readonly HrDocumentAuditTrailRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export const hrDocumentsAuditTrailSurfaceKey =
  "hr.workforce.documents.audit-trail.list";

export function buildHrDocumentsAuditTrailListSurface(input: {
  window: HrDocumentAuditTrailWindow;
  searchValue?: string;
}) {
  const copy = hrDocumentsUiCopy.auditTrail;

  return buildDocumentsOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildDocumentsListSearchToolbar({
      param: hrDocumentsAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrDocumentsAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "occurredAt",
        header: copy.colOccurredAt,
        pin: "start",
        minWidth: 160,
        cellKind: { kind: "date" },
      },
      {
        id: "action",
        header: copy.colAction,
        priority: "primary",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "actor",
        header: copy.colActor,
        cellKind: { kind: "text" },
      },
      {
        id: "target",
        header: copy.colTarget,
        cellKind: { kind: "text" },
      },
      {
        id: "summary",
        header: copy.colSummary,
        cellKind: { kind: "text" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        occurredAt: row.occurredAt.toISOString(),
        action: formatDocumentsListEnumCell(row.action.replace(/^hr\.document\./, "")),
        actor: row.actorUserId ?? "System",
        target: row.documentId ?? row.employeeId ?? "—",
        summary: row.summary,
        documentIdValue: row.documentId ?? "",
        employeeIdValue: row.employeeId ?? "",
      },
    })),
  });
}
