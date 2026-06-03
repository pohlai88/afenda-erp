import {
  hrBenefitsAuditTrailSearchParam,
  hrBenefitsAuditTrailSurfaceKey,
} from "./hr.payroll.benefits-search-params.parse.shared";
import {
  buildBenefitsListSearchToolbar,
  buildBenefitsOperationalListSurface,
} from "./hr.payroll.benefits-list.shared";
import { hrBenefitsAuditTrailColumnsId } from "./hr.payroll.benefits-surface-columns.shared";
import { hrBenefitsUiCopy } from "./hr.payroll.benefits-ui.copy.shared";

export { hrBenefitsAuditTrailSurfaceKey };

export function buildHrBenefitsAuditTrailListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      action: string;
      summary: string;
      occurredAt: string | Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBenefitsUiCopy.auditTrail;

  return buildBenefitsOperationalListSurface({
    primaryColumnId: "summary",
    searchToolbar: buildBenefitsListSearchToolbar({
      param: hrBenefitsAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBenefitsAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "action", header: copy.colAction, cellKind: { kind: "text" } },
      { id: "summary", header: copy.colSummary, pin: "start", minWidth: 220, cellKind: { kind: "text" } },
      { id: "occurredAt", header: copy.colOccurredAt, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action,
        summary: row.summary,
        occurredAt:
          row.occurredAt instanceof Date
            ? row.occurredAt.toISOString()
            : row.occurredAt,
      },
    })),
  });
}
