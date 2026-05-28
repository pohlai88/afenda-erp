import { embed, embedMany } from "ai";

import {
  createGatewayOptions,
  hasAiGatewayRuntimeCredentials,
  resolveEmbeddingModel,
  type AiGatewayFeature,
} from "@afenda/ai/server";

import {
  DEFAULT_EMBEDDING_MODEL,
  KNOWLEDGE_EMBEDDING_DIMENSIONS,
} from "../contracts/knowledge.core.contract";

type EmbedManyProviderOptions = NonNullable<
  Parameters<typeof embedMany>[0]["providerOptions"]
>;

export type KnowledgeEmbeddingTelemetry = {
  organizationId?: string;
  userId?: string;
  feature?: Extract<
    AiGatewayFeature,
    "knowledge-retrieval" | "knowledge-ingest"
  >;
  moduleId?: string;
  requestId?: string;
};

function getEmbeddingModelId(): string {
  return process.env.EMBEDDING_MODEL?.trim() ?? DEFAULT_EMBEDDING_MODEL;
}

function assertGatewayCredentials(): void {
  if (!hasAiGatewayRuntimeCredentials()) {
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

function createEmbeddingProviderOptions(input?: {
  telemetry?: KnowledgeEmbeddingTelemetry;
  enforceZdr?: boolean;
}): EmbedManyProviderOptions {
  const providerOptions: EmbedManyProviderOptions = {
    openai: { dimensions: KNOWLEDGE_EMBEDDING_DIMENSIONS },
  };

  if (input?.telemetry?.organizationId && input.telemetry.userId) {
    providerOptions.gateway = createGatewayOptions({
      organizationId: input.telemetry.organizationId,
      userId: input.telemetry.userId,
      feature: input.telemetry.feature ?? "knowledge-retrieval",
      moduleId: input.telemetry.moduleId ?? "lynx",
      zeroDataRetention: input.enforceZdr,
    }).gateway;
  } else if (input?.enforceZdr) {
    providerOptions.gateway = {
      zeroDataRetention: true,
    };
  }

  if (input?.telemetry?.requestId && providerOptions.gateway) {
    const existingTags = Array.isArray(providerOptions.gateway.tags)
      ? providerOptions.gateway.tags
      : [];
    providerOptions.gateway.tags = [
      ...existingTags,
      `request:${input.telemetry.requestId}`,
    ];
  }

  return providerOptions;
}

/**
 * Embed a single query text for similarity search.
 * Intended for interactive paths (truth-search route handler, operator tool).
 */
export async function embedKnowledgeText(
  text: string,
  options?: { telemetry?: KnowledgeEmbeddingTelemetry; enforceZdr?: boolean },
): Promise<number[]> {
  assertGatewayCredentials();

  const modelId = getEmbeddingModelId();

  const { embedding } = await embed({
    model: resolveEmbeddingModel(modelId),
    value: text,
    providerOptions: createEmbeddingProviderOptions(options),
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
  options?: {
    enforceZdr?: boolean;
    telemetry?: KnowledgeEmbeddingTelemetry;
  },
): Promise<EmbeddedBatch> {
  if (chunks.length === 0) {
    return { embeddingModelVersion: getEmbeddingModelId(), vectors: [] };
  }

  assertGatewayCredentials();

  const modelId = getEmbeddingModelId();

  const providerOptions = createEmbeddingProviderOptions(options);

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
