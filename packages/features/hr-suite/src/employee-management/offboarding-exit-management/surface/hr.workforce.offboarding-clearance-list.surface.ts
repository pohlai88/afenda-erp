import type { HrOffboardingClearanceWindow } from "@afenda/db";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import {
  buildOffboardingListSearchToolbar,
  buildOffboardingOperationalListSurface,
  formatOffboardingEmployeeListCell,
  formatOffboardingListEnumCell,
} from "./hr.workforce.offboarding-list.shared";
import { hrOffboardingClearanceColumnsId } from "./hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export const hrOffboardingClearanceSurfaceKey =
  "hr.workforce.offboarding.clearance.list";

export const hrOffboardingClearanceSearchParam = "offboardingClearanceSearch";

export function buildHrOffboardingClearanceListSurface(input: {
  window: HrOffboardingClearanceWindow;
  searchValue?: string;
  canWrite?: boolean;
}) {
  const copy = hrOffboardingUiCopy.clearance;

  return buildOffboardingOperationalListSurface({
    primaryColumnId: "task",
    searchToolbar: buildOffboardingListSearchToolbar({
      param: hrOffboardingClearanceSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOffboardingClearanceColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "task",
        header: "Task",
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "employee",
        header: "Employee",
        minWidth: 180,
      },
      {
        id: "owner",
        header: "Owner",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "dueDate",
        header: "Due",
        cellKind: { kind: "date" },
        minWidth: 120,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowTone: row.isOverdue ? ("critical" as const) : undefined,
      cells: {
        task: row.title,
        employee: formatOffboardingEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        owner: formatOffboardingListEnumCell(row.assigneeRole),
        status: formatOffboardingListEnumCell(row.status),
        dueDate: row.dueDate?.toISOString() ?? "",
        itemIdValue: row.id,
        caseIdValue: row.caseId,
      },
      trailingAction:
        input.canWrite && row.status === "pending"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
            })
          : undefined,
    })),
  });
}
