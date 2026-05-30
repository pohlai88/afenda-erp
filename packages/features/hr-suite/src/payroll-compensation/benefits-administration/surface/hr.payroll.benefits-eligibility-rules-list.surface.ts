import {
  hrBenefitsEligibilityRulesSearchParam,
  hrBenefitsEligibilityRulesSurfaceKey,
} from "../data/hr.payroll.benefits-search-params.parse.shared";
import {
  buildBenefitsListSearchToolbar,
  buildBenefitsOperationalListSurface,
} from "./hr.payroll.benefits-list.shared";
import { hrBenefitsEligibilityRulesColumnsId } from "./hr.payroll.benefits-surface-columns.shared";
import { hrBenefitsUiCopy } from "./hr.payroll.benefits-ui.copy.shared";

export { hrBenefitsEligibilityRulesSurfaceKey };

export function buildHrBenefitsEligibilityRulesListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      planCode: string;
      planName: string;
      scopeLabel: string;
      active: boolean;
      effectiveFrom: string | Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBenefitsUiCopy.eligibilityRules;

  return buildBenefitsOperationalListSurface({
    primaryColumnId: "planName",
    searchToolbar: buildBenefitsListSearchToolbar({
      param: hrBenefitsEligibilityRulesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBenefitsEligibilityRulesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "planCode", header: copy.colPlanCode, cellKind: { kind: "text" } },
      {
        id: "planName",
        header: copy.colPlanName,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "text" },
      },
      {
        id: "scope",
        header: copy.colScope,
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "text" },
      },
      {
        id: "active",
        header: copy.colActive,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "effectiveFrom",
        header: copy.colEffectiveFrom,
        cellKind: { kind: "date" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        planCode: row.planCode,
        planName: row.planName,
        scope: row.scopeLabel,
        active: row.active ? "Active" : "Inactive",
        effectiveFrom:
          row.effectiveFrom instanceof Date
            ? row.effectiveFrom.toISOString()
            : row.effectiveFrom,
      },
      cellKinds: {
        active: {
          kind: "badge",
          tone: row.active ? "default" : "attention",
        },
      },
    })),
  });
}
