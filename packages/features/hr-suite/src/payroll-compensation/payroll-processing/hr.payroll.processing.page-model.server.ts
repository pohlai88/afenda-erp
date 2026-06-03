import {
  listHrPayrollAuditTrail,
  listHrPayrollCycles,
  listHrPayrollEmployeeAssignments,
  listHrPayrollPaymentBatches,
  listHrPayrollPayGroups,
  listHrPayrollPayslips,
  listHrPayrollRuns,
} from "@afenda/db";

import {
  buildHrPayrollAssignmentsListSurface,
  buildHrPayrollAuditListSurface,
  buildHrPayrollCyclesListSurface,
  buildHrPayrollPayGroupsListSurface,
  buildHrPayrollPaymentsListSurface,
  buildHrPayrollPayslipsListSurface,
  buildHrPayrollRunsListSurface,
} from "./hr.payroll.processing-lists.surface";
import {
  hrPayrollAssignmentsSurfaceKey,
  hrPayrollAuditSurfaceKey,
  hrPayrollCyclesSurfaceKey,
  hrPayrollPayGroupsSurfaceKey,
  hrPayrollPaymentsSurfaceKey,
  hrPayrollPayslipsSurfaceKey,
  hrPayrollRunsSurfaceKey,
} from "./hr.payroll.processing-search-params.parse.shared";

const PAYROLL_DEFAULT_PAGE_SIZE = 25;

export type HrPayrollPageModel = {
  canWrite: boolean;
  cyclesList: ReturnType<typeof buildHrPayrollCyclesListSurface>;
  payGroupsList: ReturnType<typeof buildHrPayrollPayGroupsListSurface>;
  assignmentsList: ReturnType<typeof buildHrPayrollAssignmentsListSurface>;
  runsList: ReturnType<typeof buildHrPayrollRunsListSurface>;
  payslipsList: ReturnType<typeof buildHrPayrollPayslipsListSurface>;
  paymentsList: ReturnType<typeof buildHrPayrollPaymentsListSurface>;
  surfaceKeys: {
    cycles: typeof hrPayrollCyclesSurfaceKey;
    payGroups: typeof hrPayrollPayGroupsSurfaceKey;
    assignments: typeof hrPayrollAssignmentsSurfaceKey;
    runs: typeof hrPayrollRunsSurfaceKey;
    payslips: typeof hrPayrollPayslipsSurfaceKey;
    payments: typeof hrPayrollPaymentsSurfaceKey;
  };
};

export type HrPayrollAuditPageModel = {
  auditList: ReturnType<typeof buildHrPayrollAuditListSurface>;
  surfaceKeys: { audit: typeof hrPayrollAuditSurfaceKey };
};

export async function buildHrPayrollPageModel(input: {
  organizationId: string;
  actorUserId: string;
  canWrite: boolean;
  cyclesSearch?: string;
  payGroupsSearch?: string;
  assignmentsSearch?: string;
  runsSearch?: string;
  payslipsSearch?: string;
  paymentsSearch?: string;
}): Promise<HrPayrollPageModel> {
  const [
    cyclesWindow,
    payGroupsWindow,
    assignmentsWindow,
    runsWindow,
    payslipsWindow,
    paymentsWindow,
  ] = await Promise.all([
    listHrPayrollCycles({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      limit: PAYROLL_DEFAULT_PAGE_SIZE,
      search: input.cyclesSearch,
    }),
    listHrPayrollPayGroups({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      limit: PAYROLL_DEFAULT_PAGE_SIZE,
      search: input.payGroupsSearch,
    }),
    listHrPayrollEmployeeAssignments({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      limit: PAYROLL_DEFAULT_PAGE_SIZE,
      search: input.assignmentsSearch,
    }),
    listHrPayrollRuns({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      limit: PAYROLL_DEFAULT_PAGE_SIZE,
      search: input.runsSearch,
    }),
    listHrPayrollPayslips({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      limit: PAYROLL_DEFAULT_PAGE_SIZE,
      search: input.payslipsSearch,
    }),
    listHrPayrollPaymentBatches({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      limit: PAYROLL_DEFAULT_PAGE_SIZE,
    }),
  ]);

  return {
    canWrite: input.canWrite,
    cyclesList: buildHrPayrollCyclesListSurface({
      window: { ...cyclesWindow, rows: [...cyclesWindow.rows] },
      searchValue: input.cyclesSearch,
    }),
    payGroupsList: buildHrPayrollPayGroupsListSurface({
      window: { ...payGroupsWindow, rows: [...payGroupsWindow.rows] },
      searchValue: input.payGroupsSearch,
    }),
    assignmentsList: buildHrPayrollAssignmentsListSurface({
      window: { ...assignmentsWindow, rows: [...assignmentsWindow.rows] },
      searchValue: input.assignmentsSearch,
    }),
    runsList: buildHrPayrollRunsListSurface({
      window: { ...runsWindow, rows: [...runsWindow.rows] },
      searchValue: input.runsSearch,
    }),
    payslipsList: buildHrPayrollPayslipsListSurface({
      window: { ...payslipsWindow, rows: [...payslipsWindow.rows] },
      searchValue: input.payslipsSearch,
    }),
    paymentsList: buildHrPayrollPaymentsListSurface({
      window: { ...paymentsWindow, rows: [...paymentsWindow.rows] },
      searchValue: input.paymentsSearch,
    }),
    surfaceKeys: {
      cycles: hrPayrollCyclesSurfaceKey,
      payGroups: hrPayrollPayGroupsSurfaceKey,
      assignments: hrPayrollAssignmentsSurfaceKey,
      runs: hrPayrollRunsSurfaceKey,
      payslips: hrPayrollPayslipsSurfaceKey,
      payments: hrPayrollPaymentsSurfaceKey,
    },
  };
}

export async function buildHrPayrollAuditPageModel(input: {
  organizationId: string;
  actorUserId: string;
  auditSearch?: string;
}): Promise<HrPayrollAuditPageModel> {
  const auditWindow = await listHrPayrollAuditTrail({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    limit: PAYROLL_DEFAULT_PAGE_SIZE,
    search: input.auditSearch,
  });

  return {
    auditList: buildHrPayrollAuditListSurface({
      window: {
        ...auditWindow,
        rows: [...auditWindow.rows],
      },
      searchValue: input.auditSearch,
    }),
    surfaceKeys: { audit: hrPayrollAuditSurfaceKey },
  };
}
