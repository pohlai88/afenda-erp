import {
  createHrSbsCompensationAnalysisInTx,
  createHrSbsCpmRecommendationRefsInTx,
  listHrSbsCompensationAnalysesWindow,
  loadHrSbsAnalysisContextInTx,
  runWithOrganizationContext,
} from "@afenda/db";

import {
  buildCompensationAnalysisSnapshot,
  type SbsCompensationAnalysisSnapshot,
} from "./hr.payroll.sbs-calculations.shared";
import type { HrSbsRunAnalysisInput } from "../schemas/hr.payroll.sbs-analysis.schema";

function deriveBandAdjustmentIndicator(marketRatio: number | null): string | null {
  if (marketRatio == null) return null;
  if (marketRatio < 90) return "below_market_increase";
  if (marketRatio > 110) return "above_market_review";
  return "at_market_hold";
}

function deriveSuggestedAdjustmentPercent(marketRatio: number | null): number | null {
  if (marketRatio == null) return null;
  if (marketRatio >= 95 && marketRatio <= 105) return 0;
  return Math.round((100 - marketRatio) * 10) / 10;
}

export async function runHrSbsCompensationAnalysis(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrSbsRunAnalysisInput;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const context = await loadHrSbsAnalysisContextInTx(db, {
      organizationId: input.organizationId,
      benchmarkVersionId: input.payload.benchmarkVersionId,
      compensationCycleId: input.payload.compensationCycleId,
      employeeIds: input.payload.employeeIds,
    });

    const snapshot: SbsCompensationAnalysisSnapshot = buildCompensationAnalysisSnapshot({
      benchmarkVersionId: context.benchmarkVersionId,
      employees: context.employees,
      internalBandsByGrade: context.internalBandsByGrade,
      benchmarksByEmployeeId: context.benchmarksByEmployeeId,
      thresholds: input.payload.thresholds,
    });

    const persisted = await createHrSbsCompensationAnalysisInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      benchmarkVersionId: input.payload.benchmarkVersionId,
      compensationCycleId: input.payload.compensationCycleId,
      label: input.payload.label,
      thresholdConfig: snapshot.thresholds,
      snapshot,
      analyzedEmployeeCount: snapshot.analyzedEmployeeCount,
      flaggedBelowTargetCount: snapshot.flaggedBelowTargetCount,
      flaggedAboveRangeCount: snapshot.flaggedAboveRangeCount,
    });

    const recommendationCandidates = snapshot.employeeResults
      .filter((row) => row.belowTarget || row.aboveRange)
      .map((row) => ({
        employeeId: row.employeeId,
        marketPosition: row.marketPosition,
        marketRatio: row.marketRatio,
        suggestedAdjustmentPercent: deriveSuggestedAdjustmentPercent(row.marketRatio),
        bandAdjustmentIndicator: deriveBandAdjustmentIndicator(row.marketRatio),
      }));

    if (recommendationCandidates.length > 0) {
      await createHrSbsCpmRecommendationRefsInTx(db, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        analysisId: persisted.analysisId,
        benchmarkVersionId: input.payload.benchmarkVersionId,
        recommendations: recommendationCandidates,
      });
    }

    return {
      ...persisted,
      snapshot,
      recommendationCount: recommendationCandidates.length,
    };
  });
}

export async function listHrSbsCompensationAnalyses(input: {
  organizationId: string;
  page?: number;
  pageSize?: number;
  benchmarkVersionId?: string;
}) {
  return listHrSbsCompensationAnalysesWindow(input);
}
