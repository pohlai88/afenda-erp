import type { HrTimeClockAuditEventWindow } from "@afenda/db";

import { hrTimeClockAuditTrailColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockAuditTrailSurfaceKey =
  "hr.time.clock-integration.audit-trail.list";

export const hrTimeClockAuditTrailSearchParam = "timeClockAuditTrailSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEmployeeCell,
  formatTimeClockEnumCell,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export function buildHrTimeClockAuditTrailListSurface(input: {
  window: HrTimeClockAuditEventWindow;
  searchValue?: string;
}) {
  const copy = hrTimeClockUiCopy.auditTrail;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "occurred",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "occurred",
        header: copy.colOccurred,
        priority: "primary",
        cellKind: { kind: "date" },
      },
      { id: "action", header: copy.colAction },
      { id: "summary", header: copy.colSummary, wrap: true },
      { id: "device", header: copy.colDevice },
      { id: "employee", header: copy.colEmployee, wrap: true },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        occurred: row.occurredAt.toISOString(),
        action: formatTimeClockEnumCell(row.action),
        summary: row.summary,
        device: row.deviceName ?? "—",
        employee: formatTimeClockEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
      },
    })),
  });
}
