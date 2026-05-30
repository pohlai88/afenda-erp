import {
  listHrFwaPolicyGroups,
  resolveHrFwaApprovalRoute as resolveHrFwaApprovalRouteFromDb,
  submitHrFwaRequest,
  type HrFwaArrangementKind,
  type HrFwaApprovalRoute,
} from "@afenda/db";

import {
  computeHrFwaDurationDays,
  DEFAULT_HR_FWA_ROUTING_POLICY,
  resolveHrFwaApprovalRoute,
  type HrFwaResolvedApprovalRoute,
  type HrFwaRoutingEmployeeContext,
  type HrFwaRoutingPolicy,
} from "../policies/hr.time.fwa-routing.policy.server";

export type { HrFwaApprovalRoute, HrFwaResolvedApprovalRoute };

export async function resolveHrFwaWorkflowRoute(input: {
  organizationId: string;
  employee: HrFwaRoutingEmployeeContext;
  policyGroupCode?: string;
  startDate: Date;
  endDate?: Date | null;
  remoteLocationCountryCode?: string | null;
  exceptionRequested?: boolean;
  resolveManager?: (
    managerEmployeeId: string,
  ) => { id: string; managerEmployeeId: string | null } | null;
}): Promise<HrFwaResolvedApprovalRoute> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  const durationDays = computeHrFwaDurationDays({
    startDate: input.startDate,
    endDate: input.endDate,
  });

  const policyGroups = await listHrFwaPolicyGroups({
    organizationId: input.organizationId,
    activeOnly: true,
  });
  const policyGroup =
    policyGroups.find((group) => group.code === policyGroupCode) ?? null;

  const routingPolicy: HrFwaRoutingPolicy = {
    ...DEFAULT_HR_FWA_ROUTING_POLICY,
    requireHrApproval: policyGroup?.requireHrApproval ?? true,
    requireDepartmentApproval: policyGroup?.requireDepartmentApproval ?? false,
    allowExceptionApproval: policyGroup?.allowExceptionApproval ?? true,
  };

  if (input.resolveManager) {
    return resolveHrFwaApprovalRoute({
      employee: input.employee,
      request: {
        durationDays,
        remoteLocationCountryCode: input.remoteLocationCountryCode ?? null,
        exceptionRequested: input.exceptionRequested ?? false,
      },
      policy: routingPolicy,
      resolveManager: input.resolveManager,
    });
  }

  const dbRoute = await resolveHrFwaApprovalRouteFromDb({
    organizationId: input.organizationId,
    employeeId: input.employee.employeeId,
    policyGroupCode,
    exceptionRequested: input.exceptionRequested,
  });

  return {
    ...dbRoute,
    routingFactors: {
      departmentId: input.employee.departmentId,
      legalEntityCode: input.employee.legalEntityCode,
      roleCode: input.employee.roleCode,
      durationDays,
      remoteLocationCountryCode: input.remoteLocationCountryCode ?? null,
      exceptionRequested: input.exceptionRequested ?? false,
    },
  };
}

export async function submitHrFwaWorkflowRequest(input: {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKind;
  startDate: Date;
  endDate?: Date | null;
  reason?: string | null;
  policyGroupCode?: string;
  initiatorKind?: "employee" | "manager" | "hr";
  initiatorEmployeeId?: string | null;
  initiatorAuthUserId?: string | null;
  schedulePatternId?: string | null;
  remoteLocationId?: string | null;
  supportingDocumentId?: string | null;
  exceptionRequested?: boolean;
}): Promise<{ requestId: string }> {
  return submitHrFwaRequest(input);
}
