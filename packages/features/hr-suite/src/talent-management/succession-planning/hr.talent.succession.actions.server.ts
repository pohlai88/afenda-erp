"use server";

import {
  createHrSuccessionCriticalRole,
  getHrSuccessionStore,
  listApprovedSuccessionRecommendationsForLifecycle,
  nominateHrSuccessionSuccessor,
  recordHrSuccessionCalibrationReview,
} from "./hr.talent.succession-store.shared";
import {
  hrSuccessionCalibrationReviewSchema,
  hrSuccessionCriticalRoleSchema,
  hrSuccessionSuccessorNominationSchema,
} from "./hr.talent.succession.schema";
import {
  requireHrSuccessionApprove,
  requireHrSuccessionRead,
  requireHrSuccessionWrite,
} from "./hr.talent.succession-access.policy.server";

export async function createHrSuccessionCriticalRoleAction(input: unknown) {
  const guard = await requireHrSuccessionWrite();
  return createHrSuccessionCriticalRole(
    hrSuccessionCriticalRoleSchema.parse({
      ...(typeof input === "object" && input ? input : {}),
      organizationId: guard.organization.id,
    }),
  );
}

export async function nominateHrSuccessionSuccessorAction(input: unknown) {
  const guard = await requireHrSuccessionWrite();
  return nominateHrSuccessionSuccessor(
    hrSuccessionSuccessorNominationSchema.parse({
      ...(typeof input === "object" && input ? input : {}),
      organizationId: guard.organization.id,
    }),
  );
}

export async function recordHrSuccessionCalibrationReviewAction(input: unknown) {
  const guard = await requireHrSuccessionApprove();
  return recordHrSuccessionCalibrationReview(
    hrSuccessionCalibrationReviewSchema.parse({
      ...(typeof input === "object" && input ? input : {}),
      organizationId: guard.organization.id,
    }),
  );
}

export async function exportHrSuccessionLifecycleRecommendationsAction() {
  const guard = await requireHrSuccessionRead();
  return {
    organizationId: guard.organization.id,
    exportedAt: new Date().toISOString(),
    rows: listApprovedSuccessionRecommendationsForLifecycle({
      store: getHrSuccessionStore(guard.organization.id),
      authorized: guard.canExposeLifecycle,
    }),
  };
}
