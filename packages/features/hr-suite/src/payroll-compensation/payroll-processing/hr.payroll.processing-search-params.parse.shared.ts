export const hrPayrollCyclesSearchParam = "payrollCyclesSearch";
export const hrPayrollPayGroupsSearchParam = "payrollPayGroupsSearch";
export const hrPayrollAssignmentsSearchParam = "payrollAssignmentsSearch";
export const hrPayrollRunsSearchParam = "payrollRunsSearch";
export const hrPayrollPayslipsSearchParam = "payrollPayslipsSearch";
export const hrPayrollPaymentsSearchParam = "payrollPaymentsSearch";
export const hrPayrollAuditSearchParam = "payrollAuditSearch";

export const hrPayrollCyclesSurfaceKey = "hr.payroll.processing.cycles.list";
export const hrPayrollPayGroupsSurfaceKey = "hr.payroll.processing.pay_groups.list";
export const hrPayrollAssignmentsSurfaceKey = "hr.payroll.processing.assignments.list";
export const hrPayrollRunsSurfaceKey = "hr.payroll.processing.runs.list";
export const hrPayrollPayslipsSurfaceKey = "hr.payroll.processing.payslips.list";
export const hrPayrollPaymentsSurfaceKey = "hr.payroll.processing.payments.list";
export const hrPayrollAuditSurfaceKey = "hr.payroll.processing.audit.list";

export const HR_PAYROLL_LIST_SURFACE_KEYS = [
  hrPayrollCyclesSurfaceKey,
  hrPayrollPayGroupsSurfaceKey,
  hrPayrollAssignmentsSurfaceKey,
  hrPayrollRunsSurfaceKey,
  hrPayrollPayslipsSurfaceKey,
  hrPayrollPaymentsSurfaceKey,
  hrPayrollAuditSurfaceKey,
] as const;

export type HrPayrollListSurfaceKey = (typeof HR_PAYROLL_LIST_SURFACE_KEYS)[number];

export const HR_PAYROLL_LIST_SURFACE_COLUMNS_BY_KEY = Object.fromEntries(
  HR_PAYROLL_LIST_SURFACE_KEYS.map((key) => [key, key]),
) as Record<HrPayrollListSurfaceKey, HrPayrollListSurfaceKey>;

export const HR_PAYROLL_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrPayrollCyclesSurfaceKey]: hrPayrollCyclesSearchParam,
  [hrPayrollPayGroupsSurfaceKey]: hrPayrollPayGroupsSearchParam,
  [hrPayrollAssignmentsSurfaceKey]: hrPayrollAssignmentsSearchParam,
  [hrPayrollRunsSurfaceKey]: hrPayrollRunsSearchParam,
  [hrPayrollPayslipsSurfaceKey]: hrPayrollPayslipsSearchParam,
  [hrPayrollPaymentsSurfaceKey]: hrPayrollPaymentsSearchParam,
  [hrPayrollAuditSurfaceKey]: hrPayrollAuditSearchParam,
} as const;

export const HR_PAYROLL_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrPayrollCyclesSearchParam]: "cyclesSearch",
  [hrPayrollPayGroupsSearchParam]: "payGroupsSearch",
  [hrPayrollAssignmentsSearchParam]: "assignmentsSearch",
  [hrPayrollRunsSearchParam]: "runsSearch",
  [hrPayrollPayslipsSearchParam]: "payslipsSearch",
  [hrPayrollPaymentsSearchParam]: "paymentsSearch",
  [hrPayrollAuditSearchParam]: "auditSearch",
} as const;

export const HR_PAYROLL_WORKBENCH_READ_ONLY_SURFACE_KEYS = [
  hrPayrollAuditSurfaceKey,
] as const;

export function getHrPayrollListSurfaceKeys() {
  return HR_PAYROLL_LIST_SURFACE_KEYS;
}

export type HrPayrollSearchParams = {
  cyclesSearch?: string;
  payGroupsSearch?: string;
  assignmentsSearch?: string;
  runsSearch?: string;
  payslipsSearch?: string;
  paymentsSearch?: string;
  auditSearch?: string;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseHrPayrollSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrPayrollSearchParams {
  if (!searchParams) {
    return {};
  }

  return {
    cyclesSearch: readSearchParam(searchParams, hrPayrollCyclesSearchParam),
    payGroupsSearch: readSearchParam(searchParams, hrPayrollPayGroupsSearchParam),
    assignmentsSearch: readSearchParam(searchParams, hrPayrollAssignmentsSearchParam),
    runsSearch: readSearchParam(searchParams, hrPayrollRunsSearchParam),
    payslipsSearch: readSearchParam(searchParams, hrPayrollPayslipsSearchParam),
    paymentsSearch: readSearchParam(searchParams, hrPayrollPaymentsSearchParam),
    auditSearch: readSearchParam(searchParams, hrPayrollAuditSearchParam),
  };
}

export function toHrPayrollPageModelInput(input: {
  organizationId: string;
  actorUserId: string;
  canWrite: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrPayrollSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    canWrite: input.canWrite,
    ...parsed,
  };
}

export function toHrPayrollAuditPageModelInput(input: {
  organizationId: string;
  actorUserId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrPayrollSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    auditSearch: parsed.auditSearch,
  };
}
