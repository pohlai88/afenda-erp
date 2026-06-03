import {
  hrBenefitsProvidersSearchParam,
  hrBenefitsProvidersSurfaceKey,
} from "./hr.payroll.benefits-search-params.parse.shared";
import {
  buildBenefitsListSearchToolbar,
  buildBenefitsOperationalListSurface,
} from "./hr.payroll.benefits-list.shared";
import { hrBenefitsProvidersColumnsId } from "./hr.payroll.benefits-surface-columns.shared";
import { hrBenefitsUiCopy } from "./hr.payroll.benefits-ui.copy.shared";

export { hrBenefitsProvidersSurfaceKey };

export function buildHrBenefitsProvidersListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      active: boolean;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBenefitsUiCopy.providers;

  return buildBenefitsOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildBenefitsListSearchToolbar({
      param: hrBenefitsProvidersSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBenefitsProvidersColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "active", header: copy.colActive, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        active: row.active ? "Active" : "Inactive",
      },
    })),
  });
}
