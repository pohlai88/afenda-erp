import type { HrTimeClockPunchExceptionWindow } from "@afenda/db";

import { hrTimeClockPunchExceptionsColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockPunchExceptionsSurfaceKey =
  "hr.time.clock-integration.punch-exceptions.list";

export const hrTimeClockPunchExceptionsSearchParam =
  "timeClockPunchExceptionsSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEmployeeCell,
  formatTimeClockEnumCell,
  resolveTimeClockAdminTrailingAction,
  resolveTimeClockValidationRowTone,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export function buildHrTimeClockPunchExceptionsListSurface(input: {
  window: HrTimeClockPunchExceptionWindow;
  searchValue?: string;
  canWrite: boolean;
}) {
  const copy = hrTimeClockUiCopy.exceptions;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockPunchExceptionsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockPunchExceptionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        wrap: true,
      },
      {
        id: "exception",
        header: copy.colException,
        cellKind: { kind: "badge", tone: "critical" },
      },
      { id: "device", header: copy.colDevice, wrap: true },
      { id: "punchType", header: copy.colPunchType },
      {
        id: "punchedAt",
        header: copy.colPunchedAt,
        cellKind: { kind: "date" },
      },
      {
        id: "validation",
        header: copy.colValidation,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatTimeClockEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        exception: formatTimeClockEnumCell(row.exceptionCode),
        device: row.deviceName,
        punchType: formatTimeClockEnumCell(row.punchType),
        punchedAt: row.punchedAt.toISOString(),
        validation: formatTimeClockEnumCell(row.validationStatus),
      },
      rowTone: resolveTimeClockValidationRowTone(row.validationStatus),
      trailingAction: resolveTimeClockAdminTrailingAction(input.canWrite),
    })),
  });
}
