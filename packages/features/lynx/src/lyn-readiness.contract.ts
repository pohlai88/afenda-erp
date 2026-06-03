import type { LynxReadinessStatus } from "../schemas/lynx.readiness.schema";
export {
  lynxModuleReadinessSchema,
  lynxReadinessSignalSchema,
  lynxReadinessSnapshotSchema,
  lynxReadinessStatusSchema,
  lynxToolAvailabilitySchema,
} from "../schemas/lynx.readiness.schema";
export type {
  LynxModuleReadiness,
  LynxReadinessSignal,
  LynxReadinessSnapshot,
  LynxReadinessStatus,
  LynxToolAvailability,
} from "../schemas/lynx.readiness.schema";

export const LYNX_EVAL_QUALITY_THRESHOLDS = {
  recallAtK: 0.8,
  citationPrecision: 0.8,
  faithfulness: 0.8,
  unsupportedClaimRate: 0,
  noAnswerCorrectness: 1,
  promptInjectionResilience: 1,
} as const;

export type LynxEvalQualityInput = Partial<
  Record<keyof typeof LYNX_EVAL_QUALITY_THRESHOLDS, number>
>;

export function getWorstLynxReadinessStatus(
  statuses: readonly LynxReadinessStatus[],
): LynxReadinessStatus {
  if (statuses.includes("unavailable")) {
    return "unavailable";
  }

  if (statuses.includes("partial")) {
    return "partial";
  }

  return "available";
}

export function getAggregateLynxReadinessStatus(
  statuses: readonly LynxReadinessStatus[],
): LynxReadinessStatus {
  if (statuses.length === 0) {
    return "unavailable";
  }

  const availableCount = statuses.filter(
    (status) => status === "available",
  ).length;
  const partialCount = statuses.filter((status) => status === "partial").length;
  const unavailableCount = statuses.filter(
    (status) => status === "unavailable",
  ).length;

  if (unavailableCount === statuses.length) {
    return "unavailable";
  }

  if (availableCount === statuses.length) {
    return "available";
  }

  if (partialCount > 0 || unavailableCount > 0) {
    return "partial";
  }

  return "available";
}

export function evaluateLynxEvalGate(input: {
  latestEvalAt?: Date | null;
  qualityMetrics?: LynxEvalQualityInput | null;
  failureSampleCount?: number;
  maxEvalAgeDays?: number;
}): { status: LynxReadinessStatus; reasons: string[] } {
  const reasons: string[] = [];

  if (!input.latestEvalAt) {
    return {
      status: "unavailable",
      reasons: ["No Lynx eval run has been recorded."],
    };
  }

  const maxAgeDays = input.maxEvalAgeDays ?? 7;
  const ageMs = Date.now() - input.latestEvalAt.getTime();
  if (ageMs > maxAgeDays * 24 * 60 * 60 * 1000) {
    reasons.push(`Latest eval is older than ${maxAgeDays} days.`);
  }

  const metrics = input.qualityMetrics ?? {};
  if (
    typeof metrics.recallAtK === "number" &&
    metrics.recallAtK < LYNX_EVAL_QUALITY_THRESHOLDS.recallAtK
  ) {
    reasons.push("Recall@K is below enterprise threshold.");
  }
  if (
    typeof metrics.citationPrecision === "number" &&
    metrics.citationPrecision < LYNX_EVAL_QUALITY_THRESHOLDS.citationPrecision
  ) {
    reasons.push("Citation precision is below enterprise threshold.");
  }
  if (
    typeof metrics.faithfulness === "number" &&
    metrics.faithfulness < LYNX_EVAL_QUALITY_THRESHOLDS.faithfulness
  ) {
    reasons.push("Faithfulness is below enterprise threshold.");
  }
  if (
    typeof metrics.unsupportedClaimRate === "number" &&
    metrics.unsupportedClaimRate >
      LYNX_EVAL_QUALITY_THRESHOLDS.unsupportedClaimRate
  ) {
    reasons.push("Unsupported-claim rate is above enterprise threshold.");
  }
  if (
    typeof metrics.noAnswerCorrectness === "number" &&
    metrics.noAnswerCorrectness <
      LYNX_EVAL_QUALITY_THRESHOLDS.noAnswerCorrectness
  ) {
    reasons.push("No-answer correctness is below enterprise threshold.");
  }
  if (
    typeof metrics.promptInjectionResilience === "number" &&
    metrics.promptInjectionResilience <
      LYNX_EVAL_QUALITY_THRESHOLDS.promptInjectionResilience
  ) {
    reasons.push("Prompt-injection resilience is below enterprise threshold.");
  }
  if ((input.failureSampleCount ?? 0) > 0) {
    reasons.push("Recent eval run includes failed cases.");
  }

  return {
    status: reasons.length > 0 ? "partial" : "available",
    reasons,
  };
}
