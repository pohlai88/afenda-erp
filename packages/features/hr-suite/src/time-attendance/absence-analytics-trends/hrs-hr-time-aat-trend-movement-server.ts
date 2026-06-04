import {
  buildTrendMovementRows,
  hrAatTrendMovementQuerySchema,
  priorPeriodRange,
  type HrAatTrendMovementResult,
} from "./hr.time.aat-comparison.schema";
import { loadHrAatDimensionAbsenceRates } from "./hrs-hr-time-aat-comparison-server";

/** HRM-AAT-017 — trend movement indicators (improving / worsening / stable). */
export async function loadHrAatTrendMovementIndicators(
  input: unknown,
): Promise<HrAatTrendMovementResult> {
  const query = hrAatTrendMovementQuerySchema.parse(input);
  const { priorPeriodStart, priorPeriodEnd } = priorPeriodRange(
    query.periodStart,
    query.periodEnd,
  );

  const [currentRates, priorRates] = await Promise.all([
    loadHrAatDimensionAbsenceRates({
      organizationId: query.organizationId,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
      dimension: query.dimension,
    }),
    loadHrAatDimensionAbsenceRates({
      organizationId: query.organizationId,
      periodStart: priorPeriodStart,
      periodEnd: priorPeriodEnd,
      dimension: query.dimension,
    }),
  ]);

  const viz = buildTrendMovementRows({
    dimension: query.dimension,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    priorPeriodStart,
    priorPeriodEnd,
    stableThresholdPct: query.stableThresholdPct,
    currentRates,
    priorRates,
  });

  const limitedRows =
    query.limit !== undefined ? viz.rows.slice(0, query.limit) : viz.rows;

  return {
    requirementCode: "HRM-AAT-017",
    viz: {
      ...viz,
      rows: limitedRows,
    },
  };
}
