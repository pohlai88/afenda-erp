"use server";

import {
  assignEligibleEmployeesToCycleInStore,
  createPerformanceReviewCycleInStore,
} from "../data/hr.talent.performance-store.shared";
import { hrPerCycleSchema } from "../schemas/hr.talent.performance.schema";
import {
  requireHrPerformanceRead,
  requireHrPerformanceWrite,
} from "../policies/hr.talent.performance-access.policy.server";

export async function createPerformanceReviewCycleAction(input: unknown) {
  const guard = await requireHrPerformanceWrite();
  const parsed = hrPerCycleSchema.parse({
    ...(typeof input === "object" && input ? input : {}),
    organizationId: guard.organization.id,
  });

  return createPerformanceReviewCycleInStore(parsed);
}

export async function assignEligiblePerformanceReviewsAction(input: {
  cycleId: string;
  asOfDate?: string;
}) {
  const guard = await requireHrPerformanceWrite();
  return assignEligibleEmployeesToCycleInStore({
    organizationId: guard.organization.id,
    cycleId: input.cycleId,
    asOfDate: input.asOfDate,
  });
}

export async function exportPerformanceReportAction() {
  const guard = await requireHrPerformanceRead();
  return {
    organizationId: guard.organization.id,
    exportedAt: new Date().toISOString(),
  };
}
