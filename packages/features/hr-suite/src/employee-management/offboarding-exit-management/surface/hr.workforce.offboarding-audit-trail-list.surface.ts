import {
  buildOffboardingListSearchToolbar,
  buildOffboardingOperationalListSurface,
} from "./hr.workforce.offboarding-list.shared";
import { hrOffboardingAuditTrailColumnsId } from "./hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export const hrOffboardingAuditTrailSurfaceKey =
  "hr.workforce.offboarding.audit-trail.list";

export const hrOffboardingAuditTrailSearchParam = "offboardingAuditTrailSearch";

export type HrOffboardingAuditTrailWindow = {
  rows: readonly {
    id: string;
    caseId: string | null;
    employeeId: string | null;
    action: string;
    actorUserId: string | null;
    summary: string;
    occurredAt: Date;
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrOffboardingAuditTrailListSurface(input: {
  window: HrOffboardingAuditTrailWindow;
  searchValue?: string;
}) {
  const copy = hrOffboardingUiCopy.auditTrail;

  return buildOffboardingOperationalListSurface({
    primaryColumnId: "summary",
    searchToolbar: buildOffboardingListSearchToolbar({
      param: hrOffboardingAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOffboardingAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "summary",
        header: "Summary",
        priority: "primary",
        wrap: true,
        minWidth: 240,
      },
      {
        id: "action",
        header: "Action",
        cellKind: { kind: "text" },
        minWidth: 200,
      },
      {
        id: "occurredAt",
        header: "When",
        cellKind: { kind: "date" },
        minWidth: 160,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        summary: row.summary,
        action: row.action,
        occurredAt: row.occurredAt.toISOString(),
      },
    })),
  });
}
