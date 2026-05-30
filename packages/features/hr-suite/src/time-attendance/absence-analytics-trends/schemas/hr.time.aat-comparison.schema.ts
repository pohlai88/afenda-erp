import { z } from "zod";

/** HRM-AAT-012 … HRM-AAT-017 — comparison, availability, heatmap, trend movement schemas. */

export const hrAatLeaveTypeSchema = z.enum([
  "annual",
  "sick",
  "medical",
  "unpaid",
  "maternity",
  "paternity",
  "compassionate",
  "emergency",
  "study",
  "replacement",
  "hospitalization",
  "other",
]);

export const hrAatPeriodSchema = z
  .object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
  })
  .refine((value) => value.periodEnd >= value.periodStart, {
    message: "periodEnd must be on or after periodStart",
  });

export const hrAatComparisonDimensionSchema = z.enum([
  "department",
  "location",
  "manager",
  "employee_group",
]);

export const hrAatHeatmapRowAxisSchema = z.enum([
  "date",
  "team",
  "department",
  "location",
  "leave_type",
]);

export const hrAatTrendMovementSchema = z.enum([
  "improving",
  "worsening",
  "stable",
]);

export const hrAatCoverageRiskLevelSchema = z.enum([
  "normal",
  "watch",
  "at_risk",
  "high_risk",
]);

export const hrAatPlannedVsUnplannedQuerySchema = hrAatPeriodSchema.extend({
  organizationId: z.string().trim().min(1),
  departmentId: z.string().trim().optional(),
  managerEmployeeId: z.string().trim().optional(),
  workLocationCode: z.string().trim().optional(),
  policyGroupCode: z.string().trim().optional(),
});

export const hrAatTrendComparisonQuerySchema = hrAatPeriodSchema.extend({
  organizationId: z.string().trim().min(1),
  dimension: hrAatComparisonDimensionSchema,
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const hrAatAvailabilityQuerySchema = hrAatPeriodSchema.extend({
  organizationId: z.string().trim().min(1),
  departmentId: z.string().trim().optional(),
  managerEmployeeId: z.string().trim().optional(),
  workLocationCode: z.string().trim().optional(),
  coverageRiskThresholdPct: z.coerce.number().min(0).max(100).optional(),
});

export const hrAatHeatmapQuerySchema = hrAatPeriodSchema.extend({
  organizationId: z.string().trim().min(1),
  rowAxis: hrAatHeatmapRowAxisSchema,
  departmentId: z.string().trim().optional(),
  managerEmployeeId: z.string().trim().optional(),
  workLocationCode: z.string().trim().optional(),
});

export const hrAatTrendMovementQuerySchema = hrAatPeriodSchema.extend({
  organizationId: z.string().trim().min(1),
  dimension: hrAatComparisonDimensionSchema,
  stableThresholdPct: z.coerce.number().min(0).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type HrAatLeaveType = z.infer<typeof hrAatLeaveTypeSchema>;
export type HrAatComparisonDimension = z.infer<
  typeof hrAatComparisonDimensionSchema
>;
export type HrAatHeatmapRowAxis = z.infer<typeof hrAatHeatmapRowAxisSchema>;
export type HrAatTrendMovement = z.infer<typeof hrAatTrendMovementSchema>;
export type HrAatCoverageRiskLevel = z.infer<
  typeof hrAatCoverageRiskLevelSchema
>;

export type HrAatPlannedVsUnplannedSlice = {
  readonly category: "planned" | "unplanned";
  readonly lostWorkdays: number;
  readonly absenceCount: number;
  readonly sharePct: number;
};

export type HrAatPlannedVsUnplannedComparison = {
  readonly requirementCode: "HRM-AAT-012";
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly totalLostWorkdays: number;
  readonly slices: readonly HrAatPlannedVsUnplannedSlice[];
  readonly plannedSharePct: number;
  readonly unplannedSharePct: number;
};

export type HrAatDimensionTrendRow = {
  readonly dimensionKey: string;
  readonly dimensionLabel: string;
  readonly absenceRatePct: number;
  readonly lostWorkdays: number;
  readonly absenceCount: number;
  readonly headcount: number;
  readonly rank: number;
};

export type HrAatTrendComparisonResult = {
  readonly requirementCode: "HRM-AAT-013";
  readonly dimension: HrAatComparisonDimension;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly rows: readonly HrAatDimensionTrendRow[];
};

export type HrAatWorkforceAvailabilityIndicators = {
  readonly requirementCode: "HRM-AAT-014";
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly totalHeadcount: number;
  readonly availableCount: number;
  readonly unavailableCount: number;
  readonly onLeaveCount: number;
  readonly absentCount: number;
  readonly availabilityRatePct: number;
};

export type HrAatCoverageRiskFlag = {
  readonly requirementCode: "HRM-AAT-015";
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly unavailableRatePct: number;
  readonly thresholdPct: number;
  readonly isAtRisk: boolean;
  readonly riskLevel: HrAatCoverageRiskLevel;
  readonly message: string;
};

export type HrAatHeatmapCell = {
  readonly rowKey: string;
  readonly rowLabel: string;
  readonly colKey: string;
  readonly colLabel: string;
  readonly value: number;
  readonly intensity: number;
};

export type HrAatHeatmapVizConfig = {
  readonly rendererId: "aat-absence-heatmap";
  readonly rowAxis: HrAatHeatmapRowAxis;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly cells: readonly HrAatHeatmapCell[];
  readonly maxValue: number;
};

export type HrAatHeatmapResult = {
  readonly requirementCode: "HRM-AAT-016";
  readonly viz: HrAatHeatmapVizConfig;
};

export type HrAatTrendMovementRow = {
  readonly dimensionKey: string;
  readonly dimensionLabel: string;
  readonly currentAbsenceRatePct: number;
  readonly priorAbsenceRatePct: number;
  readonly deltaPctPoints: number;
  readonly movement: HrAatTrendMovement;
};

export type HrAatTrendMovementVizConfig = {
  readonly rendererId: "aat-trend-movement";
  readonly dimension: HrAatComparisonDimension;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly priorPeriodStart: string;
  readonly priorPeriodEnd: string;
  readonly stableThresholdPct: number;
  readonly rows: readonly HrAatTrendMovementRow[];
};

export type HrAatTrendMovementResult = {
  readonly requirementCode: "HRM-AAT-017";
  readonly viz: HrAatTrendMovementVizConfig;
};

const UNPLANNED_LEAVE_TYPES = new Set<HrAatLeaveType>([
  "emergency",
  "unpaid",
]);

const DEFAULT_COVERAGE_RISK_THRESHOLD_PCT = 20;
const DEFAULT_STABLE_THRESHOLD_PCT = 2;
const MIN_NOTICE_HOURS = 24;

export function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function isPlannedLeave(input: {
  leaveType: HrAatLeaveType;
  submittedAt: Date;
  startAt: Date;
}): boolean {
  if (UNPLANNED_LEAVE_TYPES.has(input.leaveType)) {
    return false;
  }

  const noticeMs = input.startAt.getTime() - input.submittedAt.getTime();
  const noticeHours = noticeMs / (1000 * 60 * 60);
  return noticeHours >= MIN_NOTICE_HOURS;
}

export function buildPlannedVsUnplannedComparison(input: {
  periodStart: Date;
  periodEnd: Date;
  plannedLostWorkdays: number;
  plannedAbsenceCount: number;
  unplannedLostWorkdays: number;
  unplannedAbsenceCount: number;
}): HrAatPlannedVsUnplannedComparison {
  const totalLostWorkdays =
    input.plannedLostWorkdays + input.unplannedLostWorkdays;
  const plannedSharePct =
    totalLostWorkdays > 0
      ? roundPct((input.plannedLostWorkdays / totalLostWorkdays) * 100)
      : 0;
  const unplannedSharePct =
    totalLostWorkdays > 0
      ? roundPct((input.unplannedLostWorkdays / totalLostWorkdays) * 100)
      : 0;

  const slices: HrAatPlannedVsUnplannedSlice[] = [
    {
      category: "planned",
      lostWorkdays: roundDays(input.plannedLostWorkdays),
      absenceCount: input.plannedAbsenceCount,
      sharePct: plannedSharePct,
    },
    {
      category: "unplanned",
      lostWorkdays: roundDays(input.unplannedLostWorkdays),
      absenceCount: input.unplannedAbsenceCount,
      sharePct: unplannedSharePct,
    },
  ];

  return {
    requirementCode: "HRM-AAT-012",
    periodStart: toIsoDate(input.periodStart),
    periodEnd: toIsoDate(input.periodEnd),
    totalLostWorkdays: roundDays(totalLostWorkdays),
    slices,
    plannedSharePct,
    unplannedSharePct,
  };
}

export function rankDimensionTrendRows(
  rows: readonly Omit<HrAatDimensionTrendRow, "rank">[],
): HrAatDimensionTrendRow[] {
  const sorted = [...rows].sort((left, right) => {
    if (right.absenceRatePct !== left.absenceRatePct) {
      return right.absenceRatePct - left.absenceRatePct;
    }
    return right.lostWorkdays - left.lostWorkdays;
  });

  return sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

export function buildWorkforceAvailabilityIndicators(input: {
  periodStart: Date;
  periodEnd: Date;
  totalHeadcount: number;
  onLeaveCount: number;
  absentCount: number;
}): HrAatWorkforceAvailabilityIndicators {
  const unavailableCount = input.onLeaveCount + input.absentCount;
  const availableCount = Math.max(input.totalHeadcount - unavailableCount, 0);
  const availabilityRatePct =
    input.totalHeadcount > 0
      ? roundPct((availableCount / input.totalHeadcount) * 100)
      : 100;

  return {
    requirementCode: "HRM-AAT-014",
    periodStart: toIsoDate(input.periodStart),
    periodEnd: toIsoDate(input.periodEnd),
    totalHeadcount: input.totalHeadcount,
    availableCount,
    unavailableCount,
    onLeaveCount: input.onLeaveCount,
    absentCount: input.absentCount,
    availabilityRatePct,
  };
}

export function evaluateCoverageRisk(input: {
  periodStart: Date;
  periodEnd: Date;
  totalHeadcount: number;
  unavailableCount: number;
  thresholdPct?: number;
}): HrAatCoverageRiskFlag {
  const thresholdPct = input.thresholdPct ?? DEFAULT_COVERAGE_RISK_THRESHOLD_PCT;
  const unavailableRatePct =
    input.totalHeadcount > 0
      ? roundPct((input.unavailableCount / input.totalHeadcount) * 100)
      : 0;

  const isAtRisk = unavailableRatePct >= thresholdPct;
  const riskLevel = resolveCoverageRiskLevel(unavailableRatePct, thresholdPct);
  const message = isAtRisk
    ? `Workforce coverage risk: ${unavailableRatePct}% unavailable (threshold ${thresholdPct}%).`
    : `Workforce coverage within threshold (${unavailableRatePct}% unavailable).`;

  return {
    requirementCode: "HRM-AAT-015",
    periodStart: toIsoDate(input.periodStart),
    periodEnd: toIsoDate(input.periodEnd),
    unavailableRatePct,
    thresholdPct,
    isAtRisk,
    riskLevel,
    message,
  };
}

export function buildHeatmapVizConfig(input: {
  rowAxis: HrAatHeatmapRowAxis;
  periodStart: Date;
  periodEnd: Date;
  cells: readonly HrAatHeatmapCell[];
}): HrAatHeatmapVizConfig {
  const maxValue =
    input.cells.length > 0
      ? Math.max(...input.cells.map((cell) => cell.value))
      : 0;

  return {
    rendererId: "aat-absence-heatmap",
    rowAxis: input.rowAxis,
    periodStart: toIsoDate(input.periodStart),
    periodEnd: toIsoDate(input.periodEnd),
    cells: input.cells,
    maxValue,
  };
}

export function buildHeatmapCells(
  entries: readonly {
    rowKey: string;
    rowLabel: string;
    colKey: string;
    colLabel: string;
    value: number;
  }[],
): HrAatHeatmapCell[] {
  const maxValue =
    entries.length > 0 ? Math.max(...entries.map((entry) => entry.value)) : 0;

  return entries.map((entry) => ({
    ...entry,
    value: roundDays(entry.value),
    intensity:
      maxValue > 0 ? roundPct((entry.value / maxValue) * 100) / 100 : 0,
  }));
}

export function computeTrendMovement(
  currentRatePct: number,
  priorRatePct: number,
  stableThresholdPct = DEFAULT_STABLE_THRESHOLD_PCT,
): HrAatTrendMovement {
  const delta = currentRatePct - priorRatePct;
  if (Math.abs(delta) <= stableThresholdPct) {
    return "stable";
  }
  return delta < 0 ? "improving" : "worsening";
}

export function buildTrendMovementRows(input: {
  dimension: HrAatComparisonDimension;
  periodStart: Date;
  periodEnd: Date;
  priorPeriodStart: Date;
  priorPeriodEnd: Date;
  stableThresholdPct?: number;
  currentRates: ReadonlyMap<string, { label: string; ratePct: number }>;
  priorRates: ReadonlyMap<string, { label: string; ratePct: number }>;
}): HrAatTrendMovementVizConfig {
  const stableThresholdPct =
    input.stableThresholdPct ?? DEFAULT_STABLE_THRESHOLD_PCT;
  const keys = new Set([
    ...input.currentRates.keys(),
    ...input.priorRates.keys(),
  ]);

  const rows: HrAatTrendMovementRow[] = [...keys].map((key) => {
    const current = input.currentRates.get(key);
    const prior = input.priorRates.get(key);
    const currentAbsenceRatePct = roundPct(current?.ratePct ?? 0);
    const priorAbsenceRatePct = roundPct(prior?.ratePct ?? 0);
    const deltaPctPoints = roundPct(
      currentAbsenceRatePct - priorAbsenceRatePct,
    );

    return {
      dimensionKey: key,
      dimensionLabel: current?.label ?? prior?.label ?? key,
      currentAbsenceRatePct,
      priorAbsenceRatePct,
      deltaPctPoints,
      movement: computeTrendMovement(
        currentAbsenceRatePct,
        priorAbsenceRatePct,
        stableThresholdPct,
      ),
    };
  });

  rows.sort((left, right) => right.deltaPctPoints - left.deltaPctPoints);

  return {
    rendererId: "aat-trend-movement",
    dimension: input.dimension,
    periodStart: toIsoDate(input.periodStart),
    periodEnd: toIsoDate(input.periodEnd),
    priorPeriodStart: toIsoDate(input.priorPeriodStart),
    priorPeriodEnd: toIsoDate(input.priorPeriodEnd),
    stableThresholdPct,
    rows,
  };
}

export function priorPeriodRange(periodStart: Date, periodEnd: Date): {
  priorPeriodStart: Date;
  priorPeriodEnd: Date;
} {
  const durationMs = periodEnd.getTime() - periodStart.getTime() + 86_400_000;
  const priorPeriodEnd = new Date(periodStart.getTime() - 86_400_000);
  const priorPeriodStart = new Date(priorPeriodEnd.getTime() - durationMs + 86_400_000);
  return { priorPeriodStart, priorPeriodEnd };
}

export function computeAbsenceRatePct(input: {
  absentDays: number;
  lostLeaveDays: number;
  headcount: number;
  workingDaysInPeriod: number;
}): number {
  if (input.headcount <= 0 || input.workingDaysInPeriod <= 0) {
    return 0;
  }
  const capacity = input.headcount * input.workingDaysInPeriod;
  const lost = input.absentDays + input.lostLeaveDays;
  return roundPct((lost / capacity) * 100);
}

function resolveCoverageRiskLevel(
  unavailableRatePct: number,
  thresholdPct: number,
): HrAatCoverageRiskLevel {
  if (unavailableRatePct >= thresholdPct * 1.5) {
    return "high_risk";
  }
  if (unavailableRatePct >= thresholdPct) {
    return "at_risk";
  }
  if (unavailableRatePct >= thresholdPct * 0.75) {
    return "watch";
  }
  return "normal";
}

function roundPct(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundDays(value: number): number {
  return Math.round(value * 100) / 100;
}

export const AAT_COMPARISON_VIZ_REQUIREMENT_CODES = [
  "HRM-AAT-012",
  "HRM-AAT-013",
  "HRM-AAT-014",
  "HRM-AAT-015",
  "HRM-AAT-016",
  "HRM-AAT-017",
] as const;
