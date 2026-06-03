import type { HrTimeClockSyncBatchWindow } from "@afenda/db";

import { hrTimeClockSyncBatchesColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockSyncBatchesSurfaceKey =
  "hr.time.clock-integration.sync-batches.list";

export const hrTimeClockSyncBatchesSearchParam = "timeClockSyncBatchesSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEnumCell,
  resolveTimeClockSyncBatchRowTone,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export function buildHrTimeClockSyncBatchesListSurface(input: {
  window: HrTimeClockSyncBatchWindow;
  searchValue?: string;
}) {
  const copy = hrTimeClockUiCopy.syncBatches;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "device",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockSyncBatchesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockSyncBatchesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "device", header: copy.colDevice, priority: "primary", wrap: true },
      { id: "batchKey", header: copy.colBatchKey, wrap: true },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "started",
        header: copy.colStarted,
        cellKind: { kind: "date" },
      },
      { id: "records", header: copy.colRecords },
      { id: "error", header: copy.colError, wrap: true },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        device: `${row.deviceName} (${row.externalDeviceId})`,
        batchKey: row.batchKey,
        status: formatTimeClockEnumCell(row.status),
        started: row.startedAt.toISOString(),
        records: String(row.recordCount),
        error: row.errorMessage ?? "—",
      },
      rowTone: resolveTimeClockSyncBatchRowTone(row.status),
    })),
  });
}
