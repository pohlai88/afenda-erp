/** HRM-EXP-016/017 — pure expense approval routing (no I/O). */

export type HrExpenseApprovalStage =
  | "manager"
  | "finance"
  | "hr"
  | "exception"
  | "complete";

export type HrExpenseApproverKind =
  | "direct_manager"
  | "manager_chain"
  | "department_head"
  | "finance_pool"
  | "hr_owner"
  | "hr_pool"
  | "specific_user";

export type HrExpenseDecisionKind =
  | "approve"
  | "reject"
  | "return"
  | "request_clarification";

export type HrExpenseApprovalRouteRow = {
  id: string;
  policyGroupCode: string;
  name: string;
  priority: number;
  departmentId: string | null;
  costCenterCode: string | null;
  legalEntityCode: string | null;
  categoryCode: string | null;
  projectCode: string | null;
  minAmountCents: number | null;
  maxAmountCents: number | null;
  requiresPolicyException: boolean;
  approverKind: HrExpenseApproverKind;
  specificApproverAuthUserId: string | null;
  managerChainMaxDepth: number | null;
  active: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrExpenseRoutingEmployeeContext = {
  employeeId: string;
  departmentId: string | null;
  costCenterCode: string | null;
  legalEntityCode: string | null;
  managerEmployeeId: string | null;
  departmentHeadEmployeeId: string | null;
  hrOwnerEmployeeId: string | null;
};

export type HrExpenseRoutingClaimContext = {
  policyGroupCode: string;
  categoryCode: string;
  projectCode: string | null;
  amountCents: number;
  hasOpenPolicyException: boolean;
  asOf: Date;
};

export type HrExpenseRoutingPolicy = {
  requireFinanceSecondApproval: boolean;
  requireHrSecondApproval: boolean;
  managerChainMaxDepth: number;
};

export type HrExpenseApprovalSnapshot = {
  approvalStage: HrExpenseApprovalStage;
  routingRuleId: string | null;
  routingApproverKind: HrExpenseApproverKind | null;
  managerEmployeeIds: readonly string[];
  requiresFinanceSecondApproval: boolean;
  requiresHrSecondApproval: boolean;
};

export type HrExpenseResolvedApprovalRoute = {
  initialStage: HrExpenseApprovalStage;
  requiresFinanceSecondApproval: boolean;
  requiresHrSecondApproval: boolean;
  managerEmployeeIds: readonly string[];
  matchedRoute: HrExpenseApprovalRouteRow | null;
  snapshot: HrExpenseApprovalSnapshot;
};

const MAX_MANAGER_CHAIN_DEPTH = 5;

export function clampExpManagerChainDepth(depth: number): number {
  return Math.min(Math.max(1, Math.floor(depth)), MAX_MANAGER_CHAIN_DEPTH);
}

export function buildExpManagerChain(input: {
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
  const cap = clampExpManagerChainDepth(input.maxDepth);

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

export function expRouteSpecificityScore(
  route: HrExpenseApprovalRouteRow,
): number {
  let score = route.priority * 1_000;
  if (route.departmentId) score += 512;
  if (route.costCenterCode) score += 256;
  if (route.legalEntityCode) score += 128;
  if (route.categoryCode) score += 64;
  if (route.projectCode) score += 32;
  if (route.minAmountCents !== null) score += 16;
  if (route.maxAmountCents !== null) score += 8;
  if (route.requiresPolicyException) score += 4;
  return score;
}

/** HRM-EXP-017 — match routing by org dimensions and amount band. */
export function matchesExpApprovalRoute(
  route: HrExpenseApprovalRouteRow,
  context: HrExpenseRoutingClaimContext & {
    employee: HrExpenseRoutingEmployeeContext;
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
    route.legalEntityCode &&
    route.legalEntityCode !== context.employee.legalEntityCode
  ) {
    return false;
  }
  if (route.categoryCode && route.categoryCode !== context.categoryCode) {
    return false;
  }
  if (route.projectCode && route.projectCode !== context.projectCode) {
    return false;
  }
  if (
    route.minAmountCents !== null &&
    context.amountCents < route.minAmountCents
  ) {
    return false;
  }
  if (
    route.maxAmountCents !== null &&
    context.amountCents > route.maxAmountCents
  ) {
    return false;
  }
  if (route.requiresPolicyException && !context.hasOpenPolicyException) {
    return false;
  }
  return true;
}

export function pickHighestPriorityExpApprovalRoute(input: {
  routes: readonly HrExpenseApprovalRouteRow[];
  employee: HrExpenseRoutingEmployeeContext;
  claim: HrExpenseRoutingClaimContext;
}): HrExpenseApprovalRouteRow | null {
  const matching = input.routes
    .filter((route) =>
      matchesExpApprovalRoute(route, {
        ...input.claim,
        employee: input.employee,
      }),
    )
    .sort((a, b) => expRouteSpecificityScore(b) - expRouteSpecificityScore(a));
  return matching[0] ?? null;
}

export function resolveExpInitialApprovalStage(input: {
  managerEmployeeIds: readonly string[];
  requiresFinanceSecondApproval: boolean;
  requiresHrSecondApproval: boolean;
  hasOpenPolicyException: boolean;
}): HrExpenseApprovalStage {
  if (input.hasOpenPolicyException) {
    return "exception";
  }
  if (input.managerEmployeeIds.length > 0) {
    return "manager";
  }
  if (input.requiresFinanceSecondApproval) {
    return "finance";
  }
  if (input.requiresHrSecondApproval) {
    return "hr";
  }
  return "finance";
}

export function resolveExpApprovalRouteFromChain(input: {
  employee: HrExpenseRoutingEmployeeContext;
  claim: HrExpenseRoutingClaimContext;
  policy: HrExpenseRoutingPolicy;
  managerEmployeeIds: readonly string[];
  matchedRoute: HrExpenseApprovalRouteRow | null;
}): HrExpenseResolvedApprovalRoute {
  const chainDepth =
    input.matchedRoute?.managerChainMaxDepth ??
    input.policy.managerChainMaxDepth;
  const effectiveManagerIds = input.managerEmployeeIds.slice(
    0,
    clampExpManagerChainDepth(chainDepth),
  );
  const requiresFinanceSecondApproval =
    input.policy.requireFinanceSecondApproval;
  const requiresHrSecondApproval = input.policy.requireHrSecondApproval;
  const initialStage = resolveExpInitialApprovalStage({
    managerEmployeeIds: effectiveManagerIds,
    requiresFinanceSecondApproval,
    requiresHrSecondApproval,
    hasOpenPolicyException: input.claim.hasOpenPolicyException,
  });

  const snapshot: HrExpenseApprovalSnapshot = {
    approvalStage: initialStage,
    routingRuleId: input.matchedRoute?.id ?? null,
    routingApproverKind: input.matchedRoute?.approverKind ?? null,
    managerEmployeeIds: effectiveManagerIds,
    requiresFinanceSecondApproval,
    requiresHrSecondApproval,
  };

  return {
    initialStage,
    requiresFinanceSecondApproval,
    requiresHrSecondApproval,
    managerEmployeeIds: effectiveManagerIds,
    matchedRoute: input.matchedRoute,
    snapshot,
  };
}

export function nextExpStageAfterApproval(input: {
  currentStage: HrExpenseApprovalStage;
  requiresFinanceSecondApproval: boolean;
  requiresHrSecondApproval: boolean;
}): HrExpenseApprovalStage {
  switch (input.currentStage) {
    case "manager":
      if (input.requiresFinanceSecondApproval) {
        return "finance";
      }
      if (input.requiresHrSecondApproval) {
        return "hr";
      }
      return "complete";
    case "finance":
      if (input.requiresHrSecondApproval) {
        return "hr";
      }
      return "complete";
    case "exception":
      if (input.requiresFinanceSecondApproval) {
        return "finance";
      }
      if (input.requiresHrSecondApproval) {
        return "hr";
      }
      return "complete";
    case "hr":
      return "complete";
    default:
      return "complete";
  }
}

/** HRM-EXP-019 — reject and clarification require non-empty reasons. */
export function assertExpDecisionReason(input: {
  decision: HrExpenseDecisionKind;
  reason?: string | null;
}): string | null {
  const trimmed = input.reason?.trim() ?? "";
  if (input.decision === "reject") {
    if (!trimmed) {
      throw new Error("decision_reason_required");
    }
    return trimmed;
  }
  if (
    (input.decision === "return" ||
      input.decision === "request_clarification") &&
    !trimmed
  ) {
    throw new Error("decision_reason_required");
  }
  return trimmed || null;
}

export function resolveExpSubmissionApprovers(input: {
  route: HrExpenseResolvedApprovalRoute;
  stage: HrExpenseApprovalStage;
  resolveAuthUserIdForEmployee: (employeeId: string) => string | null;
  financePoolAuthUserIds: readonly string[];
  hrPoolAuthUserIds: readonly string[];
}): readonly string[] {
  const matched = input.route.matchedRoute;
  const kind = matched?.approverKind ?? "manager_chain";

  if (input.stage === "finance") {
    return [...input.financePoolAuthUserIds];
  }
  if (input.stage === "hr" || input.stage === "exception") {
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
      const headId = input.route.managerEmployeeIds[0];
      void headId;
      return [];
    }
    case "finance_pool":
      return [...input.financePoolAuthUserIds];
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
