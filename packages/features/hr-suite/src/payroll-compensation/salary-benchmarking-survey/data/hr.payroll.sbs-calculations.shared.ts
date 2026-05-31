/**
 * HRM-SBS-009..018 — pure salary benchmarking & pay equity calculations.
 * IO-free; consumed by analysis orchestration and unit tests.
 */

export class HrSbsCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HrSbsCalculationError";
  }
}

export const SBS_MARKET_POSITIONS = [
  "below_market",
  "at_market",
  "above_market",
  "outlier",
] as const;

export type SbsMarketPosition = (typeof SBS_MARKET_POSITIONS)[number];

export const SBS_PAY_GAP_DIMENSIONS = [
  "job",
  "grade",
  "department",
  "location",
  "employment_category",
] as const;

export type SbsPayGapDimension = (typeof SBS_PAY_GAP_DIMENSIONS)[number];

export const SBS_PAY_EQUITY_DIMENSIONS = [
  "job_family",
  "grade",
  "department",
  "location",
  "tenure",
  "performance_rating",
] as const;

export type SbsPayEquityDimension = (typeof SBS_PAY_EQUITY_DIMENSIONS)[number];

export type SbsInternalSalaryBand = {
  readonly minimum: number;
  readonly midpoint: number;
  readonly maximum: number;
};

export type SbsMarketBenchmark = {
  readonly currencyCode: string;
  readonly minimum?: number | null;
  readonly midpoint?: number | null;
  readonly median?: number | null;
  readonly maximum?: number | null;
  readonly average?: number | null;
  readonly p25?: number | null;
  readonly p50?: number | null;
  readonly p75?: number | null;
  readonly p90?: number | null;
};

export type SbsThresholdConfig = {
  /** Market ratio below this flags below-target (SBS-015). Default 95. */
  readonly targetMarketRatioPercent?: number;
  /** Market ratio above this flags above-range review (SBS-016). Default 115. */
  readonly upperMarketRatioPercent?: number;
  /** Lower bound of at-market band for classification (SBS-014). Default 90. */
  readonly atMarketLowerPercent?: number;
  /** Upper bound of at-market band for classification (SBS-014). Default 110. */
  readonly atMarketUpperPercent?: number;
  /** Ratios outside this band classify as outlier (SBS-014). Defaults 75 / 125. */
  readonly outlierLowerPercent?: number;
  readonly outlierUpperPercent?: number;
  /** Min internal spread % within a peer group to flag pay gap (SBS-017). Default 15. */
  readonly payGapSpreadPercent?: number;
  /** Max/min salary ratio within equity group to flag (SBS-018). Default 1.25. */
  readonly payEquityDisparityRatio?: number;
};

export type SbsEmployeeCompensationRecord = {
  readonly employeeId: string;
  readonly baseSalary: number;
  readonly totalCash?: number | null;
  readonly totalComp?: number | null;
  readonly currencyCode: string;
  readonly jobTitle?: string | null;
  readonly jobFamily?: string | null;
  readonly grade?: string | null;
  readonly departmentId?: string | null;
  readonly locationCode?: string | null;
  readonly employmentCategory?: string | null;
  readonly tenureDays?: number | null;
  readonly performanceRating?: number | null;
};

export type SbsComparisonResult = {
  readonly employeeAmount: number;
  readonly benchmarkAmount: number;
  readonly delta: number;
  readonly ratioPercent: number | null;
  readonly currencyCode: string;
};

export type SbsEmployeeAnalysisResult = {
  readonly employeeId: string;
  readonly currencyCode: string;
  readonly baseSalaryComparison: SbsComparisonResult;
  readonly totalCashComparison: SbsComparisonResult | null;
  readonly totalCompComparison: SbsComparisonResult | null;
  readonly compaRatio: number | null;
  readonly marketRatio: number | null;
  readonly marketPosition: SbsMarketPosition;
  readonly belowTarget: boolean;
  readonly aboveRange: boolean;
};

export type SbsPayGapGroupResult = {
  readonly dimension: SbsPayGapDimension;
  readonly groupKey: string;
  readonly employeeCount: number;
  readonly minSalary: number;
  readonly maxSalary: number;
  readonly medianSalary: number;
  readonly spreadPercent: number;
  readonly flagged: boolean;
  readonly employeeIds: readonly string[];
};

export type SbsPayEquityGroupResult = {
  readonly dimension: SbsPayEquityDimension;
  readonly groupKey: string;
  readonly employeeCount: number;
  readonly minSalary: number;
  readonly maxSalary: number;
  readonly medianSalary: number;
  readonly disparityRatio: number | null;
  readonly flagged: boolean;
  readonly employeeIds: readonly string[];
};

export type SbsCompensationAnalysisSnapshot = {
  readonly benchmarkVersionId: string;
  readonly thresholds: Required<SbsThresholdConfig>;
  readonly employeeResults: readonly SbsEmployeeAnalysisResult[];
  readonly payGapGroups: readonly SbsPayGapGroupResult[];
  readonly payEquityGroups: readonly SbsPayEquityGroupResult[];
  readonly analyzedEmployeeCount: number;
  readonly flaggedBelowTargetCount: number;
  readonly flaggedAboveRangeCount: number;
};

const DEFAULT_THRESHOLDS: Required<SbsThresholdConfig> = {
  targetMarketRatioPercent: 95,
  upperMarketRatioPercent: 115,
  atMarketLowerPercent: 90,
  atMarketUpperPercent: 110,
  outlierLowerPercent: 75,
  outlierUpperPercent: 125,
  payGapSpreadPercent: 15,
  payEquityDisparityRatio: 1.25,
};

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new HrSbsCalculationError(`invalid ${label}`);
  }
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new HrSbsCalculationError(`invalid ${label}`);
  }
}

function roundRatio(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

export function resolveSbsThresholds(
  config?: SbsThresholdConfig | null,
): Required<SbsThresholdConfig> {
  return {
    ...DEFAULT_THRESHOLDS,
    ...config,
  };
}

export function assertSbsCurrencyMatch(
  employeeCurrency: string,
  benchmarkCurrency: string,
): void {
  if (
    employeeCurrency.trim().toUpperCase() !==
    benchmarkCurrency.trim().toUpperCase()
  ) {
    throw new HrSbsCalculationError("currency mismatch between employee and benchmark");
  }
}

/** Resolves benchmark reference amount: midpoint preferred, then median / p50. */
export function resolveBenchmarkReferenceAmount(
  benchmark: SbsMarketBenchmark,
): number {
  const candidates = [
    benchmark.midpoint,
    benchmark.median,
    benchmark.p50,
  ];
  for (const value of candidates) {
    if (value != null && Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  throw new HrSbsCalculationError(
    "missing benchmark reference: midpoint, median, or p50 required",
  );
}

/** SBS-012 — compa-ratio vs internal salary range midpoint. */
export function compaRatio(
  salary: number,
  internalBand: SbsInternalSalaryBand,
): number | null {
  assertFiniteNonNegative(salary, "salary");
  assertPositive(internalBand.midpoint, "internal band midpoint");
  return roundRatio((salary / internalBand.midpoint) * 100);
}

/** SBS-013 — market ratio vs benchmark midpoint or median. */
export function marketRatio(
  salary: number,
  benchmark: SbsMarketBenchmark,
): number | null {
  assertFiniteNonNegative(salary, "salary");
  const reference = resolveBenchmarkReferenceAmount(benchmark);
  return roundRatio((salary / reference) * 100);
}

function resolveRatioPercent(
  salary: number,
  benchmark: SbsMarketBenchmark,
): number | null {
  try {
    return marketRatio(salary, benchmark);
  } catch {
    return null;
  }
}

/** SBS-014 — classify market position from market ratio and configured thresholds. */
export function classifyMarketPosition(
  ratioPercent: number | null,
  thresholds?: SbsThresholdConfig | null,
): SbsMarketPosition {
  const config = resolveSbsThresholds(thresholds);
  if (ratioPercent == null || !Number.isFinite(ratioPercent)) {
    return "outlier";
  }

  if (
    ratioPercent <= config.outlierLowerPercent ||
    ratioPercent >= config.outlierUpperPercent
  ) {
    return "outlier";
  }
  if (ratioPercent < config.atMarketLowerPercent) {
    return "below_market";
  }
  if (ratioPercent > config.atMarketUpperPercent) {
    return "above_market";
  }
  return "at_market";
}

/** SBS-015 — employee paid below configured market target threshold. */
export function flagBelowTarget(
  salary: number,
  benchmark: SbsMarketBenchmark,
  thresholds?: SbsThresholdConfig | null,
): boolean {
  assertFiniteNonNegative(salary, "salary");
  const config = resolveSbsThresholds(thresholds);
  const ratio = resolveRatioPercent(salary, benchmark);
  if (ratio != null && ratio < config.targetMarketRatioPercent) {
    return true;
  }
  if (
    benchmark.minimum != null &&
    Number.isFinite(benchmark.minimum) &&
    salary < benchmark.minimum
  ) {
    return true;
  }
  return false;
}

/** SBS-016 — employee paid above configured market range threshold. */
export function flagAboveRange(
  salary: number,
  benchmark: SbsMarketBenchmark,
  thresholds?: SbsThresholdConfig | null,
): boolean {
  assertFiniteNonNegative(salary, "salary");
  const config = resolveSbsThresholds(thresholds);
  const ratio = resolveRatioPercent(salary, benchmark);
  if (ratio != null && ratio > config.upperMarketRatioPercent) {
    return true;
  }
  if (
    benchmark.maximum != null &&
    Number.isFinite(benchmark.maximum) &&
    salary > benchmark.maximum
  ) {
    return true;
  }
  if (
    benchmark.p90 != null &&
    Number.isFinite(benchmark.p90) &&
    salary > benchmark.p90
  ) {
    return true;
  }
  return false;
}

function buildComparison(
  employeeAmount: number,
  benchmark: SbsMarketBenchmark,
  employeeCurrency: string,
): SbsComparisonResult {
  assertFiniteNonNegative(employeeAmount, "employee amount");
  assertSbsCurrencyMatch(employeeCurrency, benchmark.currencyCode);
  const benchmarkAmount = resolveBenchmarkReferenceAmount(benchmark);
  const delta = employeeAmount - benchmarkAmount;
  const ratioPercent =
    benchmarkAmount > 0
      ? roundRatio((employeeAmount / benchmarkAmount) * 100)
      : null;
  return {
    employeeAmount,
    benchmarkAmount,
    delta,
    ratioPercent,
    currencyCode: employeeCurrency,
  };
}

/** SBS-009 — compare base salary against market benchmark. */
export function compareBaseSalary(
  baseSalary: number,
  benchmark: SbsMarketBenchmark,
  employeeCurrency: string,
): SbsComparisonResult {
  return buildComparison(baseSalary, benchmark, employeeCurrency);
}

/** SBS-010 — compare total cash against market benchmark. */
export function compareTotalCash(
  totalCash: number,
  benchmark: SbsMarketBenchmark,
  employeeCurrency: string,
): SbsComparisonResult {
  return buildComparison(totalCash, benchmark, employeeCurrency);
}

/** SBS-011 — compare total compensation against market benchmark. */
export function compareTotalComp(
  totalComp: number,
  benchmark: SbsMarketBenchmark,
  employeeCurrency: string,
): SbsComparisonResult {
  return buildComparison(totalComp, benchmark, employeeCurrency);
}

export function analyzeEmployeeCompensation(input: {
  readonly employee: SbsEmployeeCompensationRecord;
  readonly internalBand: SbsInternalSalaryBand | null;
  readonly benchmark: SbsMarketBenchmark;
  readonly thresholds?: SbsThresholdConfig | null;
}): SbsEmployeeAnalysisResult {
  const { employee, internalBand, benchmark, thresholds } = input;
  assertSbsCurrencyMatch(employee.currencyCode, benchmark.currencyCode);
  assertFiniteNonNegative(employee.baseSalary, "base salary");

  const baseSalaryComparison = compareBaseSalary(
    employee.baseSalary,
    benchmark,
    employee.currencyCode,
  );

  const totalCashComparison =
    employee.totalCash != null
      ? compareTotalCash(employee.totalCash, benchmark, employee.currencyCode)
      : null;

  const totalCompComparison =
    employee.totalComp != null
      ? compareTotalComp(employee.totalComp, benchmark, employee.currencyCode)
      : null;

  const compa =
    internalBand != null ? compaRatio(employee.baseSalary, internalBand) : null;
  const market = marketRatio(employee.baseSalary, benchmark);
  const marketPosition = classifyMarketPosition(market, thresholds);

  return {
    employeeId: employee.employeeId,
    currencyCode: employee.currencyCode,
    baseSalaryComparison,
    totalCashComparison,
    totalCompComparison,
    compaRatio: compa,
    marketRatio: market,
    marketPosition,
    belowTarget: flagBelowTarget(employee.baseSalary, benchmark, thresholds),
    aboveRange: flagAboveRange(employee.baseSalary, benchmark, thresholds),
  };
}

function medianOf(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

function groupKeyForPayGap(
  employee: SbsEmployeeCompensationRecord,
  dimension: SbsPayGapDimension,
): string | null {
  switch (dimension) {
    case "job":
      return employee.jobTitle?.trim() || employee.jobFamily?.trim() || null;
    case "grade":
      return employee.grade?.trim() || null;
    case "department":
      return employee.departmentId?.trim() || null;
    case "location":
      return employee.locationCode?.trim() || null;
    case "employment_category":
      return employee.employmentCategory?.trim() || null;
    default: {
      const _exhaustive: never = dimension;
      return _exhaustive;
    }
  }
}

/** SBS-017 — internal pay gaps within peer groups. */
export function identifyPayGaps(
  employees: readonly SbsEmployeeCompensationRecord[],
  thresholds?: SbsThresholdConfig | null,
): readonly SbsPayGapGroupResult[] {
  const config = resolveSbsThresholds(thresholds);
  const results: SbsPayGapGroupResult[] = [];

  for (const dimension of SBS_PAY_GAP_DIMENSIONS) {
    const groups = new Map<string, SbsEmployeeCompensationRecord[]>();

    for (const employee of employees) {
      const key = groupKeyForPayGap(employee, dimension);
      if (!key) continue;
      const bucket = groups.get(key) ?? [];
      bucket.push(employee);
      groups.set(key, bucket);
    }

    for (const [groupKey, members] of groups) {
      if (members.length < 2) continue;
      const salaries = members.map((m) => m.baseSalary);
      const minSalary = Math.min(...salaries);
      const maxSalary = Math.max(...salaries);
      const med = medianOf(salaries);
      const spreadPercent =
        med > 0 ? roundRatio(((maxSalary - minSalary) / med) * 100) : 100;
      const flagged = spreadPercent >= config.payGapSpreadPercent;

      results.push({
        dimension,
        groupKey,
        employeeCount: members.length,
        minSalary,
        maxSalary,
        medianSalary: med,
        spreadPercent,
        flagged,
        employeeIds: members.map((m) => m.employeeId),
      });
    }
  }

  return results;
}

function tenureBucket(tenureDays: number | null | undefined): string | null {
  if (tenureDays == null || !Number.isFinite(tenureDays) || tenureDays < 0) {
    return null;
  }
  if (tenureDays < 365) return "0-1y";
  if (tenureDays < 365 * 3) return "1-3y";
  if (tenureDays < 365 * 5) return "3-5y";
  return "5y+";
}

function groupKeyForPayEquity(
  employee: SbsEmployeeCompensationRecord,
  dimension: SbsPayEquityDimension,
): string | null {
  switch (dimension) {
    case "job_family":
      return employee.jobFamily?.trim() || null;
    case "grade":
      return employee.grade?.trim() || null;
    case "department":
      return employee.departmentId?.trim() || null;
    case "location":
      return employee.locationCode?.trim() || null;
    case "tenure":
      return tenureBucket(employee.tenureDays);
    case "performance_rating":
      return employee.performanceRating != null
        ? String(employee.performanceRating)
        : null;
    default: {
      const _exhaustive: never = dimension;
      return _exhaustive;
    }
  }
}

/** SBS-018 — pay equity analysis across workforce dimensions. */
export function payEquityAnalysis(
  employees: readonly SbsEmployeeCompensationRecord[],
  thresholds?: SbsThresholdConfig | null,
): readonly SbsPayEquityGroupResult[] {
  const config = resolveSbsThresholds(thresholds);
  const results: SbsPayEquityGroupResult[] = [];

  for (const dimension of SBS_PAY_EQUITY_DIMENSIONS) {
    const groups = new Map<string, SbsEmployeeCompensationRecord[]>();

    for (const employee of employees) {
      const key = groupKeyForPayEquity(employee, dimension);
      if (!key) continue;
      const bucket = groups.get(key) ?? [];
      bucket.push(employee);
      groups.set(key, bucket);
    }

    for (const [groupKey, members] of groups) {
      if (members.length < 2) continue;
      const salaries = members.map((m) => m.baseSalary);
      const minSalary = Math.min(...salaries);
      const maxSalary = Math.max(...salaries);
      const med = medianOf(salaries);
      const disparityRatio =
        minSalary > 0 ? roundRatio(maxSalary / minSalary) : null;
      const flagged =
        disparityRatio != null &&
        disparityRatio >= config.payEquityDisparityRatio;

      results.push({
        dimension,
        groupKey,
        employeeCount: members.length,
        minSalary,
        maxSalary,
        medianSalary: med,
        disparityRatio,
        flagged,
        employeeIds: members.map((m) => m.employeeId),
      });
    }
  }

  return results;
}

/** Aggregates per-employee and cohort analysis for persistence (SBS-009..018). */
export function buildCompensationAnalysisSnapshot(input: {
  readonly benchmarkVersionId: string;
  readonly employees: readonly SbsEmployeeCompensationRecord[];
  readonly internalBandsByGrade: Readonly<
    Record<string, SbsInternalSalaryBand | null | undefined>
  >;
  readonly benchmarksByEmployeeId: Readonly<
    Record<string, SbsMarketBenchmark | null | undefined>
  >;
  readonly thresholds?: SbsThresholdConfig | null;
}): SbsCompensationAnalysisSnapshot {
  const thresholds = resolveSbsThresholds(input.thresholds);
  const employeeResults: SbsEmployeeAnalysisResult[] = [];

  for (const employee of input.employees) {
    const benchmark = input.benchmarksByEmployeeId[employee.employeeId];
    if (!benchmark) continue;

    const gradeKey = employee.grade?.trim() ?? "";
    const internalBand =
      gradeKey.length > 0
        ? (input.internalBandsByGrade[gradeKey] ?? null)
        : null;

    employeeResults.push(
      analyzeEmployeeCompensation({
        employee,
        internalBand,
        benchmark,
        thresholds,
      }),
    );
  }

  const payGapGroups = identifyPayGaps(input.employees, thresholds);
  const payEquityGroups = payEquityAnalysis(input.employees, thresholds);

  return {
    benchmarkVersionId: input.benchmarkVersionId,
    thresholds,
    employeeResults,
    payGapGroups,
    payEquityGroups,
    analyzedEmployeeCount: employeeResults.length,
    flaggedBelowTargetCount: employeeResults.filter((r) => r.belowTarget).length,
    flaggedAboveRangeCount: employeeResults.filter((r) => r.aboveRange).length,
  };
}
