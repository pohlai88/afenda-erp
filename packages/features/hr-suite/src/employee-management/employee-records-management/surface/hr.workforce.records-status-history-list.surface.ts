import type { HrEmployeeStatusHistoryWindow } from "@afenda/db";

import {
  buildRecordsListSearchToolbar,
  buildRecordsOperationalListSurface,
  formatRecordsEmploymentStatusLabel,
  formatRecordsEventKindLabel,
} from "./hr.workforce.records-list.shared";
import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.records-route.contract";
import { hrRecordsStatusHistoryColumnsId } from "./hr.workforce.records-surface-columns.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export const hrRecordsStatusHistorySurfaceKey =
  "hr.workforce.records.status-history.list";

export const hrRecordsStatusHistorySearchParam = "recordsStatusHistorySearch";

export function buildHrRecordsStatusHistoryListSurface(input: {
  window: HrEmployeeStatusHistoryWindow;
  searchValue?: string;
  linkEmployees?: boolean;
}): ReturnType<typeof buildRecordsOperationalListSurface> {
  const copy = hrRecordsUiCopy.statusHistory;
  const linkEmployees = input.linkEmployees ?? true;

  return buildRecordsOperationalListSurface({
    primaryColumnId: "effectiveDate",
    searchToolbar: buildRecordsListSearchToolbar({
      param: hrRecordsStatusHistorySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrRecordsStatusHistoryColumnsId,
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
        id: "source",
        header: copy.colSource,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "kind",
        header: copy.colKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "fromStatus",
        header: copy.colFrom,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "toStatus",
        header: copy.colTo,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "reason",
        header: copy.colReason,
        wrap: true,
        minWidth: 160,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: `${row.source}-${row.id}`,
      cells: {
        effectiveDate: row.effectiveDate.toISOString(),
        employee: `${row.employeeNumber} · ${row.displayName}`,
        source: row.source === "lifecycle" ? "Lifecycle" : "Record",
        kind: formatRecordsEventKindLabel(row.kind),
        fromStatus: row.previousStatus
          ? formatRecordsEmploymentStatusLabel(row.previousStatus)
          : "—",
        toStatus: row.newStatus
          ? formatRecordsEmploymentStatusLabel(row.newStatus)
          : "—",
        reason: row.reason ?? "",
      },
      ...(linkEmployees
        ? { rowHref: hrEmployeeDetailRoutePath(row.employeeId) }
        : {}),
    })),
  });
}
