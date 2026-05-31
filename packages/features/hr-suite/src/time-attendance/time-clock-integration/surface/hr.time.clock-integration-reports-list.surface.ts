import type { HrTimeClockReportRow } from "@afenda/db";

import { hrTimeClockReportsColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockReportsSurfaceKey =
  "hr.time.clock-integration.reports.list";

export const hrTimeClockReportGroupByParam = "timeClockReportGroupBy";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export function buildHrTimeClockReportsListSurface(input: {
  rows: readonly HrTimeClockReportRow[];
  groupBy: string;
}) {
  const copy = hrTimeClockUiCopy.reports;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "label",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockReportGroupByParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.groupBy,
    }),
    window: {
      pageSize: input.rows.length || 25,
      totalCount: input.rows.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockReportsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "label", header: copy.colLabel, priority: "primary", wrap: true },
      { id: "group", header: copy.colGroup },
      { id: "count", header: copy.colCount },
      { id: "hours", header: copy.colHours },
    ],
    rows: input.rows.map((row) => ({
      id: row.groupKey,
      cells: {
        label: row.groupLabel,
        group: input.groupBy,
        count: String(row.metricCount),
        hours: row.metricHours == null ? "—" : row.metricHours.toFixed(2),
      },
    })),
  });
}
