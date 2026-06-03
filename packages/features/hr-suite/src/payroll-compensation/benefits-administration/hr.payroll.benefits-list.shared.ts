import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
  resolveHrSuiteListTrailingAction,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import { hrPayrollBenefitsReadPermission } from "./hr.payroll.benefits.contract";

export type BenefitsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type BenefitsListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type BenefitsListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildBenefitsListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return buildHrSuiteListSearchToolbar(input);
}

export function buildBenefitsOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildBenefitsListSearchToolbar>;
  window: BenefitsListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: BenefitsListColumn[];
  rows: BenefitsListRow[];
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrPayrollBenefitsReadPermission,
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

export function formatBenefitsEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveBenefitsEnrollmentTrailingAction(input: {
  canWrite: boolean;
  coverageStatus: string;
  allowsDependents: boolean;
  coverageLevel: string;
  unverifiedDependentCount: number;
}) {
  if (!input.canWrite) {
    return resolveHrSuiteListTrailingAction({
      visible: false,
      allowed: false,
    });
  }

  if (input.coverageStatus === "pending") {
    return resolveHrSuiteListTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "approve-enrollment",
        label: "Approve",
        intent: "approval",
      },
    });
  }

  if (input.unverifiedDependentCount > 0) {
    return resolveHrSuiteListTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "verify-dependents",
        label: "Verify dependents",
        intent: "default",
      },
    });
  }

  if (
    input.allowsDependents &&
    input.coverageLevel !== "employee_only" &&
    (input.coverageStatus === "active" || input.coverageStatus === "pending")
  ) {
    return resolveHrSuiteListTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "add-dependent",
        label: "Add dependent",
        intent: "default",
      },
    });
  }

  return resolveHrSuiteListTrailingAction({
    visible: false,
    allowed: false,
  });
}
