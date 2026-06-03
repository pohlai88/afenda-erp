import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import { hrPayrollCpmReadPermission } from "./hr.payroll.cpm.contract";

export type CpmListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type CpmListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type CpmListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildCpmListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return buildHrSuiteListSearchToolbar(input);
}

export function formatCpmEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildCpmOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildCpmListSearchToolbar>;
  window: CpmListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: readonly CpmListColumn[];
  rows: readonly CpmListRow[];
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrPayrollCpmReadPermission,
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
