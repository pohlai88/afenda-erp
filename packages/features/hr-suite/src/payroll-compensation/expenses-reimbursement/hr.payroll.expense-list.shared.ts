import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
  resolveHrSuiteListTrailingAction,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import { hrPayrollExpenseReadPermission } from "./hr.payroll.expense.contract";
import type { HrExpenseClaimStatus } from "./hr.payroll.expense-constants.shared";
import { formatExpenseEnumLabel } from "./hr.payroll.expense-form.shared";

export type ExpenseListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type ExpenseListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type ExpenseListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildExpenseListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return buildHrSuiteListSearchToolbar(input);
}

export function buildExpenseOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildExpenseListSearchToolbar>;
  window: ExpenseListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: readonly ExpenseListColumn[];
  rows: readonly ExpenseListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrPayrollExpenseReadPermission,
    searchToolbar: input.searchToolbar,
    window: input.window,
    surface: {
      headerTitle: input.surface.headerTitle,
      columnsId: input.surface.columnsId,
      rowKey: "id",
      emptyTitle: input.surface.emptyTitle,
      emptyDescription: input.surface.emptyDescription,
    },
    columns: input.columns,
    rows: input.rows,
  });
}

const STATUS_BADGE_TONE: Record<string, "default" | "attention" | "critical"> =
  {
    draft: "default",
    submitted: "attention",
    under_review: "attention",
    approved: "default",
    rejected: "critical",
    returned: "attention",
    paid: "default",
    cancelled: "critical",
  };

export function resolveExpenseStatusBadgeTone(
  status: HrExpenseClaimStatus | string,
): "default" | "attention" | "critical" {
  return STATUS_BADGE_TONE[status] ?? "default";
}

export function resolveExpenseClaimTrailingAction(input: {
  canApprove: boolean;
  canWrite?: boolean;
  status: HrExpenseClaimStatus | string;
}) {
  if (
    input.canApprove &&
    (input.status === "submitted" ||
      input.status === "under_review" ||
      input.status === "returned")
  ) {
    return resolveHrSuiteListTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "review-expense-claim",
        label: "Review",
        intent: "approval",
      },
    });
  }

  if (
    input.canWrite &&
    (input.status === "submitted" ||
      input.status === "under_review" ||
      input.status === "returned")
  ) {
    return resolveHrSuiteListTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "attach-expense-receipt",
        label: "Receipt",
        intent: "financial",
      },
    });
  }

  return resolveHrSuiteListTrailingAction({
    visible: false,
    allowed: false,
  });
}

export function formatExpenseFlagsCell(input: {
  duplicateFlag: boolean;
  exceptionRequired: boolean;
}): string {
  const flags: string[] = [];
  if (input.duplicateFlag) flags.push("Duplicate");
  if (input.exceptionRequired) flags.push("Exception");
  return flags.length > 0 ? flags.join(", ") : "—";
}

export function formatExpenseStatusCell(status: string): string {
  return formatExpenseEnumLabel(status);
}
