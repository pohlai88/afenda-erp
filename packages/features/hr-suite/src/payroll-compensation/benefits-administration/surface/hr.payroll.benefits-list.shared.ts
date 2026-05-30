import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrPayrollBenefitsReadPermission } from "../contracts/hr.payroll.benefits.contract";

export type BenefitsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type BenefitsListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type BenefitsListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildBenefitsListSearchToolbar(input: {
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
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrPayrollBenefitsReadPermission,
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
    return resolveListSurfaceRowTrailingAction({
      visible: false,
      allowed: false,
    });
  }

  if (input.coverageStatus === "pending") {
    return resolveListSurfaceRowTrailingAction({
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
    return resolveListSurfaceRowTrailingAction({
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
    return resolveListSurfaceRowTrailingAction({
      visible: true,
      allowed: true,
      descriptor: {
        id: "add-dependent",
        label: "Add dependent",
        intent: "default",
      },
    });
  }

  return resolveListSurfaceRowTrailingAction({
    visible: false,
    allowed: false,
  });
}
