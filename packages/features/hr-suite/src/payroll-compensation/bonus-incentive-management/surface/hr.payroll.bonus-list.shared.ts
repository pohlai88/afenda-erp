import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
} from "../../../hr-suite-integration/metadata";
import { hrPayrollBonusReadPermission } from "../contracts/hr.payroll.bonus.contract";

export type BonusListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type BonusListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type BonusListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildBonusListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return buildHrSuiteListSearchToolbar(input);
}

export function formatBonusEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildBonusOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildBonusListSearchToolbar>;
  window: BonusListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: BonusListColumn[];
  rows: BonusListRow[];
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrPayrollBonusReadPermission,
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
