/** PAY-017..020 — payroll readiness validation. */

export type PayrollValidationFinding = {
  code: string;
  message: string;
  severity: "info" | "warning" | "blocking";
  employeeId?: string | null;
};

export function validatePayrollReadiness(input: {
  employees: readonly {
    employeeId: string;
    basicSalary: number | null;
    bankAccountRef: string | null;
    missingFields: readonly string[];
  }[];
  lines: readonly {
    employeeId: string;
    netPay: number;
    variancePercent: number | null;
  }[];
  varianceThresholdPercent?: number;
}): PayrollValidationFinding[] {
  const findings: PayrollValidationFinding[] = [];
  const threshold = input.varianceThresholdPercent ?? 25;

  for (const employee of input.employees) {
    if (employee.basicSalary == null || employee.basicSalary <= 0) {
      findings.push({
        code: "missing_basic_salary",
        message: "Employee is missing basic salary.",
        severity: "blocking",
        employeeId: employee.employeeId,
      });
    }
    if (!employee.bankAccountRef) {
      findings.push({
        code: "missing_bank_account",
        message: "Employee bank account reference is missing.",
        severity: "warning",
        employeeId: employee.employeeId,
      });
    }
    for (const field of employee.missingFields) {
      findings.push({
        code: `missing_${field}`,
        message: `Missing mandatory payroll field: ${field}.`,
        severity: "blocking",
        employeeId: employee.employeeId,
      });
    }
  }

  for (const line of input.lines) {
    if (line.netPay < 0) {
      findings.push({
        code: "negative_net_pay",
        message: "Employee net pay is negative.",
        severity: "blocking",
        employeeId: line.employeeId,
      });
    }
    if (
      line.variancePercent != null &&
      Math.abs(line.variancePercent) > threshold
    ) {
      findings.push({
        code: "abnormal_variance",
        message: `Net pay variance ${line.variancePercent.toFixed(1)}% exceeds threshold.`,
        severity: "warning",
        employeeId: line.employeeId,
      });
    }
  }

  return findings;
}

export function hasBlockingPayrollValidationFindings(
  findings: readonly PayrollValidationFinding[],
): boolean {
  return findings.some((finding) => finding.severity === "blocking");
}
