/**
 * Headless component output contracts for @afenda/ai.
 *
 * These types define the serializable shapes that AI-generated responses
 * produce for governed renderers and ERP surface components to consume.
 * No React, no JSX — these are pure data contracts.
 *
 * UI components (e.g. in @afenda/governed-surface or @afenda/feature-lynx)
 * must accept these shapes and own all rendering logic.
 */

import type { GatewaySpendReport } from "../data/ai.context.contract";
import type {
  AiContextAssembly,
  ConfidenceBreakdown,
  GroundedEvidence,
} from "../schemas/ai.operations.schema";
import type {
  RecoveryPlaybook,
  SolutionProviderRun,
} from "../schemas/ai.solution-provider.schema";
import type {
  WorkspaceSummary,
  ApprovalRecommendation,
  AnomalyExplanation,
  ReportNarrative,
} from "../schemas/ai.recommendations.schema";

// ---------------------------------------------------------------------------
// Spend report component contract
// ---------------------------------------------------------------------------

export type AiSpendReportComponentData = GatewaySpendReport & {
  organizationId: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Context panel component contract
// ---------------------------------------------------------------------------

export type AiContextPanelComponentData = {
  assembly: AiContextAssembly;
  confidence: ConfidenceBreakdown;
  evidence: readonly GroundedEvidence[];
};

// ---------------------------------------------------------------------------
// Workspace summary component contract
// ---------------------------------------------------------------------------

export type AiWorkspaceSummaryComponentData = WorkspaceSummary & {
  organizationId: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Approval recommendation component contract
// ---------------------------------------------------------------------------

export type AiApprovalRecommendationComponentData = ApprovalRecommendation & {
  workItemId: string;
  organizationId: string;
};

// ---------------------------------------------------------------------------
// Anomaly explanation component contract
// ---------------------------------------------------------------------------

export type AiAnomalyExplanationComponentData = AnomalyExplanation & {
  organizationId: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Report narrative component contract
// ---------------------------------------------------------------------------

export type AiReportNarrativeComponentData = ReportNarrative & {
  organizationId: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Solution provider run component contract
// ---------------------------------------------------------------------------

export type AiSolutionRunComponentData = {
  run: SolutionProviderRun;
  playbook: RecoveryPlaybook;
  organizationId: string;
  workflowId: string;
  generatedAt: string;
};
