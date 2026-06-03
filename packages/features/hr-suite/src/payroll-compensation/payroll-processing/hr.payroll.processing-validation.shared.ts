import {
  HR_PAYROLL_DEFAULT_VARIANCE_THRESHOLD_PERCENT,
} from "./hr.payroll.processing-constants.shared";
import type {
  HrPayrollValidationIssue,
  HrPayrollValidationResult,
} from "./hr.payroll.processing-validation.schema";

export type HrPayrollEmployeePayrollProfile = {
  employeeId: string;
  employeeLabel: string;
  employeeNumber?: string | null;
  payGroupId?: string | null;
  bankAccountRef?: string | null;
  taxIdentifier?: string | null;
  baseSalaryAmount?: number | null;
  currencyCode?: string | null;
};

export type HrPayrollEmployeeCycleAmount = {
  employeeId: string;
  grossAmount: number;
  netAmount: number;
};

export type HrPayrollValidationContext = {
  payrollRunId: string;
  organizationId: string;
  employees: readonly HrPayrollEmployeePayrollProfile[];
  currentCycleAmounts?: readonly HrPayrollEmployeeCycleAmount[];
  previousCycleAmounts?: readonly HrPayrollEmployeeCycleAmount[];
  pendingUnimportedInputCount?: number;
  pendingUnapprovedAdjustmentCount?: number;
  varianceThresholdPercent?: number;
  hasNegativeNetPay?: boolean;
};

function issue(
  partial: HrPayrollValidationIssue,
): HrPayrollValidationIssue {
  return partial;
}

/** HRM-PAY-017..020 — pure readiness, missing data, variance, finalize gate. */
export function runHrPayrollValidationChecks(
  context: HrPayrollValidationContext,
): HrPayrollValidationResult {
  const issues: HrPayrollValidationIssue[] = [];
  const threshold =
    context.varianceThresholdPercent ??
    HR_PAYROLL_DEFAULT_VARIANCE_THRESHOLD_PERCENT;

  for (const employee of context.employees) {
    if (!employee.payGroupId) {
      issues.push(
        issue({
          code: "missing_pay_group",
          severity: "blocking",
          employeeId: employee.employeeId,
          employeeLabel: employee.employeeLabel,
          message: "Employee is not assigned to a payroll group.",
        }),
      );
    }
    if (!employee.bankAccountRef) {
      issues.push(
        issue({
          code: "missing_bank_account",
          severity: "blocking",
          employeeId: employee.employeeId,
          employeeLabel: employee.employeeLabel,
          message: "Bank account is required for payroll payment.",
        }),
      );
    }
    if (!employee.taxIdentifier) {
      issues.push(
        issue({
          code: "missing_tax_identifier",
          severity: "warning",
          employeeId: employee.employeeId,
          employeeLabel: employee.employeeLabel,
          message: "Tax identifier is missing for statutory calculation.",
        }),
      );
    }
    if (employee.baseSalaryAmount == null || employee.baseSalaryAmount <= 0) {
      issues.push(
        issue({
          code: "missing_base_salary",
          severity: "blocking",
          employeeId: employee.employeeId,
          employeeLabel: employee.employeeLabel,
          message: "Base salary is missing or zero.",
        }),
      );
    }
    if (!employee.employeeNumber?.trim()) {
      issues.push(
        issue({
          code: "missing_employee_number",
          severity: "warning",
          employeeId: employee.employeeId,
          employeeLabel: employee.employeeLabel,
          message: "Employee number is missing.",
        }),
      );
    }
  }

  if (context.hasNegativeNetPay) {
    issues.push(
      issue({
        code: "negative_net_pay",
        severity: "blocking",
        message: "One or more employees have negative net pay.",
      }),
    );
  }

  if ((context.pendingUnimportedInputCount ?? 0) > 0) {
    issues.push(
      issue({
        code: "unimported_inputs",
        severity: "warning",
        message: "Approved upstream inputs have not been imported for this run.",
        metadata: { count: context.pendingUnimportedInputCount },
      }),
    );
  }

  if ((context.pendingUnapprovedAdjustmentCount ?? 0) > 0) {
    issues.push(
      issue({
        code: "pending_adjustment_approval",
        severity: "blocking",
        message: "Manual adjustments require approval before finalization.",
        metadata: { count: context.pendingUnapprovedAdjustmentCount },
      }),
    );
  }

  const previousByEmployee = new Map(
    (context.previousCycleAmounts ?? []).map((row) => [
      row.employeeId,
      row,
    ]),
  );
  for (const current of context.currentCycleAmounts ?? []) {
    const previous = previousByEmployee.get(current.employeeId);
    if (!previous || previous.netAmount === 0) continue;
    const variancePercent =
      (Math.abs(current.netAmount - previous.netAmount) / previous.netAmount) *
      100;
    if (variancePercent >= threshold) {
      const profile = context.employees.find(
        (e) => e.employeeId === current.employeeId,
      );
      issues.push(
        issue({
          code: "abnormal_variance",
          severity: "warning",
          employeeId: current.employeeId,
          employeeLabel: profile?.employeeLabel,
          message: `Net pay variance ${variancePercent.toFixed(1)}% exceeds ${threshold}% threshold.`,
          metadata: {
            previousNet: previous.netAmount,
            currentNet: current.netAmount,
            variancePercent,
          },
        }),
      );
    }
  }

  if (context.employees.length === 0) {
    issues.push(
      issue({
        code: "run_not_ready",
        severity: "blocking",
        message: "Payroll run has no employees in scope.",
      }),
    );
  }

  const blockingCount = issues.filter((i) => i.severity === "blocking").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return {
    payrollRunId: context.payrollRunId,
    organizationId: context.organizationId,
    validatedAt: new Date(),
    readyForCalculation: blockingCount === 0,
    canFinalize: blockingCount === 0,
    blockingCount,
    warningCount,
    issues,
  };
}

/** HRM-PAY-020 — explicit finalize guard. */
export function assertHrPayrollCanFinalize(
  result: HrPayrollValidationResult,
): void {
  if (!result.canFinalize) {
    throw new Error(
      `Payroll cannot be finalized: ${result.blockingCount} blocking validation issue(s).`,
    );
  }
}
