import {
  buildOffboardingListSearchToolbar,
  buildOffboardingOperationalListSurface,
  formatOffboardingEmployeeListCell,
} from "./hr.workforce.offboarding-list.shared";
import { hrOffboardingSettlementColumnsId } from "./hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export const hrOffboardingSettlementSurfaceKey =
  "hr.workforce.offboarding.settlement.list";

export const hrOffboardingSettlementSearchParam = "offboardingSettlementSearch";

export type HrOffboardingSettlementWindow = {
  rows: readonly {
    id: string;
    employeeNumber: string;
    employeeDisplayName: string;
    settlementReadyAt: Date | null;
    lastWorkingDate: Date | null;
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrOffboardingSettlementListSurface(input: {
  window: HrOffboardingSettlementWindow;
  searchValue?: string;
}) {
  const copy = hrOffboardingUiCopy.settlement;

  return buildOffboardingOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildOffboardingListSearchToolbar({
      param: hrOffboardingSettlementSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOffboardingSettlementColumnsId,
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
        id: "lastWorking",
        header: "Last working",
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "settlementReady",
        header: "Settlement ready",
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatOffboardingEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        lastWorking: row.lastWorkingDate?.toISOString() ?? "",
        settlementReady: row.settlementReadyAt ? "Ready" : "Pending",
        caseIdValue: row.id,
      },
    })),
  });
}
