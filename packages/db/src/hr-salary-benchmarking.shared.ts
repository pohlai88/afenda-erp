export class HrSbsCommandError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = "HrSbsCommandError";
    this.code = code;
  }
}

export function parseNumeric(
  value: string | number | null | undefined,
): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function assertHrSalaryBenchmarkValuesPresent(input: {
  salaryMinimum?: number | null;
  salaryMaximum?: number | null;
  salaryMedian?: number | null;
  salaryAverage?: number | null;
  salaryMidpoint?: number | null;
  percentile25?: number | null;
  percentile50?: number | null;
  percentile75?: number | null;
  percentile90?: number | null;
}): void {
  const values = [
    input.salaryMinimum,
    input.salaryMaximum,
    input.salaryMedian,
    input.salaryAverage,
    input.salaryMidpoint,
    input.percentile25,
    input.percentile50,
    input.percentile75,
    input.percentile90,
  ];

  const hasValue = values.some(
    (value) => value != null && Number.isFinite(value),
  );

  if (!hasValue) {
    throw new Error(
      "Provide at least one benchmark salary value or percentile (25/50/75/90).",
    );
  }
}

export function formatHrSbsNumeric(
  value: number | null | undefined,
): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return value.toFixed(2);
}
