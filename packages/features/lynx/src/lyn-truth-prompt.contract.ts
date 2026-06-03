import { LYNX_TRUTH_RESPONSE_SECTIONS } from "./lynx.core.contract";

export type TruthPromptContext = {
  organizationId: string;
  query: string;
  chunks: readonly {
    id: string;
    title: string;
    body: string;
    index?: number;
  }[];
  retrievalState?: {
    status: "ok" | "no_evidence" | "degraded";
    degradedReason?: string;
  };
};

/**
 * Builds the truth retrieval system prompt.
 * Enforces the mandatory four-section response format.
 *
 * Governance rules:
 * - Model must NOT invent facts not present in retrieved passages.
 * - Model must NOT reference external systems unless they appear in passages.
 * - Citations use [1], [2] format matching passage numbers.
 * - The four sections must appear in order, every response.
 */
export function buildLynxTruthSystemPrompt(ctx: TruthPromptContext): string {
  const passageLines = ctx.chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.title}\n${chunk.body}`)
    .join("\n\n---\n\n");

  const sectionList = LYNX_TRUTH_RESPONSE_SECTIONS.map((s) => `- ${s}`).join(
    "\n",
  );
  const degradedLimitationsRule =
    ctx.retrievalState?.status === "degraded"
      ? "- In '### Limitations': explicitly state that evidence retrieval was degraded or partially failed."
      : null;
  const retrievalStateLine =
    ctx.retrievalState?.status === "degraded"
      ? `RETRIEVAL STATE: degraded (${ctx.retrievalState.degradedReason ?? "unknown reason"})`
      : ctx.retrievalState?.status === "no_evidence"
        ? "RETRIEVAL STATE: no_evidence"
        : "RETRIEVAL STATE: ok";

  return [
    "You are the truth layer of the Afenda machine. Your role is to resolve factual questions",
    "using only the knowledge passages provided. Do not invent facts.",
    "",
    "MANDATORY RESPONSE FORMAT (always produce exactly these four sections in order):",
    sectionList,
    "",
    "RESPONSE RULES:",
    "- In '### Answer': cite passages using [1], [2] etc. If no passage supports a claim, state it is unknown.",
    "- In '### Evidence used': list the passage numbers and titles you cited.",
    "- In '### Limitations': state what is unknown or not covered by the passages provided.",
    degradedLimitationsRule,
    "- In '### Next safe action': recommend one concrete, low-risk step for a human operator.",
    "  Never recommend autonomous system changes.",
    "",
    "RETRIEVED KNOWLEDGE PASSAGES:",
    passageLines || "(No passages were retrieved for this query.)",
    retrievalStateLine,
    "",
    `QUERY: ${ctx.query}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
