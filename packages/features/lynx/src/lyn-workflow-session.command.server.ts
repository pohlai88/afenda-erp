import {
  createLynxWorkflowSession,
  updateLynxWorkflowSession,
} from "./lynx.workflow-session.repository.server";
import type { LynxQualityGateResult } from "./lyn-evidence-trust-schema";
import type { LynxWorkflowSessionStatus } from "./lynx.run-ledger.repository.server";

type JsonRecord = Record<string, unknown>;

export async function executeLynxCreateWorkflowSessionCommand(input: {
  organizationId: string;
  userAuthId: string;
  workflowId: string;
  currentStage: string;
  promptSummary: string;
  nextRecommendedStep: string;
  metadata?: JsonRecord;
}) {
  return createLynxWorkflowSession(input);
}

export async function executeLynxUpdateWorkflowSessionCommand(input: {
  organizationId: string;
  id: string;
  status: LynxWorkflowSessionStatus;
  currentStage: string;
  latestRunId?: string;
  promptSummary?: string;
  evidenceSummary?: JsonRecord;
  qualityGateSummary?: LynxQualityGateResult;
  nextRecommendedStep?: string;
  metadata?: JsonRecord;
}) {
  return updateLynxWorkflowSession(input);
}
