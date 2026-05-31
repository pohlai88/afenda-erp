import type { HrTimeClockRawPunchWindow } from "@afenda/db";

import { hrTimeClockRawPunchesColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockRawPunchesSurfaceKey =
  "hr.time.clock-integration.raw-punches.list";

export const hrTimeClockRawPunchesSearchParam = "timeClockRawPunchesSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEmployeeCell,
  formatTimeClockEnumCell,
  resolveTimeClockValidationRowTone,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export function buildHrTimeClockRawPunchesListSurface(input: {
  window: HrTimeClockRawPunchWindow;
  searchValue?: string;
}) {
  const copy = hrTimeClockUiCopy.rawPunches;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockRawPunchesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockRawPunchesColumnsId,
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
      { id: "source", header: copy.colSource },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatTimeClockEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        device: `${row.deviceName} (${row.externalDeviceId})`,
        punchType: formatTimeClockEnumCell(row.punchType),
        punchedAt: row.punchedAt.toISOString(),
        validation: formatTimeClockEnumCell(row.validationStatus),
        source: row.source,
      },
      rowTone: resolveTimeClockValidationRowTone(row.validationStatus),
    })),
  });
}
