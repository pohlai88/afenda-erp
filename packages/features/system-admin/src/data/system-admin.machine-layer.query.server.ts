import {
  listAiFeatureEntitlements,
  listAiActionSandboxes,
  listAiApprovalProposals,
  listAiUsageEvents,
  type AiFeature,
  type AiFeatureEntitlementSummary,
  type AiActionSandboxSummary,
  type AiApprovalProposalSummary,
  type AiUsageSummary,
} from "@afenda/db";
import { formatErpDateTime } from "@afenda/kernel";

export type AiApprovalRouteSummary = {
  id: string;
  moduleId: string;
  proposedAction: string;
  rationale: string;
  riskLevel: string;
  status: string;
  created: string;
};

export type AiSandboxRouteSummary = {
  id: string;
  title: string;
  moduleId: string;
  actionType: string;
  riskLevel: string;
  status: string;
  proposedBy: string;
  created: string;
};

export type AiUsageRouteSummary = {
  id: string;
  feature: string;
  model: string;
  status: string;
  totalTokens: string;
  latency: string;
};

export type AiFeatureEntitlementRouteSummary = {
  id: string;
  feature: AiFeature;
  enabled: string;
  updated: string;
  updatedByAuthUserId: string;
};

function serializeUsage(event: AiUsageSummary): AiUsageRouteSummary {
  return {
    id: event.id,
    feature: event.feature,
    model: event.model,
    status: event.status,
    totalTokens: String(event.totalTokens),
    latency: `${event.latencyMs}ms`,
  };
}

function serializeApproval(
  row: AiApprovalProposalSummary,
): AiApprovalRouteSummary {
  return {
    id: row.id,
    moduleId: row.moduleId,
    proposedAction: row.proposedAction,
    rationale: row.rationale,
    riskLevel: row.riskLevel,
    status: row.status,
    created: formatErpDateTime(row.createdAt, { fallback: "" }),
  };
}

function serializeSandbox(row: AiActionSandboxSummary): AiSandboxRouteSummary {
  return {
    id: row.id,
    title: row.title,
    moduleId: row.moduleId,
    actionType: row.actionType,
    riskLevel: row.riskLevel,
    status: row.status,
    proposedBy: row.proposedBy,
    created: formatErpDateTime(row.createdAt, { fallback: "" }),
  };
}

function serializeEntitlement(
  row: AiFeatureEntitlementSummary,
): AiFeatureEntitlementRouteSummary {
  return {
    id: row.feature,
    feature: row.feature,
    enabled: row.enabled ? "enabled" : "disabled",
    updated: formatErpDateTime(row.updatedAt, { fallback: "" }),
    updatedByAuthUserId: row.updatedByAuthUserId ?? "system-default",
  };
}

export async function getAiUsageRouteSummary(input: {
  organizationId: string;
  limit?: number;
}): Promise<AiUsageRouteSummary[]> {
  const events = await listAiUsageEvents({
    organizationId: input.organizationId,
    limit: input.limit,
  });
  return events.map(serializeUsage);
}

export async function getAiApprovalsSummary(input: {
  organizationId: string;
  limit?: number;
}): Promise<AiApprovalRouteSummary[]> {
  const rows = await listAiApprovalProposals({
    organizationId: input.organizationId,
    limit: input.limit,
  });
  return rows.map(serializeApproval);
}

export async function getAiSandboxesSummary(input: {
  organizationId: string;
  limit?: number;
}): Promise<AiSandboxRouteSummary[]> {
  const rows = await listAiActionSandboxes({
    organizationId: input.organizationId,
    limit: input.limit,
  });
  return rows.map(serializeSandbox);
}

export async function getAiFeatureEntitlementsSummary(input: {
  organizationId: string;
}): Promise<AiFeatureEntitlementRouteSummary[]> {
  const rows = await listAiFeatureEntitlements({
    organizationId: input.organizationId,
  });
  return rows.map(serializeEntitlement);
}
