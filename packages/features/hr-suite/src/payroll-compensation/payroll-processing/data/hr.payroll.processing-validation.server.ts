import { listHrEmployeeDirectoryWindow } from "@afenda/db";

import type { RunHrPayrollValidationInput } from "../schemas/hr.payroll.processing-validation.schema";
import {
  countHrPayrollPendingAdjustments,
  getHrPayrollLastValidationResult,
  listHrPayrollStagedInputs,
  saveHrPayrollValidationResult,
} from "./hr.payroll.processing-store.shared";
import {
  runHrPayrollValidationChecks,
  type HrPayrollEmployeePayrollProfile,
  type HrPayrollValidationContext,
} from "./hr.payroll.processing-validation.shared";

export type HrPayrollPreviousCycleSnapshot = {
  employeeId: string;
  grossAmount: number;
  netAmount: number;
};

const previousCycleByOrgRun = new Map<string, HrPayrollPreviousCycleSnapshot[]>();

/** Test hook — seed prior-cycle amounts for variance checks. */
export function seedHrPayrollPreviousCycleForTests(input: {
  organizationId: string;
  payrollRunId: string;
  amounts: readonly HrPayrollPreviousCycleSnapshot[];
}): void {
  previousCycleByOrgRun.set(
    `${input.organizationId}:${input.payrollRunId}`,
    [...input.amounts],
  );
}

export function resetHrPayrollPreviousCycleForTests(): void {
  previousCycleByOrgRun.clear();
}

function getPreviousCycleKey(organizationId: string, payrollRunId: string) {
  return `${organizationId}:${payrollRunId}`;
}

async function loadEmployeeProfiles(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly HrPayrollEmployeePayrollProfile[]> {
  const window = await listHrEmployeeDirectoryWindow({
    organizationId: input.organizationId,
    limit: input.limit ?? 500,
  });

  return window.rows.map((row) => ({
    employeeId: row.id,
    employeeLabel: row.displayName,
    employeeNumber: row.employeeNumber,
    payGroupId: null,
    bankAccountRef: null,
    taxIdentifier: null,
    baseSalaryAmount: null,
    currencyCode: null,
  }));
}

/** HRM-PAY-017..020 — server-side validation orchestration. */
export async function runHrPayrollProcessingValidation(
  input: RunHrPayrollValidationInput & { organizationId: string },
): Promise<ReturnType<typeof runHrPayrollValidationChecks>> {
  const employees = await loadEmployeeProfiles({
    organizationId: input.organizationId,
  });
  const staged = listHrPayrollStagedInputs({
    organizationId: input.organizationId,
    payrollRunId: input.payrollRunId,
  });
  const pendingUnimported = staged.filter((r) => r.status === "pending").length;
  const previous =
    previousCycleByOrgRun.get(
      getPreviousCycleKey(input.organizationId, input.payrollRunId),
    ) ?? [];

  const context: HrPayrollValidationContext = {
    payrollRunId: input.payrollRunId,
    organizationId: input.organizationId,
    employees,
    previousCycleAmounts: previous,
    pendingUnimportedInputCount: pendingUnimported,
    pendingUnapprovedAdjustmentCount: countHrPayrollPendingAdjustments({
      organizationId: input.organizationId,
      payrollRunId: input.payrollRunId,
    }),
    varianceThresholdPercent: input.varianceThresholdPercent,
    hasNegativeNetPay: false,
  };

  const result = runHrPayrollValidationChecks(context);
  return saveHrPayrollValidationResult(result);
}

export function getHrPayrollProcessingValidationResult(input: {
  organizationId: string;
  payrollRunId: string;
}) {
  return getHrPayrollLastValidationResult(input);
}
