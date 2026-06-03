import {
  DEFAULT_HR_AAT_ABSENCE_RISK_THRESHOLDS,
  formatHrAatAbsenceRiskLevelLabel,
  hrAatAbsenceRiskThresholdsSchema,
  type HrAatAbsenceRiskLevel,
  type HrAatAbsenceRiskThresholds,
} from "./hr.time.aat-risk.schema";

const RISK_LEVEL_ORDER: readonly HrAatAbsenceRiskLevel[] = [
  "normal",
  "watch",
  "at_risk",
  "high_risk",
  "critical",
];

export class HrAatRiskThresholdPolicyError extends Error {
  readonly code = "aat_invalid_risk_thresholds" as const;

  constructor(message: string) {
    super(message);
    this.name = "HrAatRiskThresholdPolicyError";
  }
}

/** HRM-AAT-018 — parse and validate org risk threshold configuration. */
export function parseHrAatAbsenceRiskThresholds(
  input: unknown,
): HrAatAbsenceRiskThresholds {
  const parsed = hrAatAbsenceRiskThresholdsSchema.safeParse(input);
  if (!parsed.success) {
    throw new HrAatRiskThresholdPolicyError(
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }
  return parsed.data;
}

export function resolveHrAatAbsenceRiskThresholds(
  stored: Partial<HrAatAbsenceRiskThresholds> | null | undefined,
): HrAatAbsenceRiskThresholds {
  if (!stored) {
    return DEFAULT_HR_AAT_ABSENCE_RISK_THRESHOLDS;
  }
  return parseHrAatAbsenceRiskThresholds({
    ...DEFAULT_HR_AAT_ABSENCE_RISK_THRESHOLDS,
    ...stored,
  });
}

function riskLevelFromRate(
  absenceRatePercent: number,
  thresholds: HrAatAbsenceRiskThresholds,
): HrAatAbsenceRiskLevel {
  if (absenceRatePercent >= thresholds.criticalAbsenceRatePercent) {
    return "critical";
  }
  if (absenceRatePercent >= thresholds.highRiskAbsenceRatePercent) {
    return "high_risk";
  }
  if (absenceRatePercent >= thresholds.atRiskAbsenceRatePercent) {
    return "at_risk";
  }
  if (absenceRatePercent >= thresholds.watchAbsenceRatePercent) {
    return "watch";
  }
  return "normal";
}

function riskLevelFromFrequency(
  absenceFrequency: number,
  thresholds: HrAatAbsenceRiskThresholds,
): HrAatAbsenceRiskLevel {
  if (absenceFrequency >= thresholds.criticalAbsenceFrequency) {
    return "critical";
  }
  if (absenceFrequency >= thresholds.highRiskAbsenceFrequency) {
    return "high_risk";
  }
  if (absenceFrequency >= thresholds.atRiskAbsenceFrequency) {
    return "at_risk";
  }
  if (absenceFrequency >= thresholds.watchAbsenceFrequency) {
    return "watch";
  }
  return "normal";
}

function maxRiskLevel(
  left: HrAatAbsenceRiskLevel,
  right: HrAatAbsenceRiskLevel,
): HrAatAbsenceRiskLevel {
  const leftIndex = RISK_LEVEL_ORDER.indexOf(left);
  const rightIndex = RISK_LEVEL_ORDER.indexOf(right);
  return leftIndex >= rightIndex ? left : right;
}

export type ClassifyHrAatAbsenceRiskInput = {
  absenceRatePercent: number;
  absenceFrequency: number;
  thresholds?: HrAatAbsenceRiskThresholds;
};

export type ClassifyHrAatAbsenceRiskResult = {
  riskLevel: HrAatAbsenceRiskLevel;
  riskLevelLabel: string;
  breachedSignals: Array<"absence_rate" | "absence_frequency">;
};

/** HRM-AAT-019 — classify absence risk from metrics and configured thresholds. */
export function classifyHrAatAbsenceRisk(
  input: ClassifyHrAatAbsenceRiskInput,
): ClassifyHrAatAbsenceRiskResult {
  const thresholds = resolveHrAatAbsenceRiskThresholds(input.thresholds);
  const rateLevel = riskLevelFromRate(input.absenceRatePercent, thresholds);
  const frequencyLevel = riskLevelFromFrequency(
    input.absenceFrequency,
    thresholds,
  );
  const riskLevel = maxRiskLevel(rateLevel, frequencyLevel);
  const breachedSignals: ClassifyHrAatAbsenceRiskResult["breachedSignals"] = [];

  if (rateLevel !== "normal") {
    breachedSignals.push("absence_rate");
  }
  if (frequencyLevel !== "normal") {
    breachedSignals.push("absence_frequency");
  }

  return {
    riskLevel,
    riskLevelLabel: formatHrAatAbsenceRiskLevelLabel(riskLevel),
    breachedSignals,
  };
}
