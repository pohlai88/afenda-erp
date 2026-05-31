/** HRM-OTM-015/016 — pure overtime approval routing (no I/O). */

export type HrOvertimeApprovalStage = "manager" | "hr" | "complete";

export type HrOvertimeApproverKind =
  | "direct_manager"
  | "manager_chain"
  | "department_head"
  | "hr_owner"
  | "hr_pool"
  | "specific_user";

export type HrOvertimeApprovalRouteRow = {
  id: string;
  policyGroupCode: string;
  name: string;
  priority: number;
  departmentId: string | null;
  costCenterCode: string | null;
  workLocationCode: string | null;
  grade: string | null;
  minEstimatedAmountCents: number | null;
  maxEstimatedAmountCents: number | null;
  requiresEligibilityException: boolean;
  requiresPolicyException: boolean;
  approverKind: HrOvertimeApproverKind;
  specificApproverAuthUserId: string | null;
  managerChainMaxDepth: number | null;
  active: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrOvertimeRoutingEmployeeContext = {
  employeeId: string;
  departmentId: string | null;
  costCenterCode: string | null;
  workLocationCode: string | null;
  grade: string | null;
  managerEmployeeId: string | null;
  departmentHeadEmployeeId: string | null;
  hrOwnerEmployeeId: string | null;
};

export type HrOvertimeRoutingRequestContext = {
  policyGroupCode: string;
  estimatedAmountCents: number;
  hasEligibilityException: boolean;
  hasOpenPolicyException: boolean;
  asOf: Date;
};

export type HrOvertimeRoutingPolicy = {
  requireHrSecondApproval: boolean;
  managerChainMaxDepth: number;
};

export type HrOvertimeApprovalSnapshot = {
  approvalStage: HrOvertimeApprovalStage;
  routingRuleId: string | null;
  routingApproverKind: HrOvertimeApproverKind | null;
  managerEmployeeIds: readonly string[];
  requiresHrSecondApproval: boolean;
};

export type HrOvertimeResolvedApprovalRoute = {
  initialStage: HrOvertimeApprovalStage;
  requiresHrSecondApproval: boolean;
  managerEmployeeIds: readonly string[];
  matchedRoute: HrOvertimeApprovalRouteRow | null;
  snapshot: HrOvertimeApprovalSnapshot;
};

export type HrOvertimeDecisionKind = "approve" | "reject" | "return" | "adjust";

const MAX_MANAGER_CHAIN_DEPTH = 5;

export function clampOtmManagerChainDepth(depth: number): number {
  return Math.min(Math.max(1, Math.floor(depth)), MAX_MANAGER_CHAIN_DEPTH);
}

export function buildOtmManagerChain(input: {
  employeeId: string;
  managerEmployeeId: string | null;
  resolveManager: (
    managerEmployeeId: string,
  ) => { id: string; managerEmployeeId: string | null } | null;
  maxDepth: number;
}): readonly string[] {
  const chain: string[] = [];
  const visited = new Set<string>([input.employeeId]);
  let cursor = input.managerEmployeeId;
  let depth = 0;
  const cap = clampOtmManagerChainDepth(input.maxDepth);

  while (cursor && depth < cap) {
    if (visited.has(cursor)) {
      break;
    }
    visited.add(cursor);
    chain.push(cursor);
    const manager = input.resolveManager(cursor);
    cursor = manager?.managerEmployeeId ?? null;
    depth += 1;
  }

  return chain;
}

export function otmRouteSpecificityScore(
  route: HrOvertimeApprovalRouteRow,
): number {
  let score = route.priority * 1_000;
  if (route.departmentId) score += 512;
  if (route.costCenterCode) score += 256;
  if (route.workLocationCode) score += 128;
  if (route.grade) score += 64;
  if (route.minEstimatedAmountCents !== null) score += 32;
  if (route.maxEstimatedAmountCents !== null) score += 16;
  if (route.requiresEligibilityException) score += 8;
  if (route.requiresPolicyException) score += 4;
  return score;
}

export function matchesOtmApprovalRoute(
  route: HrOvertimeApprovalRouteRow,
  context: HrOvertimeRoutingRequestContext & {
    employee: HrOvertimeRoutingEmployeeContext;
  },
): boolean {
  if (!route.active) {
    return false;
  }
  if (route.policyGroupCode !== context.policyGroupCode) {
    return false;
  }
  if (route.effectiveFrom.getTime() > context.asOf.getTime()) {
    return false;
  }
  if (route.effectiveTo && route.effectiveTo.getTime() < context.asOf.getTime()) {
    return false;
  }
  if (route.departmentId && route.departmentId !== context.employee.departmentId) {
    return false;
  }
  if (
    route.costCenterCode &&
    route.costCenterCode !== context.employee.costCenterCode
  ) {
    return false;
  }
  if (
    route.workLocationCode &&
    route.workLocationCode !== context.employee.workLocationCode
  ) {
    return false;
  }
  if (route.grade && route.grade !== context.employee.grade) {
    return false;
  }
  if (
    route.minEstimatedAmountCents !== null &&
    context.estimatedAmountCents < route.minEstimatedAmountCents
  ) {
    return false;
  }
  if (
    route.maxEstimatedAmountCents !== null &&
    context.estimatedAmountCents > route.maxEstimatedAmountCents
  ) {
    return false;
  }
  if (route.requiresEligibilityException && !context.hasEligibilityException) {
    return false;
  }
  if (route.requiresPolicyException && !context.hasOpenPolicyException) {
    return false;
  }
  return true;
}

/** HRM-OTM-016 — pick highest-priority matching routing rule. */
export function pickHighestPriorityOtmApprovalRoute(input: {
  routes: readonly HrOvertimeApprovalRouteRow[];
  employee: HrOvertimeRoutingEmployeeContext;
  request: HrOvertimeRoutingRequestContext;
}): HrOvertimeApprovalRouteRow | null {
  const matching = input.routes
    .filter((route) =>
      matchesOtmApprovalRoute(route, {
        ...input.request,
        employee: input.employee,
      }),
    )
    .sort(
      (a, b) => otmRouteSpecificityScore(b) - otmRouteSpecificityScore(a),
    );
  return matching[0] ?? null;
}

export function resolveOtmInitialApprovalStage(input: {
  managerEmployeeIds: readonly string[];
  requiresHrSecondApproval: boolean;
}): HrOvertimeApprovalStage {
  if (input.requiresHrSecondApproval && input.managerEmployeeIds.length > 0) {
    return "manager";
  }
  if (input.requiresHrSecondApproval) {
    return "hr";
  }
  if (input.managerEmployeeIds.length > 0) {
    return "manager";
  }
  return "hr";
}

export function resolveOtmApprovalRouteFromChain(input: {
  employee: HrOvertimeRoutingEmployeeContext;
  request: HrOvertimeRoutingRequestContext;
  policy: HrOvertimeRoutingPolicy;
  managerEmployeeIds: readonly string[];
  matchedRoute: HrOvertimeApprovalRouteRow | null;
}): HrOvertimeResolvedApprovalRoute {
  const chainDepth =
    input.matchedRoute?.managerChainMaxDepth ??
    input.policy.managerChainMaxDepth;
  const effectiveManagerIds = input.managerEmployeeIds.slice(
    0,
    clampOtmManagerChainDepth(chainDepth),
  );
  const requiresHrSecondApproval = input.policy.requireHrSecondApproval;
  const initialStage = resolveOtmInitialApprovalStage({
    managerEmployeeIds: effectiveManagerIds,
    requiresHrSecondApproval,
  });

  const snapshot: HrOvertimeApprovalSnapshot = {
    approvalStage: initialStage,
    routingRuleId: input.matchedRoute?.id ?? null,
    routingApproverKind: input.matchedRoute?.approverKind ?? null,
    managerEmployeeIds: effectiveManagerIds,
    requiresHrSecondApproval,
  };

  return {
    initialStage,
    requiresHrSecondApproval,
    managerEmployeeIds: effectiveManagerIds,
    matchedRoute: input.matchedRoute,
    snapshot,
  };
}

export function nextOtmStageAfterManagerApproval(input: {
  requiresHrSecondApproval: boolean;
}): HrOvertimeApprovalStage {
  return input.requiresHrSecondApproval ? "hr" : "complete";
}

/** HRM-OTM-018 — reject and adjust require non-empty reasons. */
export function assertOtmDecisionReason(input: {
  decision: HrOvertimeDecisionKind;
  reason?: string | null;
}): string | null {
  const trimmed = input.reason?.trim() ?? "";
  if (input.decision === "reject" || input.decision === "adjust") {
    if (!trimmed) {
      throw new Error("decision_reason_required");
    }
    return trimmed;
  }
  if (input.decision === "return" && !trimmed) {
    throw new Error("return_reason_required");
  }
  return trimmed || null;
}

export function resolveOtmSubmissionApprovers(input: {
  route: HrOvertimeResolvedApprovalRoute;
  stage: HrOvertimeApprovalStage;
  resolveAuthUserIdForEmployee: (employeeId: string) => string | null;
  hrPoolAuthUserIds: readonly string[];
}): readonly string[] {
  const matched = input.route.matchedRoute;
  const kind = matched?.approverKind ?? "manager_chain";

  if (input.stage === "hr") {
    return [...input.hrPoolAuthUserIds];
  }

  switch (kind) {
    case "direct_manager": {
      const managerId = input.route.managerEmployeeIds[0];
      if (!managerId) return [];
      const authUserId = input.resolveAuthUserIdForEmployee(managerId);
      return authUserId ? [authUserId] : [];
    }
    case "manager_chain":
      return input.route.managerEmployeeIds
        .map((id) => input.resolveAuthUserIdForEmployee(id))
        .filter((id): id is string => Boolean(id));
    case "department_head": {
      const headId = input.route.snapshot.managerEmployeeIds[0];
      void headId;
      return [];
    }
    case "hr_owner":
    case "hr_pool":
      return [...input.hrPoolAuthUserIds];
    case "specific_user":
      return matched?.specificApproverAuthUserId
        ? [matched.specificApproverAuthUserId]
        : [];
    default:
      return input.route.managerEmployeeIds
        .map((id) => input.resolveAuthUserIdForEmployee(id))
        .filter((id): id is string => Boolean(id));
  }
}
