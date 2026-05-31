import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import {
  appendHrPayrollAuditEventInTx,
  listHrPayrollAuditTrailWindow,
} from "./hr-payroll-processing-audit";
import {
  computeDailyWageAmount,
  computeFixedComponentAmount,
  computeHourlyWageAmount,
  computeOvertimeAmount,
  computePayrollLineBreakdown,
  computePayrollProrationFactor,
  computePayrollVariancePercent,
  computePercentageAmount,
  computeProratedAmount,
  sumPayrollBreakdownTotals,
} from "./hr-payroll-processing-calculations.shared";
import { authorizeHrPayrollCorrectionInTx, listHrPayrollCorrectionsWindow } from "./hr-payroll-processing-correction";
import {
  generateHrPayrollJournalRefInTx,
  getHrPayrollJournalRefInTx,
} from "./hr-payroll-processing-journal";
import {
  createHrPayrollPaymentBatchInTx,
  listHrPayrollPaymentBatchesWindow,
  listHrPayrollPaymentsWindow,
  updateHrPayrollPaymentStatusInTx,
} from "./hr-payroll-processing-payment";
import {
  generateHrPayrollPayslipsInTx,
  getHrPayrollPayslipForEmployeeInTx,
  listHrPayrollPayslipsForEmployeeInTx,
  listHrPayrollPayslipsWindow,
} from "./hr-payroll-processing-payslip";
import {
  HrPayrollCommandError,
  assertHrPayrollRunStatusTransition,
  formatPayrollNumeric,
  isHrPayrollRunLocked,
  parsePayrollNumeric,
} from "./hr-payroll-processing.shared";
import {
  hasBlockingPayrollValidationFindings,
  validatePayrollReadiness,
} from "./hr-payroll-processing-validation.shared";
import {
  approveHrPayrollRunInTx,
  calculateHrPayrollRunInTx,
  finalizeHrPayrollRunInTx,
  getHrPayrollRunSummaryInTx,
  listHrPayrollRunValidationsWindow,
  listHrPayrollRunsWindow,
  lockHrPayrollRunInTx,
  previewHrPayrollRunInTx,
  submitHrPayrollRunForApprovalInTx,
} from "./hr-payroll-processing-workflow";
import {
  listHrPayrollCyclesWindow,
  listHrPayrollEmployeeAssignmentsWindow,
  listHrPayrollPayGroupsWindow,
} from "./hr-payroll-processing-foundation";

export {
  HrPayrollCommandError,
  assertHrPayrollRunStatusTransition,
  formatPayrollNumeric,
  parsePayrollNumeric,
  isHrPayrollRunLocked,
  computeDailyWageAmount,
  computeFixedComponentAmount,
  computeHourlyWageAmount,
  computeOvertimeAmount,
  computePayrollLineBreakdown,
  computePayrollProrationFactor,
  computePayrollVariancePercent,
  computePercentageAmount,
  computeProratedAmount,
  sumPayrollBreakdownTotals,
  validatePayrollReadiness,
  hasBlockingPayrollValidationFindings,
  appendHrPayrollAuditEventInTx,
  listHrPayrollAuditTrailWindow,
  getHrPayrollRunSummaryInTx,
  calculateHrPayrollRunInTx,
  previewHrPayrollRunInTx,
  submitHrPayrollRunForApprovalInTx,
  approveHrPayrollRunInTx,
  lockHrPayrollRunInTx,
  finalizeHrPayrollRunInTx,
  listHrPayrollRunsWindow,
  listHrPayrollRunValidationsWindow,
  generateHrPayrollPayslipsInTx,
  listHrPayrollPayslipsForEmployeeInTx,
  listHrPayrollPayslipsWindow,
  getHrPayrollPayslipForEmployeeInTx,
  createHrPayrollPaymentBatchInTx,
  updateHrPayrollPaymentStatusInTx,
  listHrPayrollPaymentBatchesWindow,
  listHrPayrollPaymentsWindow,
  generateHrPayrollJournalRefInTx,
  getHrPayrollJournalRefInTx,
  authorizeHrPayrollCorrectionInTx,
  listHrPayrollCorrectionsWindow,
};

export {
  createHrPayrollGroupInTx,
  createHrPayrollCycleInTx,
  createHrPayrollRunInTx,
  assignHrPayrollGroupEmployeeInTx,
  listHrPayrollPayGroupsWindow,
  listHrPayrollCyclesWindow,
  listHrPayrollEmployeeAssignmentsWindow,
} from "./hr-payroll-processing-foundation";

type OrgActorInput = {
  organizationId: string;
  actorUserId: string;
};

function withOrg<T>(
  organizationId: string,
  fn: (db: AfendaTransaction) => Promise<T>,
): Promise<T> {
  return runWithOrganizationContext(organizationId, fn);
}

export async function calculateHrPayrollRun(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    calculateHrPayrollRunInTx(db, input),
  );
}

export async function previewHrPayrollRun(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    previewHrPayrollRunInTx(db, input),
  );
}

export async function submitHrPayrollRunForApproval(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    submitHrPayrollRunForApprovalInTx(db, input),
  );
}

export async function approveHrPayrollRun(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    approveHrPayrollRunInTx(db, input),
  );
}

export async function lockHrPayrollRun(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    lockHrPayrollRunInTx(db, input),
  );
}

export async function finalizeHrPayrollRun(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    finalizeHrPayrollRunInTx(db, input),
  );
}

export async function generateHrPayrollPayslips(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    generateHrPayrollPayslipsInTx(db, input),
  );
}

export async function createHrPayrollPaymentBatch(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    createHrPayrollPaymentBatchInTx(db, input),
  );
}

export async function updateHrPayrollPaymentStatus(
  input: OrgActorInput & {
    paymentBatchId: string;
    paymentStatus: "pending" | "processing" | "paid" | "failed" | "reversed";
    employeeId?: string;
  },
) {
  return withOrg(input.organizationId, (db) =>
    updateHrPayrollPaymentStatusInTx(db, input),
  );
}

export async function generateHrPayrollJournalRef(
  input: OrgActorInput & { payrollRunId: string },
) {
  return withOrg(input.organizationId, (db) =>
    generateHrPayrollJournalRefInTx(db, input),
  );
}

export async function authorizeHrPayrollCorrection(
  input: OrgActorInput & {
    payrollRunId: string;
    correctionKind: "correction" | "reversal";
    reason: string;
  },
) {
  return withOrg(input.organizationId, (db) =>
    authorizeHrPayrollCorrectionInTx(db, input),
  );
}

export async function listHrPayrollRuns(input: {
  organizationId: string;
  actorUserId: string;
  limit?: number;
  search?: string;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollRunsWindow(db, input),
  );
}

export async function listHrPayrollPayslips(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId?: string;
  limit?: number;
  search?: string;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollPayslipsWindow(db, input),
  );
}

export async function listHrPayrollPaymentBatches(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId?: string;
  limit?: number;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollPaymentBatchesWindow(db, input),
  );
}

export async function listHrPayrollAuditTrail(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId?: string;
  limit?: number;
  search?: string;
}) {
  return listHrPayrollAuditTrailWindow({
    organizationId: input.organizationId,
    runId: input.payrollRunId ?? null,
    limit: input.limit,
    search: input.search,
  });
}

export async function listHrPayrollPayGroups(input: {
  organizationId: string;
  actorUserId: string;
  limit?: number;
  search?: string;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollPayGroupsWindow(db, input),
  );
}

export async function listHrPayrollCycles(input: {
  organizationId: string;
  actorUserId: string;
  payGroupId?: string;
  limit?: number;
  search?: string;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollCyclesWindow(db, input),
  );
}

export async function listHrPayrollEmployeeAssignments(input: {
  organizationId: string;
  actorUserId: string;
  payGroupId?: string;
  limit?: number;
  search?: string;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollEmployeeAssignmentsWindow(db, input),
  );
}

export async function listHrPayrollPayments(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId?: string;
  batchId?: string;
  limit?: number;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollPaymentsWindow(db, input),
  );
}

export async function listHrPayrollPayslipsForEmployee(input: {
  organizationId: string;
  actorUserId: string;
  employeeId: string;
  limit?: number;
}) {
  return withOrg(input.organizationId, (db) =>
    listHrPayrollPayslipsForEmployeeInTx(db, input),
  );
}

export async function getHrPayrollRunSummary(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  return withOrg(input.organizationId, (db) =>
    getHrPayrollRunSummaryInTx(db, input),
  );
}
