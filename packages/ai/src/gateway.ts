import {
  getAiEnv,
  getBaseEnv,
  hasAiGatewayCredentials as configHasAiGatewayCredentials,
} from "@afenda/config/env";

export const defaultAiGatewayModel = "openai/gpt-5.4";
export const defaultFastAiGatewayModel = "openai/gpt-5.4";
export const defaultHighConfidenceAiGatewayModel = "openai/gpt-5.4";

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

export function createGatewayOptions(input: {
  organizationId: string;
  userId: string;
  feature: AiGatewayFeature;
  moduleId?: string;
  workflowId?: string;
  riskLevel?: AiRiskLevel;
  environment?: string;
  cacheMode?: AiCacheMode;
}): AiGatewayProviderOptions {
  const riskLevel = input.riskLevel ?? "medium";
  const environment = toGatewayTagValue(input.environment, "development");
  const moduleId = toGatewayTagValue(input.moduleId, "global");
  const workflowId = input.workflowId
    ? toGatewayTagValue(input.workflowId, "workflow")
    : null;
  const organizationId = toGatewayTagValue(input.organizationId, "unknown");
  const gateway: AiJsonObject = {
    user: input.userId,
    tags: [
      "app:afenda-erp",
      `feature:${input.feature}`,
      `organization:${organizationId}`,
      `module:${moduleId}`,
      `env:${environment}`,
      `risk:${riskLevel}`,
      ...(workflowId ? [`workflow:${workflowId}`] : []),
    ],
    disallowPromptTraining: true,
  };

  if (input.cacheMode === "deterministic") {
    gateway.cacheControl = "max-age=3600";
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
