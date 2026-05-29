import type { LynxRunEventSummary } from "@afenda/db";

export function summarizeValidation(metrics: Record<string, unknown>) {
  const qualityGate =
    typeof metrics.qualityGate === "object" && metrics.qualityGate !== null
      ? (metrics.qualityGate as Record<string, unknown>)
      : null;

  if (typeof qualityGate?.status === "string") {
    return qualityGate.status;
  }

  const hasRequiredSections = metrics.hasRequiredSections;
  const invalidCitations = metrics.invalidCitations;

  if (Object.keys(metrics).length === 0) {
    return "-";
  }

  if (
    hasRequiredSections === false ||
    (Array.isArray(invalidCitations) && invalidCitations.length > 0)
  ) {
    return "review";
  }

  return "passed";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getClaimRows(events: LynxRunEventSummary[]) {
  return events.flatMap((event) => {
    const claims = event.metadata.claims;
    if (!Array.isArray(claims)) {
      return [];
    }

    return claims.filter(isRecord).map((result, index) => {
      const claim = isRecord(result.claim) ? result.claim : {};
      const evidenceLinks = Array.isArray(result.evidenceLinks)
        ? result.evidenceLinks.filter(isRecord)
        : [];

      return {
        id: `${event.id}.${index}`,
        claim: typeof claim.text === "string" ? claim.text : "-",
        status: typeof result.status === "string" ? result.status : "-",
        evidence:
          evidenceLinks
            .map((link) =>
              typeof link.evidenceId === "string" ? link.evidenceId : null,
            )
            .filter(Boolean)
            .join(", ") || "-",
        reason: typeof result.reason === "string" ? result.reason : "-",
      };
    });
  });
}
