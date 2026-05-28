import "server-only";

import { embed, embedMany } from "ai";

import {
  hasAiGatewayCredentials,
  resolveEmbeddingModel,
} from "@afenda/ai";

import {
  DEFAULT_EMBEDDING_MODEL,
  KNOWLEDGE_EMBEDDING_DIMENSIONS,
} from "../constants";

type EmbedManyProviderOptions = NonNullable<
  Parameters<typeof embedMany>[0]["providerOptions"]
>;

function getEmbeddingModelId(): string {
  return process.env.EMBEDDING_MODEL?.trim() ?? DEFAULT_EMBEDDING_MODEL;
}

function assertGatewayCredentials(): void {
  if (!hasAiGatewayCredentials()) {
    throw new Error(
      "AI Gateway credentials missing (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN)",
    );
  }
}

function validateEmbedding(embedding: number[]): void {
  if (embedding.length !== KNOWLEDGE_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding length ${embedding.length} does not match schema (${KNOWLEDGE_EMBEDDING_DIMENSIONS})`,
    );
  }
}

/**
 * Embed a single query text for similarity search.
 * Intended for interactive paths (truth-search route handler, operator tool).
 */
export async function embedKnowledgeText(text: string): Promise<number[]> {
  assertGatewayCredentials();

  const modelId = getEmbeddingModelId();

  const { embedding } = await embed({
    model: resolveEmbeddingModel(modelId),
    value: text,
    providerOptions: {
      openai: { dimensions: KNOWLEDGE_EMBEDDING_DIMENSIONS },
    } as const,
  });

  validateEmbedding(embedding);
  return embedding;
}

export type EmbeddedBatch = {
  embeddingModelVersion: string;
  vectors: number[][];
};

/**
 * Batch-embed multiple text chunks.
 * Intended for background pipeline paths (sync cron, manual ingest).
 * ZDR is opt-in via per-org setting.
 */
export async function embedKnowledgeBatch(
  _organizationId: string,
  chunks: string[],
  options?: { enforceZdr?: boolean },
): Promise<EmbeddedBatch> {
  if (chunks.length === 0) {
    return { embeddingModelVersion: getEmbeddingModelId(), vectors: [] };
  }

  assertGatewayCredentials();

  const modelId = getEmbeddingModelId();

  const providerOptions: EmbedManyProviderOptions = {
    openai: { dimensions: KNOWLEDGE_EMBEDDING_DIMENSIONS },
  };

  if (options?.enforceZdr) {
    providerOptions.gateway = {
      zeroDataRetention: true,
    };
  }

  const { embeddings } = await embedMany({
    model: resolveEmbeddingModel(modelId),
    values: chunks,
    maxRetries: 2,
    providerOptions,
  });

  for (const vector of embeddings) {
    validateEmbedding(vector);
  }

  return { embeddingModelVersion: modelId, vectors: embeddings };
}
