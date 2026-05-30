import { hrBenefitsPlansSearchParam } from "../data/hr.payroll.benefits-search-params.parse.shared";
import {
  buildBenefitsListSearchToolbar,
  buildBenefitsOperationalListSurface,
} from "./hr.payroll.benefits-list.shared";
import { hrBenefitsPlansColumnsId } from "./hr.payroll.benefits-surface-columns.shared";
import { hrBenefitsUiCopy } from "./hr.payroll.benefits-ui.copy.shared";

export const hrBenefitsPlansSurfaceKey = "hr.payroll.benefits.plans.list";

export { hrBenefitsPlansSearchParam } from "../data/hr.payroll.benefits-search-params.parse.shared";

export function buildHrBenefitsPlansListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      category: string;
      providerName: string | null;
      planStatus: string;
      effectiveFrom: string | Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBenefitsUiCopy.plans;

  return buildBenefitsOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildBenefitsListSearchToolbar({
      param: hrBenefitsPlansSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBenefitsPlansColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "category", header: copy.colCategory, cellKind: { kind: "badge", tone: "default" } },
      { id: "provider", header: copy.colProvider, cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        category: row.category,
        provider: row.providerName ?? "—",
        status: row.planStatus,
        effectiveFrom:
          row.effectiveFrom instanceof Date
            ? row.effectiveFrom.toISOString()
            : row.effectiveFrom,
      },
    })),
  });
}
