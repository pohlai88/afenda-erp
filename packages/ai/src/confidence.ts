import {
  confidenceBreakdownSchema,
  type ConfidenceBreakdown,
} from "./schemas/operations";

export type ScoreAiConfidenceInput = {
  evidenceCount: number;
  directSourceCount: number;
  missingDataCount: number;
  userGoal?: string;
  taskRiskLevel?: "low" | "medium" | "high";
  historicalAccuracy?: number;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getConfidenceLevel(score: number) {
  if (score >= 75) {
    return "high" as const;
  }

  if (score >= 50) {
    return "medium" as const;
  }

  return "low" as const;
}

export function scoreAiConfidence(
  input: ScoreAiConfidenceInput,
): ConfidenceBreakdown {
  const dataQuality = clampScore(
    45 + input.directSourceCount * 8 + input.evidenceCount * 3 - input.missingDataCount * 12,
  );
  const goalLength = input.userGoal?.trim().length ?? 0;
  const intentClarity = clampScore(goalLength >= 40 ? 85 : goalLength >= 12 ? 65 : 40);
  const taskComplexity = clampScore(
    input.taskRiskLevel === "high" ? 52 : input.taskRiskLevel === "medium" ? 70 : 85,
  );
  const historicalAccuracy = clampScore(input.historicalAccuracy ?? 70);
  const groundingStrength = clampScore(
    input.evidenceCount === 0
      ? 25
      : 45 + input.directSourceCount * 10 - input.missingDataCount * 10,
  );
  const overall = clampScore(
    dataQuality * 0.28 +
      intentClarity * 0.18 +
      taskComplexity * 0.16 +
      historicalAccuracy * 0.16 +
      groundingStrength * 0.22,
  );
  const level = getConfidenceLevel(overall);
  const weakSignals = [
    dataQuality < 55 ? "data quality is limited" : null,
    groundingStrength < 55 ? "source grounding is limited" : null,
    input.missingDataCount > 0 ? "missing data should be reviewed" : null,
  ].filter((item): item is string => Boolean(item));

  return confidenceBreakdownSchema.parse({
    overall,
    level,
    dataQuality,
    intentClarity,
    taskComplexity,
    historicalAccuracy,
    groundingStrength,
    requiresHumanReview: input.taskRiskLevel === "high" || overall < 75,
    explanation:
      weakSignals.length > 0
        ? `${level} confidence because ${weakSignals.join(", ")}.`
        : `${level} confidence from direct evidence and clear intent.`,
  });
}
