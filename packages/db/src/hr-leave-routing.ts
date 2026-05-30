import type { HrLeaveType } from "./hr-leave-validation";

export type HrLeaveApprovalStage = "manager" | "hr" | "complete";

export type HrLeaveRoutingEmployeeContext = {
  employeeId: string;
  departmentId: string | null;
  grade: string | null;
  managerEmployeeId: string | null;
};

export type HrLeaveRoutingPolicy = {
  requireHrApprovalWhenDaysGte: number | null;
  requireHrApprovalLeaveTypes: readonly string[];
  managerChainMaxDepth: number;
};

export type HrLeaveApprovalRoute = {
  initialStage: HrLeaveApprovalStage;
  requiresHrStage: boolean;
  managerEmployeeIds: readonly string[];
  routingFactors: {
    departmentId: string | null;
    leaveType: HrLeaveType;
    durationDays: number;
    grade: string | null;
  };
};

export function buildManagerChain(input: {
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
  const cap = Math.min(Math.max(1, input.maxDepth), 5);

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

export function requiresHrApprovalStage(input: {
  leaveType: HrLeaveType;
  durationDays: number;
  policy: HrLeaveRoutingPolicy;
}): boolean {
  if (
    input.policy.requireHrApprovalLeaveTypes.includes(input.leaveType)
  ) {
    return true;
  }
  if (
    input.policy.requireHrApprovalWhenDaysGte !== null &&
    input.durationDays >= input.policy.requireHrApprovalWhenDaysGte
  ) {
    return true;
  }
  return false;
}

export function resolveLeaveApprovalRouteFromChain(input: {
  employee: HrLeaveRoutingEmployeeContext;
  leaveType: HrLeaveType;
  durationDays: number;
  policy: HrLeaveRoutingPolicy;
  managerEmployeeIds: readonly string[];
}): HrLeaveApprovalRoute {
  const requiresHr = requiresHrApprovalStage({
    leaveType: input.leaveType,
    durationDays: input.durationDays,
    policy: input.policy,
  });

  const initialStage: HrLeaveApprovalStage =
    input.managerEmployeeIds.length > 0
      ? "manager"
      : "hr";

  return {
    initialStage,
    requiresHrStage: requiresHr,
    managerEmployeeIds: input.managerEmployeeIds,
    routingFactors: {
      departmentId: input.employee.departmentId,
      leaveType: input.leaveType,
      durationDays: input.durationDays,
      grade: input.employee.grade,
    },
  };
}

export function resolveLeaveApprovalRoute(input: {
  employee: HrLeaveRoutingEmployeeContext;
  leaveType: HrLeaveType;
  durationDays: number;
  policy: HrLeaveRoutingPolicy;
  resolveManager: (
    managerEmployeeId: string,
  ) => { id: string; managerEmployeeId: string | null } | null;
}): HrLeaveApprovalRoute {
  const managerEmployeeIds = buildManagerChain({
    employeeId: input.employee.employeeId,
    managerEmployeeId: input.employee.managerEmployeeId,
    resolveManager: input.resolveManager,
    maxDepth: input.policy.managerChainMaxDepth,
  });

  return resolveLeaveApprovalRouteFromChain({
    employee: input.employee,
    leaveType: input.leaveType,
    durationDays: input.durationDays,
    policy: input.policy,
    managerEmployeeIds,
  });
}

export function nextStageAfterManagerApproval(input: {
  route: HrLeaveApprovalRoute;
}): HrLeaveApprovalStage {
  if (input.route.requiresHrStage) {
    return "hr";
  }
  return "complete";
}
