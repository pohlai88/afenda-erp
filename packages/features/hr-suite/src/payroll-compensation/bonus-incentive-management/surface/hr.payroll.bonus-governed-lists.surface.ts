import {
  hrBonusDiscretionarySearchParam,
  hrBonusDiscretionarySurfaceKey,
  hrBonusGuaranteedRulesSearchParam,
  hrBonusGuaranteedRulesSurfaceKey,
  hrBonusManualAdjustmentsSearchParam,
  hrBonusManualAdjustmentsSurfaceKey,
  hrBonusMultipliersSearchParam,
  hrBonusMultipliersSurfaceKey,
  hrBonusProrationsSearchParam,
  hrBonusProrationsSurfaceKey,
  hrBonusRecoveriesSearchParam,
  hrBonusRecoveriesSurfaceKey,
} from "../data/hr.payroll.bonus-search-params.parse.shared";
import {
  buildBonusListSearchToolbar,
  buildBonusOperationalListSurface,
  formatBonusEnumLabel,
} from "./hr.payroll.bonus-list.shared";
import {
  hrBonusDiscretionaryColumnsId,
  hrBonusGuaranteedRulesColumnsId,
  hrBonusManualAdjustmentsColumnsId,
  hrBonusMultipliersColumnsId,
  hrBonusProrationsColumnsId,
  hrBonusRecoveriesColumnsId,
} from "./hr.payroll.bonus-surface-columns.shared";
import { hrBonusUiCopy } from "./hr.payroll.bonus-ui.copy.shared";

export {
  hrBonusGuaranteedRulesSurfaceKey,
  hrBonusMultipliersSurfaceKey,
  hrBonusProrationsSurfaceKey,
  hrBonusManualAdjustmentsSurfaceKey,
  hrBonusDiscretionarySurfaceKey,
  hrBonusRecoveriesSurfaceKey,
};

export function buildHrBonusGuaranteedRulesListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      planCode: string;
      planName: string;
      label: string;
      minimumAmount: string;
      currencyCode: string;
      active: boolean;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.guaranteedRules;
  return buildBonusOperationalListSurface({
    primaryColumnId: "label",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusGuaranteedRulesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusGuaranteedRulesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "plan",
        header: copy.colPlan,
        pin: "start",
        minWidth: 160,
        cellKind: { kind: "text" },
      },
      { id: "label", header: copy.colLabel, cellKind: { kind: "text" } },
      { id: "minimum", header: copy.colMinimum, cellKind: { kind: "text" } },
      { id: "currency", header: copy.colCurrency, cellKind: { kind: "text" } },
      { id: "active", header: copy.colActive, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        plan: `${row.planCode} — ${row.planName}`,
        label: row.label,
        minimum: row.minimumAmount,
        currency: row.currencyCode,
        active: row.active ? "Active" : "Inactive",
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

export function buildHrBonusMultipliersListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      planCode: string;
      planName: string;
      scope: string;
      scopeLabel: string;
      multiplier: string;
      active: boolean;
      effectiveFrom: Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.multipliers;
  return buildBonusOperationalListSurface({
    primaryColumnId: "scope",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusMultipliersSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusMultipliersColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      {
        id: "scope",
        header: copy.colScope,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "text" },
      },
      { id: "multiplier", header: copy.colMultiplier, cellKind: { kind: "text" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
      { id: "active", header: copy.colActive, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        plan: `${row.planCode} — ${row.planName}`,
        scope: `${formatBonusEnumLabel(row.scope)} · ${row.scopeLabel}`,
        multiplier: row.multiplier,
        effectiveFrom: row.effectiveFrom.toISOString(),
        active: row.active ? "Active" : "Inactive",
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

export function buildHrBonusProrationsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeLabel: string;
      planCode: string;
      cycleCode: string;
      reason: string;
      prorationFactor: string;
      periodStartAt: Date | null;
      periodEndAt: Date | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.prorations;
  return buildBonusOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusProrationsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusProrationsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "text" },
      },
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      { id: "cycle", header: copy.colCycle, cellKind: { kind: "text" } },
      { id: "reason", header: copy.colReason, cellKind: { kind: "badge", tone: "default" } },
      { id: "factor", header: copy.colFactor, cellKind: { kind: "text" } },
      { id: "period", header: copy.colPeriod, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => {
      const period =
        row.periodStartAt && row.periodEndAt
          ? `${row.periodStartAt.toISOString().slice(0, 10)} – ${row.periodEndAt.toISOString().slice(0, 10)}`
          : "—";
      return {
        id: row.id,
        cells: {
          employee: row.employeeLabel,
          plan: row.planCode,
          cycle: row.cycleCode,
          reason: formatBonusEnumLabel(row.reason),
          factor: row.prorationFactor,
          period,
        },
      };
    }),
  });
}

export function buildHrBonusManualAdjustmentsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeLabel: string;
      planCode: string;
      adjustmentAmount: string;
      currencyCode: string;
      justification: string;
      approvalReference: string;
      status: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.manualAdjustments;
  return buildBonusOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusManualAdjustmentsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusManualAdjustmentsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 160,
        cellKind: { kind: "text" },
      },
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      { id: "amount", header: copy.colAmount, cellKind: { kind: "text" } },
      {
        id: "justification",
        header: copy.colJustification,
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "text" },
      },
      { id: "approvalRef", header: copy.colApprovalRef, cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: row.employeeLabel,
        plan: row.planCode,
        amount: `${row.adjustmentAmount} ${row.currencyCode}`,
        justification: row.justification,
        approvalRef: row.approvalReference,
        status: formatBonusEnumLabel(row.status),
      },
    })),
  });
}

export function buildHrBonusDiscretionaryListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeLabel: string;
      planCode: string | null;
      recommendedAmount: string;
      currencyCode: string;
      recommendationStatus: string;
      recommenderUserId: string;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.discretionary;
  return buildBonusOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusDiscretionarySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusDiscretionaryColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "text" },
      },
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      { id: "amount", header: copy.colAmount, cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "recommender", header: copy.colRecommender, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: row.employeeLabel,
        plan: row.planCode ?? "—",
        amount: `${row.recommendedAmount} ${row.currencyCode}`,
        status: formatBonusEnumLabel(row.recommendationStatus),
        recommender: row.recommenderUserId,
      },
    })),
  });
}

export function buildHrBonusRecoveriesListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeLabel: string;
      recoveryKind: string;
      recoveryAmount: string;
      currencyCode: string;
      referenceCode: string;
      clawbackReference: string | null;
      recordedAt: Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.recoveries;
  return buildBonusOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusRecoveriesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusRecoveriesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "text" },
      },
      { id: "kind", header: copy.colKind, cellKind: { kind: "badge", tone: "attention" } },
      { id: "amount", header: copy.colAmount, cellKind: { kind: "text" } },
      { id: "reference", header: copy.colReference, cellKind: { kind: "text" } },
      { id: "clawback", header: copy.colClawback, cellKind: { kind: "text" } },
      { id: "recordedAt", header: copy.colRecordedAt, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: row.employeeLabel,
        kind: formatBonusEnumLabel(row.recoveryKind),
        amount: `${row.recoveryAmount} ${row.currencyCode}`,
        reference: row.referenceCode,
        clawback: row.clawbackReference ?? "—",
        recordedAt: row.recordedAt.toISOString(),
      },
    })),
  });
}
