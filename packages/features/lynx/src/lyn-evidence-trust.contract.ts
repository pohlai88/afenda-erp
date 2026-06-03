import type {
  LynxClaim,
  LynxClaimEvidenceLink,
  LynxClaimValidationResult,
  LynxClaimValidationStatus,
  LynxQualityGateResult,
  LynxQualityGateStatus,
} from "../schemas/lynx.evidence-trust.schema";
export {
  lynxClaimEvidenceLinkSchema,
  lynxClaimSchema,
  lynxClaimValidationResultSchema,
  lynxClaimValidationStatusSchema,
  lynxQualityGateResultSchema,
  lynxQualityGateStatusSchema,
} from "../schemas/lynx.evidence-trust.schema";
export type {
  LynxClaim,
  LynxClaimEvidenceLink,
  LynxClaimValidationResult,
  LynxClaimValidationStatus,
  LynxQualityGateResult,
  LynxQualityGateStatus,
} from "../schemas/lynx.evidence-trust.schema";

export type LynxClaimValidationEvidence = {
  id: string;
  passage?: number;
  title?: string;
  excerpt?: string;
};

export type LynxClaimValidationMode = "truth" | "operator";

const declinePatterns = [
  /\bnot enough evidence\b/i,
  /\binsufficient evidence\b/i,
  /\bcannot determine\b/i,
  /\bcan'?t determine\b/i,
  /\bno evidence\b/i,
  /\bno relevant evidence\b/i,
  /\bi don'?t know\b/i,
];

const promptInjectionPatterns = [
  /\bignore (all )?(previous|prior) instructions\b/i,
  /\bsystem prompt\b/i,
  /\bdeveloper message\b/i,
  /\breveal (the )?(prompt|instructions|secrets)\b/i,
  /\bexfiltrate\b/i,
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractAnswerSection(answer: string) {
  const markdownAnswerMatch = /(?:^|\n)\s*###\s+Answer\s*$/im.exec(answer);
  const legacyAnswerMatch = /(?:^|\n)\s*answer:\s*/i.exec(answer);
  const start = markdownAnswerMatch
    ? markdownAnswerMatch.index + markdownAnswerMatch[0].length
    : legacyAnswerMatch
      ? legacyAnswerMatch.index + legacyAnswerMatch[0].length
      : 0;
  const afterAnswer = answer.slice(start);
  const nextSection =
    /\n\s*###\s+(Evidence used|Limitations|Next safe action)\s*$/im.exec(
      afterAnswer,
    ) ?? /\n\s*(evidence|limits|next step):\s*/i.exec(afterAnswer);

  return nextSection ? afterAnswer.slice(0, nextSection.index) : afterAnswer;
}

function isDeclineAnswer(answer: string) {
  return declinePatterns.some((pattern) => pattern.test(answer));
}

function containsPromptInjectionText(value: string) {
  return promptInjectionPatterns.some((pattern) => pattern.test(value));
}

function extractCitationNumbers(text: string): number[] {
  const citations = new Set<number>();
  const pattern = /\[(\d+)\]/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    citations.add(Number(match[1]));
  }

  return [...citations].sort((a, b) => a - b);
}

function extractClaims(answer: string): string[] {
  const withoutHeadings = extractAnswerSection(answer)
    .split(/\r?\n/)
    .map((line) => {
      const normalized = normalizeWhitespace(
        line.replace(/^\s*#{1,6}\s+/, "").replace(/^\s*[-*]\s+/, ""),
      );
      if (
        /^(answer|evidence|limits|limitations|next step|next safe action):/i.test(
          normalized,
        )
      ) {
        return "";
      }

      return normalizeWhitespace(
        normalized.replace(/^[A-Z][\w ]{1,32}:\s*/, ""),
      );
    })
    .filter(Boolean)
    .join(" ");

  return withoutHeadings
    .split(/(?<=[.!?])\s+/)
    .map(normalizeWhitespace)
    .filter((claim) => claim.length >= 8)
    .slice(0, 20);
}

function average(values: readonly number[]) {
  if (values.length === 0) return 1;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function toClaimId(index: number) {
  return `claim_${String(index + 1).padStart(2, "0")}`;
}

export function validateLynxClaims(input: {
  answer: string;
  evidence: readonly LynxClaimValidationEvidence[];
  mode: LynxClaimValidationMode;
}): LynxClaimValidationResult[] {
  const evidenceByPassage = new Map<number, LynxClaimValidationEvidence>();
  for (const item of input.evidence) {
    if (typeof item.passage === "number") {
      evidenceByPassage.set(item.passage, item);
    }
  }

  if (!input.answer.trim()) {
    return [];
  }

  if (input.evidence.length === 0 && isDeclineAnswer(input.answer)) {
    const claim: LynxClaim = {
      id: toClaimId(0),
      text: normalizeWhitespace(input.answer),
      citedEvidenceIds: [],
    };

    return [
      {
        claim,
        status: "declined",
        evidenceLinks: [],
        reason: "Lynx declined because no evidence was available.",
      },
    ];
  }

  return extractClaims(input.answer).map((text, index) => {
    const claimId = toClaimId(index);
    const citations = extractCitationNumbers(text);
    const citedLinks = citations
      .map((citation) => {
        const evidence = evidenceByPassage.get(citation);
        if (!evidence) return null;

        const excerpt = evidence.excerpt ?? "";
        if (containsPromptInjectionText(`${evidence.title ?? ""} ${excerpt}`)) {
          return null;
        }

        return {
          claimId,
          evidenceId: evidence.id,
          ...(evidence.passage ? { passage: evidence.passage } : {}),
          ...(evidence.title ? { title: evidence.title } : {}),
          ...(evidence.excerpt ? { excerpt: evidence.excerpt } : {}),
        } satisfies LynxClaimEvidenceLink;
      })
      .filter((link): link is LynxClaimEvidenceLink => Boolean(link));
    const fallbackLinks =
      input.mode === "operator" && citations.length === 0
        ? input.evidence.slice(0, 3).map((evidence) => ({
            claimId,
            evidenceId: evidence.id,
            ...(evidence.passage ? { passage: evidence.passage } : {}),
            ...(evidence.title ? { title: evidence.title } : {}),
            ...(evidence.excerpt ? { excerpt: evidence.excerpt } : {}),
          }))
        : [];
    const links = citedLinks.length > 0 ? citedLinks : fallbackLinks;
    const claim: LynxClaim = {
      id: claimId,
      text,
      citedEvidenceIds: links.map((link) => link.evidenceId),
    };
    const status: LynxClaimValidationStatus =
      input.mode === "operator" && citations.length === 0 && links.length > 0
        ? "partially_supported"
        : citations.length === 0 || links.length === 0
          ? "unsupported"
          : links.length === citations.length
            ? "supported"
            : "partially_supported";

    return {
      claim,
      status,
      evidenceLinks: links,
      reason:
        status === "supported"
          ? "Every citation resolves to trusted evidence."
          : status === "partially_supported"
            ? "Some citations did not resolve to trusted evidence."
            : citations.length > 0
              ? "Cited evidence was unavailable or failed trust checks."
              : "No trusted evidence citation supports this claim.",
    };
  });
}

export function summarizeLynxQualityGate(
  validationResults: readonly LynxClaimValidationResult[],
): LynxQualityGateResult {
  const generatedAt = new Date().toISOString();
  const claimResults = validationResults.filter(
    (result) => result.status !== "declined",
  );
  const unsupportedClaimCount = validationResults.filter(
    (result) => result.status === "unsupported",
  ).length;
  const partiallySupportedClaimCount = validationResults.filter(
    (result) => result.status === "partially_supported",
  ).length;
  const citedClaimCount = claimResults.filter(
    (result) => result.evidenceLinks.length > 0,
  ).length;
  const citationPrecision =
    claimResults.length === 0 ? 1 : citedClaimCount / claimResults.length;
  const noAnswerCorrectness =
    validationResults.length === 1 &&
    validationResults[0]?.status === "declined"
      ? 1
      : validationResults.length === 0
        ? 0
        : 1;
  const promptInjectionResilience = validationResults.some((result) =>
    result.reason.toLowerCase().includes("failed trust checks"),
  )
    ? 0
    : 1;
  const reasons = [
    unsupportedClaimCount > 0
      ? `${unsupportedClaimCount} unsupported claim(s).`
      : null,
    partiallySupportedClaimCount > 0
      ? `${partiallySupportedClaimCount} partially supported claim(s).`
      : null,
    noAnswerCorrectness === 0 ? "Lynx did not decline an empty answer." : null,
    promptInjectionResilience === 0
      ? "Cited evidence failed prompt-injection trust checks."
      : null,
  ].filter((reason): reason is string => Boolean(reason));
  const status: LynxQualityGateStatus =
    unsupportedClaimCount > 0 ||
    noAnswerCorrectness === 0 ||
    promptInjectionResilience === 0
      ? "failed"
      : partiallySupportedClaimCount > 0
        ? "review"
        : "passed";

  return {
    status,
    unsupportedClaimCount,
    citationPrecision,
    noAnswerCorrectness,
    promptInjectionResilience,
    reasons,
    generatedAt,
  };
}

export function combineLynxQualityGates(
  gates: readonly LynxQualityGateResult[],
): LynxQualityGateResult {
  const generatedAt = new Date().toISOString();

  if (gates.length === 0) {
    return {
      status: "review",
      unsupportedClaimCount: 0,
      citationPrecision: 1,
      noAnswerCorrectness: 1,
      promptInjectionResilience: 1,
      reasons: ["No quality-gate events were recorded."],
      generatedAt,
    };
  }

  const unsupportedClaimCount = gates.reduce(
    (total, gate) => total + gate.unsupportedClaimCount,
    0,
  );
  const failedCount = gates.filter((gate) => gate.status === "failed").length;
  const reviewCount = gates.filter((gate) => gate.status === "review").length;
  const status: LynxQualityGateStatus =
    failedCount > 0 ? "failed" : reviewCount > 0 ? "review" : "passed";

  return {
    status,
    unsupportedClaimCount,
    citationPrecision: average(gates.map((gate) => gate.citationPrecision)),
    noAnswerCorrectness: Math.min(
      ...gates.map((gate) => gate.noAnswerCorrectness),
    ),
    promptInjectionResilience: Math.min(
      ...gates.map((gate) => gate.promptInjectionResilience),
    ),
    reasons: gates.flatMap((gate) => gate.reasons),
    generatedAt,
  };
}
