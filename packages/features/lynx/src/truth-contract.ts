export type LynxTruthEvidencePassage = {
  passage: number;
  id: string;
  title: string;
  excerpt: string;
  distance?: number;
  lexicalScore?: number;
  fusedRank?: number;
};

export type LynxTruthEvidenceData = {
  query: string;
  chunkCount: number;
  passages: LynxTruthEvidencePassage[];
};

export type LynxTruthValidation = {
  hasRequiredSections: boolean;
  missingSections: string[];
  citedPassages: number[];
  invalidCitations: number[];
  citationPrecision: number;
  unsupportedClaimRate: number;
};

const requiredTruthSections = [
  "Answer",
  "Evidence",
  "Limits",
  "Next step",
] as const;

export function extractLynxTruthCitations(text: string): number[] {
  const citations = new Set<number>();
  const citationPattern = /\[(\d+)\]/g;
  let match: RegExpExecArray | null;

  while ((match = citationPattern.exec(text)) !== null) {
    citations.add(Number(match[1]));
  }

  return [...citations].sort((a, b) => a - b);
}

export function validateLynxTruthResponse(input: {
  text: string;
  evidenceCount: number;
}): LynxTruthValidation {
  const normalized = input.text.toLowerCase();
  const missingSections = requiredTruthSections.filter(
    (section) => !normalized.includes(`${section.toLowerCase()}:`),
  );
  const citedPassages = extractLynxTruthCitations(input.text);
  const invalidCitations = citedPassages.filter(
    (citation) => citation < 1 || citation > input.evidenceCount,
  );
  const citationPrecision =
    citedPassages.length === 0
      ? input.evidenceCount === 0
        ? 1
        : 0
      : (citedPassages.length - invalidCitations.length) /
        citedPassages.length;

  return {
    hasRequiredSections: missingSections.length === 0,
    missingSections,
    citedPassages,
    invalidCitations,
    citationPrecision,
    unsupportedClaimRate: invalidCitations.length > 0 ? 1 : 0,
  };
}
