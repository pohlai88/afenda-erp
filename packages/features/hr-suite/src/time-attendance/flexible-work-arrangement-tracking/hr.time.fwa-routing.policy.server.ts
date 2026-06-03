import type { HrFwaApprovalRoute } from "@afenda/db";

export type HrFwaApprovalStageKind =
  | "manager"
  | "hr"
  | "department"
  | "exception";

export type HrFwaRoutingPolicy = {
  requireHrApproval: boolean;
  requireDepartmentApproval: boolean;
  allowExceptionApproval: boolean;
  requireHrApprovalWhenDurationDaysGte: number | null;
  requireHrApprovalRoleCodes: readonly string[];
  requireHrApprovalLegalEntityCodes: readonly string[];
  requireExceptionWhenCrossBorderRemote: boolean;
  managerChainMaxDepth: number;
};

export type HrFwaRoutingEmployeeContext = {
  employeeId: string;
  departmentId: string | null;
  legalEntityCode: string | null;
  countryCode: string | null;
  workLocationCode: string | null;
  roleCode: string | null;
  managerEmployeeId: string | null;
};

export type HrFwaRoutingRequestContext = {
  durationDays: number;
  remoteLocationCountryCode: string | null;
  exceptionRequested: boolean;
};

export type HrFwaRoutingFactors = {
  departmentId: string | null;
  legalEntityCode: string | null;
  roleCode: string | null;
  durationDays: number;
  remoteLocationCountryCode: string | null;
  exceptionRequested: boolean;
};

export type HrFwaResolvedApprovalRoute = HrFwaApprovalRoute & {
  routingFactors: HrFwaRoutingFactors;
};

export const DEFAULT_HR_FWA_ROUTING_POLICY: HrFwaRoutingPolicy = {
  requireHrApproval: true,
  requireDepartmentApproval: false,
  allowExceptionApproval: true,
  requireHrApprovalWhenDurationDaysGte: 90,
  requireHrApprovalRoleCodes: [],
  requireHrApprovalLegalEntityCodes: [],
  requireExceptionWhenCrossBorderRemote: true,
  managerChainMaxDepth: 3,
};

export function buildHrFwaManagerChain(input: {
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

export function requiresHrFwaApprovalStage(input: {
  employee: HrFwaRoutingEmployeeContext;
  request: HrFwaRoutingRequestContext;
  policy: HrFwaRoutingPolicy;
}): boolean {
  if (input.policy.requireHrApproval) {
    return true;
  }
  if (
    input.policy.requireHrApprovalWhenDurationDaysGte !== null &&
    input.request.durationDays >= input.policy.requireHrApprovalWhenDurationDaysGte
  ) {
    return true;
  }
  if (
    input.employee.roleCode &&
    input.policy.requireHrApprovalRoleCodes.includes(input.employee.roleCode)
  ) {
    return true;
  }
  if (
    input.employee.legalEntityCode &&
    input.policy.requireHrApprovalLegalEntityCodes.includes(
      input.employee.legalEntityCode,
    )
  ) {
    return true;
  }
  if (
    input.policy.requireExceptionWhenCrossBorderRemote &&
    input.employee.countryCode &&
    input.request.remoteLocationCountryCode &&
    input.employee.countryCode !== input.request.remoteLocationCountryCode
  ) {
    return true;
  }
  return false;
}

export function requiresHrFwaExceptionStage(input: {
  request: HrFwaRoutingRequestContext;
  policy: HrFwaRoutingPolicy;
}): boolean {
  return input.request.exceptionRequested && input.policy.allowExceptionApproval;
}

export function resolveHrFwaApprovalRouteFromChain(input: {
  employee: HrFwaRoutingEmployeeContext;
  request: HrFwaRoutingRequestContext;
  policy: HrFwaRoutingPolicy;
  managerEmployeeIds: readonly string[];
}): HrFwaResolvedApprovalRoute {
  const requiresExceptionStage = requiresHrFwaExceptionStage({
    request: input.request,
    policy: input.policy,
  });
  const requiresHrStage = requiresHrFwaApprovalStage({
    employee: input.employee,
    request: input.request,
    policy: input.policy,
  });
  const requiresDepartmentStage = input.policy.requireDepartmentApproval;

  let initialStage: HrFwaApprovalStageKind = "manager";
  if (requiresExceptionStage) {
    initialStage = "exception";
  } else if (input.managerEmployeeIds.length === 0 && requiresDepartmentStage) {
    initialStage = "department";
  } else if (input.managerEmployeeIds.length === 0 && requiresHrStage) {
    initialStage = "hr";
  }

  return {
    initialStage,
    requiresHrStage,
    requiresDepartmentStage,
    requiresExceptionStage,
    managerEmployeeIds: input.managerEmployeeIds,
    routingFactors: {
      departmentId: input.employee.departmentId,
      legalEntityCode: input.employee.legalEntityCode,
      roleCode: input.employee.roleCode,
      durationDays: input.request.durationDays,
      remoteLocationCountryCode: input.request.remoteLocationCountryCode,
      exceptionRequested: input.request.exceptionRequested,
    },
  };
}

export function resolveHrFwaApprovalRoute(input: {
  employee: HrFwaRoutingEmployeeContext;
  request: HrFwaRoutingRequestContext;
  policy?: HrFwaRoutingPolicy;
  resolveManager: (
    managerEmployeeId: string,
  ) => { id: string; managerEmployeeId: string | null } | null;
}): HrFwaResolvedApprovalRoute {
  const policy = input.policy ?? DEFAULT_HR_FWA_ROUTING_POLICY;
  const managerEmployeeIds = buildHrFwaManagerChain({
    employeeId: input.employee.employeeId,
    managerEmployeeId: input.employee.managerEmployeeId,
    resolveManager: input.resolveManager,
    maxDepth: policy.managerChainMaxDepth,
  });

  return resolveHrFwaApprovalRouteFromChain({
    employee: input.employee,
    request: input.request,
    policy,
    managerEmployeeIds,
  });
}

export function computeHrFwaDurationDays(input: {
  startDate: Date;
  endDate?: Date | null;
}): number {
  if (!input.endDate) {
    return 1;
  }
  const msPerDay = 86_400_000;
  const diff = Math.max(
    0,
    input.endDate.getTime() - input.startDate.getTime(),
  );
  return Math.max(1, Math.ceil(diff / msPerDay));
}
