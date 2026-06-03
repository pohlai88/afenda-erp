import type { HrOffboardingCaseWindow } from "@afenda/db";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import {
  buildOffboardingListSearchToolbar,
  buildOffboardingOperationalListSurface,
  formatOffboardingCaseStatus,
  formatOffboardingEmployeeListCell,
  formatOffboardingListEnumCell,
} from "./hr.workforce.offboarding-list.shared";
import { hrOffboardingCasesColumnsId } from "./hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export const hrOffboardingCasesSurfaceKey =
  "hr.workforce.offboarding.cases.list";

export const hrOffboardingCasesSearchParam = "offboardingCasesSearch";

export function buildHrOffboardingCasesListSurface(input: {
  window: HrOffboardingCaseWindow;
  searchValue?: string;
  canWrite?: boolean;
}) {
  const copy = hrOffboardingUiCopy.cases;

  return buildOffboardingOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildOffboardingListSearchToolbar({
      param: hrOffboardingCasesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOffboardingCasesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: "Employee",
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "exitType",
        header: "Exit type",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "caseStatus",
        header: "Status",
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "lastWorking",
        header: "Last working",
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "department",
        header: "Department",
        minWidth: 140,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatOffboardingEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        employeeIdValue: row.employeeId,
        exitType: formatOffboardingListEnumCell(row.exitType),
        caseStatus: formatOffboardingCaseStatus(row.status),
        lastWorking: row.lastWorkingDate?.toISOString() ?? "",
        department: row.departmentName ?? "—",
        caseIdValue: row.id,
      },
      trailingAction: input.canWrite
        ? resolveListSurfaceRowTrailingAction({
            visible: true,
            allowed: true,
          })
        : undefined,
    })),
  });
}
