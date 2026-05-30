import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
  formatLamEmployeeListCell,
  formatLamEnumCell,
} from "./hr.time.lam-list.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";
import { hrLamExceptionsColumnsId } from "./hr.time.lam-surface-metadata.shared";

export const hrLamExceptionsSurfaceKey = "hr.time.lam.exceptions.list";

export function buildHrLamExceptionsListSurface(input: {
  rows: readonly {
    attendanceDayId: string;
    employeeNumber: string;
    employeeDisplayName: string;
    workDate: Date;
    status: string;
    exceptions: readonly { code: string; message: string }[];
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLamUiCopy.exceptions;

  return buildLamOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLamListSearchToolbar({
      param: "lamExceptionsSearch",
      label: copy.sectionTitle,
      placeholder: "Employee number or name",
    }),
    window: {
      pageSize: input.pageSize,
      totalCount: input.totalCount,
      hasNextPage: input.hasNextPage,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamExceptionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", pin: "start" },
      { id: "date", header: copy.colDate },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "attention" } },
      { id: "exceptions", header: copy.colExceptions, wrap: true },
    ],
    rows: input.rows.map((row) => ({
      id: row.attendanceDayId,
      cells: {
        employee: formatLamEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        date: row.workDate.toISOString().slice(0, 10),
        status: formatLamEnumCell(row.status),
        exceptions: row.exceptions.map((e) => e.code).join(", "),
      },
    })),
  });
}
