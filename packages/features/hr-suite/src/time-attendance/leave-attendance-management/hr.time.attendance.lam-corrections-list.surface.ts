import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { HrAttendanceCorrectionRow } from "@afenda/db";

import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
  formatLamEmployeeListCell,
  formatLamEnumCell,
} from "./hr.time.lam-list.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";
import { hrLamCorrectionsColumnsId } from "./hr.time.lam-surface-metadata.shared";

export const hrLamCorrectionsSurfaceKey = "hr.time.lam.corrections.list";

export function buildHrLamCorrectionsListSurface(input: {
  rows: readonly HrAttendanceCorrectionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLamUiCopy.corrections;

  return buildLamOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLamListSearchToolbar({
      param: "lamCorrectionsSearch",
      label: copy.sectionTitle,
      placeholder: "Employee or reason",
    }),
    window: {
      pageSize: input.pageSize,
      totalCount: input.totalCount,
      hasNextPage: input.hasNextPage,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamCorrectionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", pin: "start" },
      { id: "date", header: copy.colDate },
      { id: "code", header: copy.colCode },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "reason", header: copy.colReason, wrap: true },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatLamEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        date: row.workDate.toISOString().slice(0, 10),
        code: formatLamEnumCell(row.exceptionCode),
        status: formatLamEnumCell(row.status),
        reason: row.reason,
      },
    })),
  });
}
