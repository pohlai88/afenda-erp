import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { HrAttendanceSummaryRow } from "@afenda/db";

import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
} from "./hr.time.lam-list.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";
import { hrLamReportsColumnsId } from "./hr.time.lam-surface-metadata.shared";

export const hrLamReportsSurfaceKey = "hr.time.lam.reports.list";

export function buildHrLamReportsListSurface(input: {
  rows: readonly HrAttendanceSummaryRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLamUiCopy.reports;

  return buildLamOperationalListSurface({
    primaryColumnId: "group",
    searchToolbar: buildLamListSearchToolbar({
      param: "lamReportsSearch",
      label: copy.sectionTitle,
      placeholder: "Group label",
    }),
    window: {
      pageSize: input.rows.length,
      totalCount: input.rows.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamReportsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "group", header: copy.colGroup, priority: "primary", pin: "start" },
      { id: "worked", header: copy.colWorked },
      { id: "leave", header: copy.colLeave },
      { id: "absent", header: copy.colAbsent },
      { id: "late", header: copy.colLate },
    ],
    rows: input.rows.map((row) => ({
      id: row.groupKey,
      cells: {
        group: row.groupLabel,
        worked: String(row.daysWorked),
        leave: String(row.leaveDays),
        absent: String(row.absentDays),
        late: String(row.lateCount),
      },
    })),
  });
}
