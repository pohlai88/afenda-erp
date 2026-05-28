import {
  getAiEnv,
  getBaseEnv,
  hasAiGatewayCredentials as configHasAiGatewayCredentials,
  resolveAiGatewayReportApiKey,
} from "@afenda/config/env";
import { APICallError, createGateway } from "ai";

// Verify against gateway /v1/models when credentials are available.
// AFENDA_AI_MODEL / AFENDA_AI_FAST_MODEL / AFENDA_AI_HIGH_CONFIDENCE_MODEL env
// vars override these at deploy time so no redeploy is needed for model changes.
export const defaultAiGatewayModel = "openai/gpt-5.5";
export const defaultFastAiGatewayModel = "openai/gpt-5.5";
export const defaultHighConfidenceAiGatewayModel = "anthropic/claude-opus-4.7";

export const aiGatewayFeatures = [
  "erp-assistant",
  "document-extraction",
  "approval-tools",
  "workspace-summary",
  "record-search",
  "document-lookup",
  "task-drafting",
  "report-narrative",
  "anomaly-explanation",
  "admin-audit-summary",
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
] as const;

export type AiGatewayFeature = (typeof aiGatewayFeatures)[number];
export type AiRiskLevel = "low" | "medium" | "high";
export type AiCacheMode = "none" | "deterministic";
export type AiJsonValue =
  | null
  | string
  | number
  | boolean
  | AiJsonValue[]
  | AiJsonObject;
export type AiJsonObject = {
  [key: string]: AiJsonValue | undefined;
};
export type AiGatewayProviderOptions = Record<string, AiJsonObject> & {
  gateway: AiJsonObject;
};

function toGatewayTagValue(value: string | undefined, fallback: string) {
  const normalized = (value ?? fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

  return normalized || fallback;
}

export function getAiGatewayEnvironment(
  input: NodeJS.ProcessEnv = process.env,
) {
  const env = getAiEnv(input);
  const base = getBaseEnv(input);

  return toGatewayTagValue(env.VERCEL_ENV ?? base.NODE_ENV, "development");
}

export function getAiGatewayModel(input: NodeJS.ProcessEnv = process.env) {
  const env = getAiEnv(input);
  return env.AFENDA_AI_MODEL || defaultAiGatewayModel;
}

export function getAiModelForFeature(
  feature: AiGatewayFeature,
  riskLevel: AiRiskLevel = "medium",
  input: NodeJS.ProcessEnv = process.env,
) {
  const env = getAiEnv(input);

  if (env.AFENDA_AI_MODEL) {
    return env.AFENDA_AI_MODEL;
  }

  if (
    riskLevel === "high" ||
    feature === "approval-tools" ||
    feature === "solution-provider"
  ) {
    return (
      env.AFENDA_AI_HIGH_CONFIDENCE_MODEL || defaultHighConfidenceAiGatewayModel
    );
  }

  if (
    feature === "record-search" ||
    feature === "document-lookup" ||
    feature === "task-drafting"
  ) {
    return env.AFENDA_AI_FAST_MODEL || defaultFastAiGatewayModel;
  }

  return defaultAiGatewayModel;
}

export function hasAiGatewayCredentials(
  input: NodeJS.ProcessEnv = process.env,
) {
  return configHasAiGatewayCredentials(input);
}

export function resolveLanguageModel(modelId: string) {
  return modelId;
}

export function resolveEmbeddingModel(modelId: string) {
  return modelId;
}

export function resolveRerankingModel(modelId: string) {
  return modelId;
}

export function createGatewayOptions(input: {
  organizationId: string;
  userId: string;
  feature: AiGatewayFeature;
  moduleId?: string;
  workflowId?: string;
  workflowSessionId?: string;
  qualityGate?: string;
  riskLevel?: AiRiskLevel;
  environment?: string;
  cacheMode?: AiCacheMode;
  providerOrder?: readonly string[];
  fallbackModels?: readonly string[];
  zeroDataRetention?: boolean;
}): AiGatewayProviderOptions {
  const riskLevel = input.riskLevel ?? "medium";
  const environment = toGatewayTagValue(input.environment, "development");
  const moduleId = toGatewayTagValue(input.moduleId, "global");
  const workflowId = input.workflowId
    ? toGatewayTagValue(input.workflowId, "workflow")
    : null;
  const workflowSessionId = input.workflowSessionId
    ? toGatewayTagValue(input.workflowSessionId, "workflow-session")
    : null;
  const qualityGate = input.qualityGate
    ? toGatewayTagValue(input.qualityGate, "quality-gate")
    : null;
  const organizationId = toGatewayTagValue(input.organizationId, "unknown");
  const gateway: AiJsonObject = {
    user: input.userId,
    tags: [
      `feature:${input.feature}`,
      `organization:${organizationId}`,
      `module:${moduleId}`,
      `env:${environment}`,
      `risk:${riskLevel}`,
      ...(workflowId ? [`workflow:${workflowId}`] : []),
      ...(workflowSessionId ? [`workflowSession:${workflowSessionId}`] : []),
      ...(qualityGate ? [`qualityGate:${qualityGate}`] : []),
    ],
    disallowPromptTraining: true,
  };

  if (input.cacheMode === "deterministic") {
    gateway.cacheControl = "max-age=3600";
  }

  if (input.providerOrder && input.providerOrder.length > 0) {
    gateway.order = [...input.providerOrder] as AiJsonValue[];
  }

  if (input.fallbackModels && input.fallbackModels.length > 0) {
    gateway.models = [...input.fallbackModels] as AiJsonValue[];
  }

  if (input.zeroDataRetention) {
    gateway.zeroDataRetention = true;
  }

  return { gateway };
}

export function createGatewayMetadata(input: {
  organizationId: string;
  userId: string;
  feature: AiGatewayFeature;
  moduleId?: string;
  riskLevel?: AiRiskLevel;
  environment?: string;
}) {
  return createGatewayOptions(input);
}

export function getUsageValue(usage: unknown, keys: readonly string[]) {
  if (!usage || typeof usage !== "object") {
    return 0;
  }

  const record = usage as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
}

export function getUsageMetrics(usage: unknown) {
  const promptTokens = getUsageValue(usage, ["promptTokens", "inputTokens"]);
  const completionTokens = getUsageValue(usage, [
    "completionTokens",
    "outputTokens",
  ]);
  const totalTokens =
    getUsageValue(usage, ["totalTokens"]) || promptTokens + completionTokens;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

export type GatewaySpendReportEntry = {
  tag: string;
  costUsd: number;
  requestCount: number;
};

export type GatewaySpendReport = {
  available: boolean;
  /** Set when the Gateway rejects the configured API key (refresh from AI Gateway console). */
  authenticationFailed?: boolean;
  entries: readonly GatewaySpendReportEntry[];
};

function formatGatewayReportDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthToDateRange(reference = new Date()) {
  const end = new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
    ),
  );
  const start = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1),
  );
  return {
    startDate: formatGatewayReportDate(start),
    endDate: formatGatewayReportDate(end),
  };
}

function organizationGatewayTag(organizationId: string) {
  return `organization:${toGatewayTagValue(organizationId, "unknown")}`;
}

/**
 * Month-to-date AI Gateway spend grouped by routing tags.
 * Returns unavailable when gateway credentials are not configured or the report API fails.
 */
export async function getGatewaySpendReport(input: {
  organizationId: string;
}): Promise<GatewaySpendReport> {
  if (!hasAiGatewayCredentials()) {
    return { available: false, entries: [] };
  }

  const apiKey = resolveAiGatewayReportApiKey();
  if (!apiKey) {
    return { available: false, entries: [] };
  }

  const { startDate, endDate } = monthToDateRange();
  const organizationTag = organizationGatewayTag(input.organizationId);
  const gatewayClient = createGateway({ apiKey });

  try {
    const report = await gatewayClient.getSpendReport({
      startDate,
      endDate,
      groupBy: "tag",
      tags: [organizationTag],
    });

    const entries = (report.results ?? [])
      .map((row) => {
        const tag = row.tag ?? row.model;
        if (!tag) {
          return null;
        }

        const costUsd =
          typeof row.totalCost === "number" && Number.isFinite(row.totalCost)
            ? row.totalCost
            : 0;
        const requestCount =
          typeof row.requestCount === "number" &&
          Number.isFinite(row.requestCount)
            ? row.requestCount
            : 0;

        return { tag, costUsd, requestCount };
      })
      .filter((entry): entry is GatewaySpendReportEntry => entry !== null)
      .filter((entry) => entry.requestCount > 0 || entry.costUsd > 0)
      .sort((left, right) => right.costUsd - left.costUsd);

    return {
      available: true,
      entries,
    };
  } catch (error) {
    if (APICallError.isInstance(error) && error.statusCode === 401) {
      return {
        available: false,
        authenticationFailed: true,
        entries: [],
      };
    }

    return { available: false, entries: [] };
  }
}
