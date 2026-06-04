import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
} from "../../hr-suite-integration/metadata";
import { hrPayrollSbsReadPermission } from "./hr.payroll.sbs.contract";

export type SbsListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type SbsListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type SbsListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildSbsListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return buildHrSuiteListSearchToolbar(input);
}

export function formatSbsEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildSbsOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar?: ReturnType<typeof buildSbsListSearchToolbar>;
  window: SbsListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: readonly SbsListColumn[];
  rows: readonly SbsListRow[];
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrPayrollSbsReadPermission,
    ...(input.searchToolbar ? { searchToolbar: input.searchToolbar } : {}),
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
