import { LYNX_TRUTH_RESPONSE_SECTIONS } from "./lynx.core.contract";
export {
  lynxTruthEvidenceDataSchema,
  lynxTruthEvidencePassageSchema,
  lynxTruthQualityGateDataSchema,
  lynxTruthRetrievalStateDataSchema,
} from "../schemas/lynx.truth.schema";
export type {
  LynxTruthEvidenceData,
  LynxTruthEvidencePassage,
  LynxTruthQualityGateData,
  LynxTruthRetrievalStateData,
  LynxTruthRetrievalStatus,
} from "../schemas/lynx.truth.schema";

export type LynxTruthValidation = {
  hasRequiredSections: boolean;
  missingSections: string[];
  unexpectedSections: string[];
  duplicateSections: string[];
  sectionOrderValid: boolean;
  citedPassages: number[];
  invalidCitations: number[];
  citationPrecision: number;
  unsupportedClaimRate: number;
  degradedLimitationsValid: boolean;
};

const truthHeadingPattern = /^\s*###\s+(.+?)\s*$/gim;

function extractTruthHeadings(text: string) {
  return [...text.matchAll(truthHeadingPattern)].map((match) => ({
    heading: `### ${match[1]?.trim() ?? ""}`,
    index: match.index ?? 0,
    length: match[0].length,
  }));
}

function uniqueValues(values: readonly string[]) {
  return [...new Set(values)];
}

function duplicateValues(values: readonly string[]) {
  return uniqueValues(
    values.filter((value, index) => values.indexOf(value) !== index),
  );
}

function areRequiredSectionsInOrder(headings: readonly { heading: string }[]) {
  let cursor = 0;

  for (const expected of LYNX_TRUTH_RESPONSE_SECTIONS) {
    const foundIndex = headings.findIndex(
      (item, index) => index >= cursor && item.heading === expected,
    );
    if (foundIndex === -1) {
      return false;
    }
    cursor = foundIndex + 1;
  }

  return true;
}

function extractSectionBody(
  text: string,
  headings: readonly { heading: string; index: number; length: number }[],
  heading: string,
) {
  const sectionIndex = headings.findIndex((item) => item.heading === heading);
  if (sectionIndex === -1) return "";

  const section = headings[sectionIndex]!;
  const nextSection = headings[sectionIndex + 1];
  const start = section.index + section.length;
  const end = nextSection ? nextSection.index : text.length;

  return text.slice(start, end).trim();
}

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
  retrievalStatus?: "ok" | "no_evidence" | "degraded";
}): LynxTruthValidation {
  const headings = extractTruthHeadings(input.text);
  const observedHeadings = headings.map((item) => item.heading);
  const missingSections = LYNX_TRUTH_RESPONSE_SECTIONS.filter(
    (section) => !observedHeadings.includes(section),
  );
  const unexpectedSections = uniqueValues(
    observedHeadings.filter(
      (heading) =>
        !LYNX_TRUTH_RESPONSE_SECTIONS.includes(
          heading as (typeof LYNX_TRUTH_RESPONSE_SECTIONS)[number],
        ),
    ),
  );
  const duplicateSections = duplicateValues(observedHeadings);
  const sectionOrderValid =
    missingSections.length === 0 && areRequiredSectionsInOrder(headings);
  const citedPassages = extractLynxTruthCitations(input.text);
  const invalidCitations = citedPassages.filter(
    (citation) => citation < 1 || citation > input.evidenceCount,
  );
  const citationPrecision =
    citedPassages.length === 0
      ? input.evidenceCount === 0
        ? 1
        : 0
      : (citedPassages.length - invalidCitations.length) / citedPassages.length;
  const limitationsBody = extractSectionBody(
    input.text,
    headings,
    "### Limitations",
  );
  const degradedLimitationsValid =
    input.retrievalStatus !== "degraded" ||
    /\b(degraded|failed|failure|unavailable|partial|partially)\b/i.test(
      limitationsBody,
    );

  return {
    hasRequiredSections:
      missingSections.length === 0 &&
      unexpectedSections.length === 0 &&
      duplicateSections.length === 0 &&
      sectionOrderValid &&
      degradedLimitationsValid,
    missingSections,
    unexpectedSections,
    duplicateSections,
    sectionOrderValid,
    citedPassages,
    invalidCitations,
    citationPrecision,
    unsupportedClaimRate: invalidCitations.length > 0 ? 1 : 0,
    degradedLimitationsValid,
  };
}
