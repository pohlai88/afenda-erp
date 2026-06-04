import type {
  AiFeature,
  AiRequestStatus,
  ErpModuleId,
} from "./lyn-run-ledger.repository.server";
import {
  completeLynxRun,
  createAiUsageEvent,
  createLynxRun,
  recordLynxRunEvent,
} from "./lyn-run-lifecycle.repository.server";

type JsonRecord = Record<string, unknown>;

export async function executeLynxCreateAiUsageEventCommand(input: {
  organizationId: string;
  userAuthId: string;
  moduleId: ErpModuleId;
  feature: AiFeature;
  model: string;
  status: AiRequestStatus;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  metadata?: JsonRecord;
}) {
  return createAiUsageEvent(input);
}

export async function executeLynxCreateRunCommand(input: {
  organizationId: string;
  userAuthId: string;
  route: string;
  model: string;
  promptSummary: string;
  workflowId?: string;
  workflowSessionId?: string;
  metadata?: JsonRecord;
}) {
  return createLynxRun(input);
}

export async function executeLynxRecordRunEventCommand(input: {
  organizationId: string;
  runId: string;
  eventType: string;
  summary: string;
  toolName?: string;
  evidenceReferences?: JsonRecord[];
  validationMetrics?: JsonRecord;
  approvalProposalId?: string;
  sandboxId?: string;
  metadata?: JsonRecord;
}) {
  return recordLynxRunEvent(input);
}

export async function executeLynxCompleteRunCommand(input: {
  id: string;
  organizationId: string;
  status: AiRequestStatus;
  latencyMs: number;
  metadata?: JsonRecord;
}) {
  return completeLynxRun(input);
}
