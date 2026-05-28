import {
  KNOWLEDGE_CHUNK_OVERLAP_TOKENS,
  KNOWLEDGE_CHUNK_TARGET_TOKENS,
} from "../constants";

export type KnowledgeChunk = {
  index: number;
  title: string;
  body: string;
  tokenCount: number;
};

const WORDS_PER_TOKEN = 0.75;

function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_TOKEN));
}

/**
 * Deterministic word-window chunker.
 * Keeps implementation simple — quality upgrades should be centralised here.
 *
 * Invariants:
 * - Same input always produces the same chunks (no randomness).
 * - Chunks carry the document title as context.
 * - Empty body → single chunk with the title.
 */
export function chunkKnowledgeDocument(args: {
  title: string;
  body: string;
  targetTokens?: number;
  overlapTokens?: number;
}): KnowledgeChunk[] {
  const targetTokens = args.targetTokens ?? KNOWLEDGE_CHUNK_TARGET_TOKENS;
  const overlapTokens = Math.min(
    args.overlapTokens ?? KNOWLEDGE_CHUNK_OVERLAP_TOKENS,
    targetTokens - 1,
  );

  const words = args.body.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return [
      {
        index: 0,
        title: args.title,
        body: args.body,
        tokenCount: estimateTokens(args.body),
      },
    ];
  }

  const wordsPerChunk = Math.max(1, Math.floor(targetTokens * WORDS_PER_TOKEN));
  const overlapWords = Math.max(
    0,
    Math.floor(overlapTokens * WORDS_PER_TOKEN),
  );
  const step = Math.max(1, wordsPerChunk - overlapWords);

  const chunks: KnowledgeChunk[] = [];
  for (let start = 0; start < words.length; start += step) {
    const end = Math.min(words.length, start + wordsPerChunk);
    const body = words.slice(start, end).join(" ");
    chunks.push({
      index: chunks.length,
      title: args.title,
      body,
      tokenCount: estimateTokens(body),
    });
    if (end >= words.length) break;
  }

  return chunks;
}
