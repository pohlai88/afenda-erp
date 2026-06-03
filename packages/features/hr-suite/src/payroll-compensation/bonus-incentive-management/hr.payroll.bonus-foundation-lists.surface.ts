import {
  hrBonusCyclesSearchParam,
  hrBonusCyclesSurfaceKey,
  hrBonusEligibilityRulesSearchParam,
  hrBonusEligibilityRulesSurfaceKey,
  hrBonusParticipantsSearchParam,
  hrBonusParticipantsSurfaceKey,
  hrBonusPlansSearchParam,
  hrBonusPlansSurfaceKey,
  hrBonusTargetsSearchParam,
  hrBonusTargetsSurfaceKey,
} from "./hr.payroll.bonus-search-params.parse.shared";
import {
  buildBonusListSearchToolbar,
  buildBonusOperationalListSurface,
  formatBonusEnumLabel,
} from "./hr.payroll.bonus-list.shared";
import {
  hrBonusCyclesColumnsId,
  hrBonusEligibilityRulesColumnsId,
  hrBonusParticipantsColumnsId,
  hrBonusPlansColumnsId,
  hrBonusTargetsColumnsId,
} from "./hr.payroll.bonus-surface-columns.shared";
import { hrBonusUiCopy } from "./hr.payroll.bonus-ui.copy.shared";

export {
  hrBonusPlansSurfaceKey,
  hrBonusEligibilityRulesSurfaceKey,
  hrBonusParticipantsSurfaceKey,
  hrBonusCyclesSurfaceKey,
  hrBonusTargetsSurfaceKey,
};

export function buildHrBonusPlansListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      code: string;
      name: string;
      planType: string;
      planStatus: string;
      currencyCode: string;
      requiresApproval: boolean;
      effectiveFrom: Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.plans;
  return buildBonusOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusPlansSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusPlansColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "planType", header: copy.colPlanType, cellKind: { kind: "badge", tone: "default" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "currency", header: copy.colCurrency, cellKind: { kind: "text" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        planType: formatBonusEnumLabel(row.planType),
        status: row.planStatus,
        currency: row.currencyCode,
        effectiveFrom: row.effectiveFrom.toISOString(),
      },
    })),
  });
}

export function buildHrBonusEligibilityRulesListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      planCode: string;
      planName: string;
      scopeLabel: string;
      active: boolean;
      effectiveFrom: Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.eligibilityRules;
  return buildBonusOperationalListSurface({
    primaryColumnId: "scopeLabel",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusEligibilityRulesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusEligibilityRulesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "plan", header: copy.colPlan, pin: "start", minWidth: 160, cellKind: { kind: "text" } },
      { id: "scope", header: copy.colScope, cellKind: { kind: "text" } },
      { id: "active", header: copy.colActive, cellKind: { kind: "badge", tone: "default" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        plan: `${row.planCode} — ${row.planName}`,
        scope: row.scopeLabel,
        active: row.active ? "Active" : "Inactive",
        effectiveFrom: row.effectiveFrom.toISOString(),
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

export function buildHrBonusParticipantsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      employeeLabel: string;
      planCode: string;
      planName: string;
      assignmentStatus: string;
      eligible: boolean;
      ineligibilityReason: string | null;
      assignedAt: Date;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.participants;
  return buildBonusOperationalListSurface({
    primaryColumnId: "employeeLabel",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusParticipantsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusParticipantsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "eligible", header: copy.colEligible, cellKind: { kind: "badge", tone: "default" } },
      { id: "reason", header: copy.colReason, cellKind: { kind: "text" } },
      { id: "assignedAt", header: copy.colAssignedAt, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: row.employeeLabel,
        plan: `${row.planCode} — ${row.planName}`,
        status: formatBonusEnumLabel(row.assignmentStatus),
        eligible: row.eligible ? "Eligible" : "Flagged",
        reason: row.ineligibilityReason ?? "—",
        assignedAt: row.assignedAt.toISOString(),
      },
      cellKinds: {
        eligible: {
          kind: "badge",
          tone: row.eligible ? "default" : "attention",
        },
      },
    })),
  });
}

export function buildHrBonusCyclesListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      planCode: string;
      planName: string;
      code: string;
      name: string;
      cycleStatus: string;
      periodStartAt: Date;
      periodEndAt: Date;
      cutoffAt: Date | null;
      approvalAt: Date | null;
      payoutAt: Date | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.cycles;
  return buildBonusOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusCyclesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusCyclesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      { id: "code", header: copy.colCode, cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, pin: "start", minWidth: 160, cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "period", header: copy.colPeriod, cellKind: { kind: "text" } },
      { id: "payoutAt", header: copy.colPayoutAt, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        plan: `${row.planCode} — ${row.planName}`,
        code: row.code,
        name: row.name,
        status: formatBonusEnumLabel(row.cycleStatus),
        period: `${row.periodStartAt.toISOString().slice(0, 10)} → ${row.periodEndAt.toISOString().slice(0, 10)}`,
        payoutAt: row.payoutAt?.toISOString() ?? "—",
      },
    })),
  });
}

export function buildHrBonusTargetsListSurface(input: {
  window: {
    rows: Array<{
      id: string;
      planCode: string;
      cycleCode: string;
      targetKind: string;
      scopeLabel: string;
      targetValue: string;
      currencyCode: string | null;
    }>;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrBonusUiCopy.targets;
  return buildBonusOperationalListSurface({
    primaryColumnId: "scopeLabel",
    searchToolbar: buildBonusListSearchToolbar({
      param: hrBonusTargetsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrBonusTargetsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "plan", header: copy.colPlan, cellKind: { kind: "text" } },
      { id: "cycle", header: copy.colCycle, cellKind: { kind: "text" } },
      { id: "kind", header: copy.colKind, cellKind: { kind: "badge", tone: "default" } },
      { id: "scope", header: copy.colScope, pin: "start", minWidth: 160, cellKind: { kind: "text" } },
      { id: "target", header: copy.colTarget, cellKind: { kind: "text" } },
      { id: "currency", header: copy.colCurrency, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        plan: row.planCode,
        cycle: row.cycleCode,
        kind: formatBonusEnumLabel(row.targetKind),
        scope: row.scopeLabel,
        target: row.targetValue,
        currency: row.currencyCode ?? "—",
      },
    })),
  });
}
