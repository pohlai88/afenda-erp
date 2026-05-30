import {
  buildOffboardingListSearchToolbar,
  buildOffboardingOperationalListSurface,
  formatOffboardingEmployeeListCell,
  formatOffboardingListEnumCell,
} from "./hr.workforce.offboarding-list.shared";
import { hrOffboardingApprovalsColumnsId } from "./hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

export const hrOffboardingApprovalsSurfaceKey =
  "hr.workforce.offboarding.approvals.list";

export const hrOffboardingApprovalsSearchParam = "offboardingApprovalsSearch";

export type HrOffboardingApprovalWindow = {
  rows: readonly {
    id: string;
    caseId: string;
    employeeNumber: string;
    employeeDisplayName: string;
    stepCode: string;
    title: string;
    assigneeRole: string;
    status: string;
    decidedAt: Date | null;
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrOffboardingApprovalsListSurface(input: {
  window: HrOffboardingApprovalWindow;
  searchValue?: string;
}) {
  const copy = hrOffboardingUiCopy.approvals;

  return buildOffboardingOperationalListSurface({
    primaryColumnId: "step",
    searchToolbar: buildOffboardingListSearchToolbar({
      param: hrOffboardingApprovalsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOffboardingApprovalsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "step",
        header: "Approval step",
        priority: "primary",
        wrap: true,
        minWidth: 180,
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
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        step: row.title,
        employee: formatOffboardingEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        owner: formatOffboardingListEnumCell(row.assigneeRole),
        status: formatOffboardingListEnumCell(row.status),
        caseIdValue: row.caseId,
      },
    })),
  });
}
