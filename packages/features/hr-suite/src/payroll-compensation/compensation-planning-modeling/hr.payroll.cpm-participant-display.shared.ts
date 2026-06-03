import type { HrCpmAdjustmentType } from "./hr.payroll.cpm-constants.shared";
import { validateBandPosition } from "./hr.payroll.cpm-calculations.shared";

export type HrCpmParticipantContextInput = {
  employeeLabel: string;
  currentSalary: number | null;
  currentGrade: string | null;
  currentLevel: string | null;
  departmentName: string | null;
  managerLabel: string | null;
  salaryEffectiveDate: Date | string | null;
  currencyCode?: string;
};

export type HrCpmSalaryBandContextInput = {
  grade: string;
  minimum: number;
  midpoint: number;
  maximum: number;
  currentSalary: number | null;
  rangePosition?: number | null;
  compaRatio?: number | null;
  currencyCode?: string;
};

const FALLBACK = "—";

export function formatCpmCurrency(
  amount: number | null | undefined,
  currencyCode = "USD",
): string {
  if (amount == null || !Number.isFinite(amount)) {
    return FALLBACK;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCpmDate(
  value: Date | string | null | undefined,
): string {
  if (!value) return FALLBACK;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return FALLBACK;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function formatCpmRangePosition(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) {
    return FALLBACK;
  }

  return `${value.toFixed(1)}%`;
}

export function formatCpmCompaRatio(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) {
    return FALLBACK;
  }

  return `${value.toFixed(1)}%`;
}

export function formatCpmEnumLabel(value: string | null | undefined): string {
  if (!value) return FALLBACK;

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildCpmParticipantDisplayFields(
  input: HrCpmParticipantContextInput,
) {
  const currencyCode = input.currencyCode ?? "USD";

  return {
    employee: input.employeeLabel,
    currentSalary: formatCpmCurrency(input.currentSalary, currencyCode),
    currentGrade: input.currentGrade ?? FALLBACK,
    currentLevel: input.currentLevel ?? FALLBACK,
    department: input.departmentName ?? FALLBACK,
    manager: input.managerLabel ?? FALLBACK,
    salaryEffectiveDate: formatCpmDate(input.salaryEffectiveDate),
  } as const;
}

export function buildCpmSalaryBandDisplayFields(
  input: HrCpmSalaryBandContextInput | null,
) {
  if (!input) {
    return {
      configured: false,
      grade: FALLBACK,
      bandMinimum: FALLBACK,
      bandMidpoint: FALLBACK,
      bandMaximum: FALLBACK,
      rangePosition: FALLBACK,
      compaRatio: FALLBACK,
    } as const;
  }

  const currencyCode = input.currencyCode ?? "USD";
  const validation =
    input.rangePosition != null || input.compaRatio != null
      ? {
          rangePosition: input.rangePosition,
          compaRatio: input.compaRatio,
        }
      : validateBandPosition(input.currentSalary ?? 0, {
          minimum: input.minimum,
          midpoint: input.midpoint,
          maximum: input.maximum,
        });

  return {
    configured: true,
    grade: input.grade,
    bandMinimum: formatCpmCurrency(input.minimum, currencyCode),
    bandMidpoint: formatCpmCurrency(input.midpoint, currencyCode),
    bandMaximum: formatCpmCurrency(input.maximum, currencyCode),
    rangePosition: formatCpmRangePosition(validation.rangePosition),
    compaRatio: formatCpmCompaRatio(validation.compaRatio),
  } as const;
}

/** CPM-008..012 — manager-authorized adjustment kinds (excludes special). */
export const HR_CPM_MANAGER_ADJUSTMENT_TYPES = [
  "merit",
  "promotion",
  "market",
  "equity",
  "retention",
] as const satisfies readonly HrCpmAdjustmentType[];

export type HrCpmManagerAdjustmentType =
  (typeof HR_CPM_MANAGER_ADJUSTMENT_TYPES)[number];

export function isHrCpmManagerAdjustmentType(
  value: string,
): value is HrCpmManagerAdjustmentType {
  return (HR_CPM_MANAGER_ADJUSTMENT_TYPES as readonly string[]).includes(value);
}

export function resolveCpmAdjustmentIncreaseMode(input: {
  increaseAmount?: number | null;
  increasePercent?: number | null;
}): "amount" | "percent" | "none" {
  if (input.increaseAmount != null && Number.isFinite(input.increaseAmount)) {
    return "amount";
  }

  if (input.increasePercent != null && Number.isFinite(input.increasePercent)) {
    return "percent";
  }

  return "none";
}
