import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrWorkforceOffboardingReadPermission } from "../contracts/hr.workforce.offboarding.contract";
import { formatOffboardingEnumLabel } from "../schemas/hr.workforce.offboarding-form.shared";

export type OffboardingListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type OffboardingListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type OffboardingListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildOffboardingListSearchToolbar(input: {
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

export function buildOffboardingOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildOffboardingListSearchToolbar>;
  window: OffboardingListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: OffboardingListColumn[];
  rows: OffboardingListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceOffboardingReadPermission,
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

export function formatOffboardingEmployeeListCell(input: {
  employeeNumber: string;
  employeeDisplayName: string;
}): string {
  return `${input.employeeDisplayName} (${input.employeeNumber})`;
}

export function formatOffboardingListEnumCell(value: string): string {
  return formatOffboardingEnumLabel(value);
}

export function formatOffboardingCaseStatus(status: string): string {
  return status.replaceAll("_", " ");
}
