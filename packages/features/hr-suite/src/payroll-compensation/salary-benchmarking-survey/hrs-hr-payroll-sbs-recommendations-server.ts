import { listHrSbsCpmRecommendationRefsWindow } from "@afenda/db";

export async function listHrSbsCpmRecommendationRefs(input: {
  organizationId: string;
  analysisId?: string;
  limit?: number;
  offset?: number;
}) {
  return listHrSbsCpmRecommendationRefsWindow(input);
}

export function deriveHrSbsBandReviewIndicator(input: {
  marketRatio: number | null;
  internalMidpoint: number | null;
  benchmarkMidpoint: number | null;
}): "expand_band" | "contract_band" | "realign_midpoint" | "no_change" {
  const { marketRatio, internalMidpoint, benchmarkMidpoint } = input;
  if (marketRatio != null && marketRatio < 90) return "expand_band";
  if (marketRatio != null && marketRatio > 115) return "contract_band";
  if (
    internalMidpoint != null &&
    benchmarkMidpoint != null &&
    Math.abs(internalMidpoint - benchmarkMidpoint) / benchmarkMidpoint > 0.1
  ) {
    return "realign_midpoint";
  }
  return "no_change";
}

export function deriveHrSbsMarketMovementIndicator(input: {
  priorMarketRatio: number | null;
  currentMarketRatio: number | null;
}): "rising" | "falling" | "stable" | "unknown" {
  const { priorMarketRatio, currentMarketRatio } = input;
  if (priorMarketRatio == null || currentMarketRatio == null) return "unknown";
  const delta = currentMarketRatio - priorMarketRatio;
  if (Math.abs(delta) < 2) return "stable";
  return delta > 0 ? "rising" : "falling";
}
