import type {
  HrPayrollRunLineComponent,
  HrPayrollRunLineSnapshot,
} from "./dbx-hr-payroll-processing";
import { formatPayrollNumeric } from "./hr-payroll-processing.shared";

function formatNumeric(value: number, scale = 2): string {
  return formatPayrollNumeric(value, scale);
}

export class HrPayrollCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HrPayrollCalculationError";
  }
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new HrPayrollCalculationError(`invalid ${label}`);
  }
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new HrPayrollCalculationError(`invalid ${label}`);
  }
}

export type PayrollComponentInput = {
  readonly code: string;
  readonly label: string;
  readonly kind: HrPayrollRunLineComponent["kind"];
  readonly category: string;
  readonly amount: number;
  readonly quantity?: number | null;
  readonly rate?: number | null;
  readonly sourceRef?: string | null;
  readonly taxable?: boolean | null;
  readonly contributable?: boolean | null;
};

export type PayrollProrationInput = {
  readonly fullPeriodAmount: number;
  readonly periodDays: number;
  readonly activeDays: number;
};

export type PayrollVarianceInput = {
  readonly currentNetPay: number;
  readonly previousNetPay: number | null;
  readonly varianceThresholdPercent?: number;
};

export type PayrollVarianceResult = {
  readonly variancePercent: number | null;
  readonly isAbnormal: boolean;
  readonly flag: "normal" | "abnormal_variance" | "no_previous";
};

export type PayrollNetPayResult = {
  readonly grossPay: number;
  readonly totalDeductions: number;
  readonly totalTax: number;
  readonly totalStatutoryEmployee: number;
  readonly totalStatutoryEmployer: number;
  readonly totalEmployerCost: number;
  readonly netPay: number;
  readonly components: readonly HrPayrollRunLineComponent[];
  readonly snapshot: HrPayrollRunLineSnapshot;
};

export type PayrollValidationFlag = {
  readonly code: string;
  readonly kind: "missing_data" | "negative_pay" | "variance" | "statutory_readiness" | "blocking_error";
  readonly severity: "info" | "warning" | "error" | "blocking";
  readonly message: string;
  readonly isBlocking: boolean;
};

export type PayrollReadinessInput = {
  readonly hasBankAccount: boolean;
  readonly hasTaxConfig: boolean;
  readonly hasBasicSalary: boolean;
  readonly hasStatutoryConfig: boolean;
  readonly netPay: number;
  readonly varianceResult?: PayrollVarianceResult | null;
};

const DEFAULT_VARIANCE_THRESHOLD_PERCENT = 25;

/** PAY-004 — basic salary, hourly, daily, fixed earnings. */
export function computeFixedComponentAmount(amount: number): number {
  assertFiniteNonNegative(amount, "amount");
  return Math.round(amount * 100) / 100;
}

/** PAY-004 — hourly wage calculation. */
export function computeHourlyWageAmount(
  hours: number,
  hourlyRate: number,
): number {
  assertFiniteNonNegative(hours, "hours");
  assertFiniteNonNegative(hourlyRate, "hourly rate");
  return Math.round(hours * hourlyRate * 100) / 100;
}

/** PAY-004 — daily wage calculation. */
export function computeDailyWageAmount(
  days: number,
  dailyRate: number,
): number {
  assertFiniteNonNegative(days, "days");
  assertFiniteNonNegative(dailyRate, "daily rate");
  return Math.round(days * dailyRate * 100) / 100;
}

/** PAY-006 — overtime calculation. */
export function computeOvertimeAmount(
  hours: number,
  baseRate: number,
  multiplier: number,
): number {
  assertFiniteNonNegative(hours, "overtime hours");
  assertFiniteNonNegative(baseRate, "base rate");
  assertFiniteNonNegative(multiplier, "overtime multiplier");
  return Math.round(hours * baseRate * multiplier * 100) / 100;
}

/** PAY-014 — salary proration. */
export function computeProratedAmount(input: PayrollProrationInput): number {
  const { fullPeriodAmount, periodDays, activeDays } = input;
  assertFiniteNonNegative(fullPeriodAmount, "full period amount");
  assertFiniteNonNegative(periodDays, "period days");
  assertFiniteNonNegative(activeDays, "active days");

  if (periodDays === 0) {
    throw new HrPayrollCalculationError("period days must be greater than zero");
  }
  if (activeDays > periodDays) {
    throw new HrPayrollCalculationError("active days cannot exceed period days");
  }

  const prorated = (fullPeriodAmount * activeDays) / periodDays;
  return Math.round(prorated * 100) / 100;
}

/** PAY-011 — percentage-based component. */
export function computePercentageAmount(
  baseAmount: number,
  percent: number,
): number {
  assertFiniteNonNegative(baseAmount, "base amount");
  assertFinite(baseAmount, "base amount");
  assertFinite(percent, "percent");
  return Math.round(baseAmount * (percent / 100) * 100) / 100;
}

function toComponent(input: PayrollComponentInput): HrPayrollRunLineComponent {
  return {
    code: input.code,
    label: input.label,
    kind: input.kind,
    category: input.category,
    amount: formatNumeric(input.amount),
    quantity: input.quantity != null ? formatNumeric(input.quantity, 4) : null,
    rate: input.rate != null ? formatNumeric(input.rate, 4) : null,
    sourceRef: input.sourceRef ?? null,
    taxable: input.taxable ?? null,
    contributable: input.contributable ?? null,
  };
}

/** PAY-004..011, 010 — aggregate employee payroll line from components. */
export function computeEmployeePayrollLine(input: {
  readonly components: readonly PayrollComponentInput[];
  readonly currencyCode?: string;
}): PayrollNetPayResult {
  if (input.components.length === 0) {
    throw new HrPayrollCalculationError("at least one payroll component required");
  }

  let grossPay = 0;
  let totalDeductions = 0;
  let totalTax = 0;
  let totalStatutoryEmployee = 0;
  let totalStatutoryEmployer = 0;
  let totalEmployerCost = 0;

  const mapped = input.components.map(toComponent);

  for (const component of input.components) {
    assertFinite(component.amount, `component amount for ${component.code}`);

    switch (component.kind) {
      case "earning":
        grossPay += component.amount;
        break;
      case "deduction":
        totalDeductions += component.amount;
        break;
      case "tax":
        totalTax += component.amount;
        break;
      case "statutory_employee":
        totalStatutoryEmployee += component.amount;
        break;
      case "statutory_employer":
        totalStatutoryEmployer += component.amount;
        totalEmployerCost += component.amount;
        break;
      case "employer_cost":
        totalEmployerCost += component.amount;
        break;
      default:
        throw new HrPayrollCalculationError(
          `unknown component kind: ${String(component.kind)}`,
        );
    }
  }

  const netPay =
    Math.round(
      (grossPay - totalDeductions - totalTax - totalStatutoryEmployee) * 100,
    ) / 100;

  const currencyCode = input.currencyCode ?? "USD";

  const snapshot: HrPayrollRunLineSnapshot = {
    components: mapped,
    grossPay: formatNumeric(grossPay),
    totalDeductions: formatNumeric(totalDeductions),
    totalTax: formatNumeric(totalTax),
    totalStatutoryEmployee: formatNumeric(totalStatutoryEmployee),
    totalStatutoryEmployer: formatNumeric(totalStatutoryEmployer),
    totalEmployerCost: formatNumeric(totalEmployerCost),
    netPay: formatNumeric(netPay),
    currencyCode,
  };

  return {
    grossPay,
    totalDeductions,
    totalTax,
    totalStatutoryEmployee,
    totalStatutoryEmployer,
    totalEmployerCost,
    netPay,
    components: mapped,
    snapshot,
  };
}

/** PAY-019 — compare net pay variance against previous cycle. */
export function computePayrollVariance(
  input: PayrollVarianceInput,
): PayrollVarianceResult {
  const threshold =
    input.varianceThresholdPercent ?? DEFAULT_VARIANCE_THRESHOLD_PERCENT;

  if (input.previousNetPay == null) {
    return {
      variancePercent: null,
      isAbnormal: false,
      flag: "no_previous",
    };
  }

  assertFiniteNonNegative(input.currentNetPay, "current net pay");
  assertFiniteNonNegative(input.previousNetPay, "previous net pay");

  if (input.previousNetPay === 0) {
    const isAbnormal = input.currentNetPay > 0;
    return {
      variancePercent: isAbnormal ? 100 : 0,
      isAbnormal,
      flag: isAbnormal ? "abnormal_variance" : "normal",
    };
  }

  const variancePercent =
    Math.round(
      ((input.currentNetPay - input.previousNetPay) / input.previousNetPay) *
        10000,
    ) / 100;

  const isAbnormal = Math.abs(variancePercent) > threshold;

  return {
    variancePercent,
    isAbnormal,
    flag: isAbnormal ? "abnormal_variance" : "normal",
  };
}

/** PAY-017..020 — build validation flags for an employee payroll line. */
export function buildPayrollValidationFlags(
  input: PayrollReadinessInput,
): readonly PayrollValidationFlag[] {
  const flags: PayrollValidationFlag[] = [];

  if (!input.hasBasicSalary) {
    flags.push({
      code: "missing_basic_salary",
      kind: "missing_data",
      severity: "blocking",
      message: "Employee is missing basic salary configuration",
      isBlocking: true,
    });
  }

  if (!input.hasBankAccount) {
    flags.push({
      code: "missing_bank_account",
      kind: "missing_data",
      severity: "error",
      message: "Employee is missing bank account for payment",
      isBlocking: false,
    });
  }

  if (!input.hasTaxConfig) {
    flags.push({
      code: "missing_tax_config",
      kind: "statutory_readiness",
      severity: "blocking",
      message: "Employee tax configuration is missing",
      isBlocking: true,
    });
  }

  if (!input.hasStatutoryConfig) {
    flags.push({
      code: "missing_statutory_config",
      kind: "statutory_readiness",
      severity: "blocking",
      message: "Employee statutory contribution configuration is missing",
      isBlocking: true,
    });
  }

  if (input.netPay < 0) {
    flags.push({
      code: "negative_net_pay",
      kind: "negative_pay",
      severity: "blocking",
      message: "Net pay is negative",
      isBlocking: true,
    });
  }

  if (input.varianceResult?.isAbnormal) {
    flags.push({
      code: "abnormal_variance",
      kind: "variance",
      severity: "warning",
      message: `Net pay variance of ${input.varianceResult.variancePercent}% exceeds threshold`,
      isBlocking: false,
    });
  }

  return flags;
}

export function countBlockingValidationFlags(
  flags: readonly PayrollValidationFlag[],
): number {
  return flags.filter((flag) => flag.isBlocking).length;
}

export function aggregateRunTotals(
  lines: readonly Pick<
    PayrollNetPayResult,
    | "grossPay"
    | "netPay"
    | "totalEmployerCost"
  >[],
): {
  totalGrossPay: number;
  totalNetPay: number;
  totalEmployerCost: number;
} {
  return lines.reduce(
    (acc, line) => ({
      totalGrossPay: acc.totalGrossPay + line.grossPay,
      totalNetPay: acc.totalNetPay + line.netPay,
      totalEmployerCost: acc.totalEmployerCost + line.totalEmployerCost,
    }),
    { totalGrossPay: 0, totalNetPay: 0, totalEmployerCost: 0 },
  );
}

/** Convenience wrapper for payroll run calculation. */
export function computePayrollLineBreakdown(input: {
  basicSalary: number;
  fixedAllowances?: number;
  employeeTaxRate?: number;
  employeeStatutoryRate?: number;
  employerStatutoryRate?: number;
}): PayrollNetPayResult {
  const basicSalary = computeFixedComponentAmount(input.basicSalary);
  const allowances = computeFixedComponentAmount(input.fixedAllowances ?? basicSalary * 0.05);
  const taxRate = input.employeeTaxRate ?? 0.1;
  const employeeStatutoryRate = input.employeeStatutoryRate ?? 0.02;
  const employerStatutoryRate = input.employerStatutoryRate ?? 0.03;
  const taxableBase = basicSalary + allowances;

  return computeEmployeePayrollLine({
    components: [
      {
        code: "BASIC",
        label: "Basic salary",
        kind: "earning",
        category: "basic_salary",
        amount: basicSalary,
      },
      {
        code: "ALLOW",
        label: "Fixed allowance",
        kind: "earning",
        category: "allowance_fixed",
        amount: allowances,
      },
      {
        code: "TAX",
        label: "Employee tax",
        kind: "tax",
        category: "tax_employee",
        amount: computePercentageAmount(taxableBase, taxRate * 100),
      },
      {
        code: "STAT_EE",
        label: "Employee statutory",
        kind: "statutory_employee",
        category: "statutory_employee",
        amount: computePercentageAmount(taxableBase, employeeStatutoryRate * 100),
      },
      {
        code: "STAT_ER",
        label: "Employer statutory",
        kind: "statutory_employer",
        category: "statutory_employer",
        amount: computePercentageAmount(taxableBase, employerStatutoryRate * 100),
      },
    ],
  });
}

export function sumPayrollBreakdownTotals(
  breakdowns: readonly PayrollNetPayResult[],
) {
  return aggregateRunTotals(breakdowns);
}

export function computePayrollVariancePercent(
  input: PayrollVarianceInput,
): number | null {
  return computePayrollVariance(input).variancePercent;
}

export function computePayrollProrationFactor(input: PayrollProrationInput): number {
  if (input.periodDays <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, input.activeDays / input.periodDays));
}

