import type { HrEmployeeRecordEventsWindow } from "@afenda/db";

import {
  buildRecordsListSearchToolbar,
  buildRecordsOperationalListSurface,
  formatRecordsEventKindLabel,
} from "./hr.workforce.records-list.shared";
import { hrEmployeeDetailRoutePath } from "./hr.workforce.records-route.contract";
import { hrRecordsAuditTrailColumnsId } from "./hr.workforce.records-surface-columns.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export const hrRecordsAuditTrailSurfaceKey =
  "hr.workforce.records.audit-trail.list";

export const hrRecordsAuditTrailSearchParam = "recordsAuditTrailSearch";

export function buildHrRecordsAuditTrailListSurface(input: {
  window: HrEmployeeRecordEventsWindow;
  searchValue?: string;
  linkEmployees?: boolean;
}): ReturnType<typeof buildRecordsOperationalListSurface> {
  const copy = hrRecordsUiCopy.auditTrail;
  const linkEmployees = input.linkEmployees ?? true;

  return buildRecordsOperationalListSurface({
    primaryColumnId: "effectiveDate",
    searchToolbar: buildRecordsListSearchToolbar({
      param: hrRecordsAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrRecordsAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "effectiveDate",
        header: copy.colEffective,
        pin: "start",
        cellKind: { kind: "date" },
        minWidth: 160,
      },
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        wrap: true,
        minWidth: 180,
      },
      {
        id: "kind",
        header: copy.colKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "field",
        header: copy.colField,
        wrap: true,
        minWidth: 120,
      },
      {
        id: "change",
        header: copy.colChange,
        wrap: true,
        minWidth: 200,
      },
      {
        id: "reason",
        header: copy.colReason,
        wrap: true,
        minWidth: 160,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        effectiveDate: row.effectiveDate.toISOString(),
        employee: `${row.employeeNumber} · ${row.displayName}`,
        kind: formatRecordsEventKindLabel(row.kind),
        field: row.fieldName ?? "—",
        change: row.newValue ?? row.previousValue ?? "—",
        reason: row.reason ?? "",
      },
      ...(linkEmployees
        ? { rowHref: hrEmployeeDetailRoutePath(row.employeeId) }
        : {}),
    })),
  });
}
