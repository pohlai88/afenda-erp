import type {
  HrSuccessionIntegrationQuery,
  HrSuccessionLifecycleRecommendationRef,
  HrSuccessionRiskExposureRef,
} from "../contracts/hr.talent.succession-integration.contract";
import {
  getHrSuccessionStore,
  listApprovedSuccessionRecommendationsForLifecycle,
  listHrSuccessionRiskExposures,
} from "./hr.talent.succession-store.shared";

/** HRM-SUC-027 — approved recommendations exposed to Employee Lifecycle. */
export async function listSuccessionRecommendationsForLifecycle(
  query: HrSuccessionIntegrationQuery,
): Promise<readonly HrSuccessionLifecycleRecommendationRef[]> {
  const store = getHrSuccessionStore(query.organizationId);
  const recommendations = listApprovedSuccessionRecommendationsForLifecycle({
    store,
    authorized: query.lifecycleAuthorized === true,
    limit: query.limit,
  });
  const successorById = new Map(
    store.successors.map((successor) => [successor.id, successor]),
  );

  return recommendations.map((recommendation) => ({
    organizationId: recommendation.organizationId,
    recommendationId: recommendation.id,
    criticalRoleId: recommendation.criticalRoleId,
    successorNominationId: recommendation.successorNominationId,
    employeeId: recommendation.employeeId,
    employeeDisplayName: recommendation.employeeDisplayName,
    targetRoleTitle: recommendation.targetRoleTitle,
    movementType: recommendation.movementType,
    readinessLevel:
      successorById.get(recommendation.successorNominationId)?.readinessLevel ??
      "future_potential",
    approvalReference: recommendation.approvalReference,
    approvedAt: recommendation.approvedAt,
  }));
}

export async function listSuccessionRiskExposures(
  query: HrSuccessionIntegrationQuery,
): Promise<readonly HrSuccessionRiskExposureRef[]> {
  return listHrSuccessionRiskExposures({
    store: getHrSuccessionStore(query.organizationId),
    authorized: query.riskAuthorized === true,
    limit: query.limit,
  });
}
