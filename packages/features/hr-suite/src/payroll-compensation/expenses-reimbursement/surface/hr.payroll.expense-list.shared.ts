import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrPayrollExpenseReadPermission } from "../contracts/hr.payroll.expense.contract";
import type { HrExpenseClaimStatus } from "../schemas/hr.payroll.expense-constants.shared";
import { formatExpenseEnumLabel } from "../schemas/hr.payroll.expense-form.shared";

export type ExpenseListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type ExpenseListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type ExpenseListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildExpenseListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return {
    search: {
      param: input.param,
      label: input.label,
      placeholder: input.placeholder,
      value: input.value,
    },
  };
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
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrPayrollExpenseReadPermission,
    presentation: {
      primaryColumnId: input.primaryColumnId,
      toolbar: input.searchToolbar,
    },
    pagination: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: { title: input.surface.headerTitle },
      columnsId: input.surface.columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: input.surface.emptyTitle,
        description: input.surface.emptyDescription,
      },
    },
    columns: [...input.columns],
    rows: [...input.rows],
  });
}

const STATUS_BADGE_TONE: Record<
  string,
  "default" | "attention" | "critical"
> = {
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
  status: HrExpenseClaimStatus | string;
}) {
  if (!input.canApprove) {
    return resolveListSurfaceRowTrailingAction({
      visible: false,
      allowed: false,
    });
  }

  if (
    input.status === "submitted" ||
    input.status === "under_review" ||
    input.status === "returned"
  ) {
    return resolveListSurfaceRowTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "review-expense-claim",
        label: "Review",
        intent: "approval",
      },
    });
  }

  return resolveListSurfaceRowTrailingAction({
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
