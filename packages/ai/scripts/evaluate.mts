import { strict as assert } from "node:assert";
import {
  AiBudgetError,
  actionSandboxSchema,
  approvalRecommendationSchema,
  approvalToolOutputSchema,
  approvalToolInputSchema,
  approveActionSandbox,
  assembleAiContext,
  assertAiBudget,
  assertNoSensitiveCredentialContent,
  createActionSandbox,
  createGatewayOptions,
  createErpAssistantTools,
  createSolutionProviderTools,
  documentLookupToolInputSchema,
  documentExtractionSchema,
  estimateTokenCount,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  reportNarrativeSchema,
  scoreAiConfidence,
  solutionProviderRunSchema,
  businessProblemInputSchema,
  recoveryPlaybookSchema,
  workspaceSummarySchema,
  AiSensitiveContentError,
  getOperationalSkillById,
  getOperationalSkillsForModule,
  getStagedOperationalSkillById,
  rejectActionSandbox,
} from "../src/index";

type ExecutableTool<TInput, TOutput> = {
  execute: (input: TInput) => Promise<TOutput>;
  needsApproval?: boolean;
};

const validExtraction = documentExtractionSchema.parse({
  documentType: "invoice",
  counterpartyName: "Acme Supplies",
  reference: "INV-1001",
  issueDate: "2026-05-01",
  dueDate: "2026-05-31",
  currency: "MYR",
  totalAmountCents: 125000,
  lineItems: [
    {
      description: "Office supplies",
      quantity: 1,
      amountCents: 125000,
    },
  ],
  confidence: 91,
  reviewNotes: "Totals and reference are present.",
  recommendedAction: "match-existing-record",
});

assert.equal(validExtraction.reference, "INV-1001");
assert.equal(
  documentExtractionSchema.safeParse({
    ...validExtraction,
    confidence: 140,
  }).success,
  false,
);
assert.equal(
  approvalToolInputSchema.safeParse({
    moduleId: "approvals",
    proposedAction: "approve",
    rationale: "Invoice matches purchase order and receipt.",
    riskLevel: "low",
    requiredHumanChecks: [],
  }).success,
  false,
);
assert.equal(
  documentLookupToolInputSchema.safeParse({
    moduleId: "finance",
  }).success,
  false,
);
assert.equal(estimateTokenCount("12345678"), 2);
assert.equal(
  getAiModelForFeature("approval-tools", "high", {}),
  "openai/gpt-5.4",
);
assert.equal(
  getAiModelForFeature("record-search", "low", {
    AFENDA_AI_FAST_MODEL: "openai/gpt-5-mini",
  }),
  "openai/gpt-5-mini",
);
assert.equal(
  getAiModelForFeature("document-extraction", "high", {
    AFENDA_AI_HIGH_CONFIDENCE_MODEL: "openai/gpt-5.4-pro",
  }),
  "openai/gpt-5.4-pro",
);
assert.equal(getAiGatewayEnvironment({ VERCEL_ENV: "Preview" }), "preview");

const gatewayOptions = createGatewayOptions({
  organizationId: "Org 123!",
  userId: "user_123",
  feature: "erp-assistant",
  moduleId: "Finance Ops",
  riskLevel: "medium",
  environment: "test",
});

assert.deepEqual(gatewayOptions.gateway.user, "user_123");
assert.ok(
  Array.isArray(gatewayOptions.gateway.tags) &&
    gatewayOptions.gateway.tags.includes("organization:org-123") &&
    gatewayOptions.gateway.tags.includes("module:finance-ops") &&
    gatewayOptions.gateway.tags.includes("risk:medium"),
);

assert.throws(
  () =>
    assertAiBudget({
      estimatedTokens: 12_001,
      feature: "document-extraction",
    }),
  AiBudgetError,
);
assert.throws(
  () => assertNoSensitiveCredentialContent("api_key=abc123"),
  AiSensitiveContentError,
);

const validApprovalOutput = approvalToolOutputSchema.parse({
  proposalId: "proposal_123",
  status: "approved",
  approvalState: "human-approved",
  proposedAction: "approve",
  riskLevel: "low",
  rationale:
    "Invoice has matching receipt, purchase order, and owner sign-off.",
  metadata: {
    source: "ai-tool",
    moduleId: "approvals",
    workItemId: "work_123",
  },
});

assert.equal(validApprovalOutput.approvalState, "human-approved");
assert.equal(
  approvalToolOutputSchema.safeParse({
    ...validApprovalOutput,
    approvalState: "auto-approved",
  }).success,
  false,
);

assert.equal(
  workspaceSummarySchema.safeParse({
    moduleId: "finance",
    summary:
      "Aging receivables increased and three approval holds remain open.",
    signals: [
      {
        label: "Receivables aging",
        severity: "warning",
        detail:
          "Receivables aging increased while collection tasks remain open.",
      },
    ],
    nextActions: ["Review finance approval queue"],
    confidence: 82,
  }).success,
  true,
);
assert.equal(
  approvalRecommendationSchema.safeParse({
    moduleId: "approvals",
    proposedAction: "escalate",
    rationale: "Risk exceeds normal policy thresholds.",
    riskLevel: "high",
    requiredHumanChecks: ["Confirm owner approval"],
  }).success,
  true,
);
assert.equal(
  reportNarrativeSchema.safeParse({
    moduleId: "reports",
    title: "Revenue movement",
    executiveSummary:
      "Sales pipeline increased while fulfillment cycle time held steady.",
    highlights: ["Pipeline increased"],
    risks: ["Inventory variance remains open"],
    nextActions: ["Review exception report"],
  }).success,
  true,
);
assert.equal(
  businessProblemInputSchema.safeParse({
    problemType: "negative_pnl",
    userGoal: "Recover negative P&L with evidence-backed actions.",
  }).success,
  true,
);
assert.equal(
  recoveryPlaybookSchema.safeParse({
    workflowId: "negative_pnl_recovery",
    title: "Negative P&L recovery",
    summary: "Recover profitability through accountable cross-module actions.",
    orderedActions: [
      {
        id: "action-1",
        title: "Review overdue receivables",
        moduleId: "finance",
        ownerTeam: "Finance Systems",
        priority: "high",
        expectedImpact:
          "Improves cash recovery and exposes collection blockers.",
        riskLevel: "high",
        humanApproval: {
          required: true,
          state: "approval-required",
          reason: "Customer-facing financial workflow requires review.",
        },
        sourceRecords: [
          {
            moduleId: "finance",
            recordId: "FIN-001",
            label: "AR aging",
            signal: "Overdue balance remains open.",
          },
        ],
      },
    ],
    kpisToWatch: ["Gross margin"],
    assumptions: ["Tenant data is available to the current role."],
  }).success,
  true,
);
assert.equal(
  solutionProviderRunSchema.safeParse({
    problem: {
      problemType: "negative_pnl",
      workflowId: "negative_pnl_recovery",
      userGoal: "Recover negative P&L with evidence-backed actions.",
    },
    diagnosis: [
      {
        id: "cause-1",
        title: "Revenue leakage",
        moduleId: "sales",
        severity: "high",
        confidence: "medium",
        evidence: [
          {
            moduleId: "sales",
            recordId: "SAL-001",
            label: "Blocked order",
            signal: "Order is blocked by stock allocation.",
          },
        ],
        explanation: "Blocked orders may be reducing recognized revenue.",
        missingData: [],
      },
    ],
    recoveryPlan: {
      workflowId: "negative_pnl_recovery",
      title: "Negative P&L recovery",
      summary: "Prioritize revenue recovery and cost-control actions.",
      orderedActions: [
        {
          id: "action-1",
          title: "Clear blocked order",
          moduleId: "sales",
          ownerTeam: "Commercial Operations",
          priority: "high",
          expectedImpact: "Restores invoice handoff.",
          riskLevel: "medium",
          humanApproval: {
            required: true,
            state: "approval-required",
            reason: "Customer-facing change requires human review.",
          },
          sourceRecords: [
            {
              moduleId: "sales",
              recordId: "SAL-001",
              label: "Blocked order",
              signal: "Order is blocked by stock allocation.",
            },
          ],
        },
      ],
      kpisToWatch: ["Revenue leakage"],
      assumptions: [],
    },
    anomalies: [],
    confidence: "medium",
    riskLevel: "high",
    sourceRecords: [
      {
        moduleId: "sales",
        recordId: "SAL-001",
        label: "Blocked order",
        signal: "Order is blocked by stock allocation.",
      },
    ],
    requiresApproval: true,
  }).success,
  true,
);

const assembledContext = assembleAiContext({
  organizationId: "org_123",
  maxTokens: 120,
  modules: [
    {
      moduleId: "finance",
      moduleLabel: "Finance",
      ownerTeam: "Finance Systems",
      dataMode: "metadata",
      stats: { recordCount: 1, workItemCount: 2 },
      records: [
        {
          id: "record_fin_1001",
          reference: "FIN-1001",
          title: "Margin review",
          recordType: "financial-review",
          status: "blocked",
          owner: "Finance",
          metadataSummary: "Gross margin below target",
        },
      ],
      workItems: [
        {
          id: "work_123",
          subject: "Review margin recovery",
          priority: "high",
          status: "open",
        },
      ],
      documents: [{ id: "doc_123", title: "P&L extract" }],
    },
  ],
});

assert.equal(assembledContext.organizationId, "org_123");
assert.ok(assembledContext.contextText.includes("Finance"));
assert.ok(assembledContext.grounding.directSourceCount > 0);
assert.ok(
  assembledContext.evidence.some((item) => item.sourceType === "work-item"),
);

const confidence = scoreAiConfidence({
  evidenceCount: assembledContext.grounding.evidenceCount,
  directSourceCount: assembledContext.grounding.directSourceCount,
  missingDataCount: assembledContext.grounding.missingData.length,
  userGoal: "Recover negative P&L with a human-approved action plan.",
  taskRiskLevel: "high",
});

assert.ok(confidence.overall >= 50);
assert.equal(confidence.requiresHumanReview, true);

const pendingSandbox = createActionSandbox({
  organizationId: "org_123",
  moduleId: "finance",
  actionType: "recovery-task-draft",
  title: "Review margin leakage",
  riskLevel: "high",
  summary: "Draft a recovery task for margin leakage.",
  affectedRecords: ["record_fin_1001"],
  creates: 1,
  sourceEvidence: assembledContext.evidence,
  requiredHumanChecks: ["Confirm owner and affected records."],
});
const approvedSandbox = approveActionSandbox({ sandbox: pendingSandbox });
const rejectedSandbox = rejectActionSandbox({
  sandbox: pendingSandbox,
  reason: "Needs a clearer owner.",
});

assert.equal(actionSandboxSchema.parse(pendingSandbox).status, "pending");
assert.equal(approvedSandbox.status, "approved");
assert.equal(rejectedSandbox.status, "rejected");
assert.throws(() => approveActionSandbox({ sandbox: approvedSandbox }));
assert.equal(
  getStagedOperationalSkillById("lms-training-designer")?.moduleId,
  "lms",
);
assert.equal(getOperationalSkillsForModule("finance").length > 0, true);
assert.equal(
  getOperationalSkillById("audit-readiness")?.readToolNames[0],
  "reviewAuditReadiness",
);
assert.equal(
  getOperationalSkillById("revenue-leakage-recovery")?.moduleId,
  "sales",
);
assert.equal(
  getOperationalSkillById("cost-driver-control")?.moduleId,
  "purchasing",
);

let approvalRecordedBy = "";
const toolset = createErpAssistantTools({
  organization: {
    id: "org_123",
    capabilities: ["finance.view", "finance.approve"],
  },
  session: { id: "user_123" },
  model: "openai/gpt-5.4",
  getModuleDefinition: () => ({
    label: "Finance",
    ownerTeam: "Finance",
    requiredCapability: "finance.approve",
  }),
  getAllowedWorkspace: async () => ({
    moduleDefinition: {
      label: "Finance",
      ownerTeam: "Finance",
      requiredCapability: "finance.view",
    },
    workspace: {
      dataMode: "metadata",
      workItems: [{ id: "work_123", subject: "Review invoice" }],
      records: [
        {
          id: "record_inv_1001",
          reference: "INV-1001",
          title: "Acme invoice",
          recordType: "invoice",
          status: "pending",
          owner: "Finance",
          metadataSummary: "Invoice awaiting approval",
        },
      ],
      documents: [{ id: "doc_123", title: "Acme invoice PDF" }],
    },
  }),
  getWorkspaceStats: () => ({ recordCount: 1 }),
  registerApprovalProposal: async (proposal) => {
    approvalRecordedBy = proposal.requestedByAuthUserId;
    return "proposal_123";
  },
});

const searchRecords = toolset.searchRecords as ExecutableTool<
  { moduleId: "finance"; query: string; limit: number },
  { organizationId: string; count: number }
>;
const recordSearchResult = await searchRecords.execute({
  moduleId: "finance",
  query: "acme",
  limit: 5,
});

assert.equal(recordSearchResult.organizationId, "org_123");
assert.equal(recordSearchResult.count, 1);

const approvalTool = toolset.proposeApprovalDecision as ExecutableTool<
  {
    moduleId: "finance";
    workItemId: string;
    proposedAction: "approve";
    rationale: string;
    riskLevel: "low";
    requiredHumanChecks: string[];
  },
  { proposalId: string; approvalState: "human-approved" }
>;

assert.equal(approvalTool.needsApproval, true);
const approvalResult = await approvalTool.execute({
  moduleId: "finance",
  workItemId: "work_123",
  proposedAction: "approve",
  rationale: "Invoice matches the purchase order and receipt.",
  riskLevel: "low",
  requiredHumanChecks: ["Confirm delegated authority"],
});

assert.equal(approvalRecordedBy, "user_123");
assert.equal(approvalResult.approvalState, "human-approved");

let solutionProposalRecordedBy = "";
const solutionToolset = createSolutionProviderTools({
  organization: {
    id: "org_123",
    capabilities: ["finance.view", "dashboard.view"],
  },
  session: { id: "user_123" },
  model: "openai/gpt-5.4",
  getModuleDefinition: () => ({
    label: "Finance",
    ownerTeam: "Finance Systems",
    requiredCapability: "finance.view",
  }),
  getAllowedWorkspace: async () => ({
    moduleDefinition: {
      label: "Finance",
      ownerTeam: "Finance Systems",
      requiredCapability: "finance.view",
    },
    workspace: {
      dataMode: "metadata",
      workItems: [{ id: "work_123", subject: "Review margin" }],
      records: [
        {
          id: "record_fin_1001",
          reference: "FIN-1001",
          title: "Margin review",
          recordType: "financial-review",
          status: "blocked",
          owner: "Finance",
          metadataSummary: "Gross margin below target",
        },
      ],
      documents: [{ id: "doc_123", title: "P&L extract" }],
    },
  }),
  getWorkspaceStats: () => ({
    recordCount: 1,
    workItemCount: 1,
    highPriorityWorkItemCount: 1,
    documentCount: 1,
    savedViewCount: 1,
  }),
  registerSolutionActionProposal: async (proposal) => {
    solutionProposalRecordedBy = proposal.requestedByAuthUserId;
    return "solution_proposal_123";
  },
});

const analyzeProfitAndLoss =
  solutionToolset.analyzeProfitAndLoss as ExecutableTool<
    {
      problemType: "negative_pnl";
      workflowId?: "negative_pnl_recovery";
      userGoal: string;
    },
    { id: string; evidence: unknown[] }[]
  >;
const diagnosis = await analyzeProfitAndLoss.execute({
  problemType: "negative_pnl",
  userGoal: "Recover negative P&L with evidence-backed actions.",
});

assert.equal(diagnosis[0]?.id, "negative_pnl-1");
assert.ok(diagnosis[0]?.evidence.length);
assert.ok(
  (
    diagnosis[0] as {
      confidenceBreakdown?: { overall: number };
    }
  ).confidenceBreakdown?.overall,
);

const draftRecoveryTasks = solutionToolset.draftRecoveryTasks as ExecutableTool<
  {
    problemType: "negative_pnl";
    workflowId?: "negative_pnl_recovery";
    userGoal: string;
  },
  { orderedActions: Array<{ actionSandbox?: { status: string } }> }
>;
const recoveryDraft = await draftRecoveryTasks.execute({
  problemType: "negative_pnl",
  userGoal: "Recover negative P&L with evidence-backed actions.",
});

assert.equal(recoveryDraft.orderedActions[0]?.actionSandbox?.status, "pending");

const proposeHumanApprovedAction =
  solutionToolset.proposeHumanApprovedAction as ExecutableTool<
    {
      moduleId: "finance";
      title: string;
      rationale: string;
      riskLevel: "high";
      expectedImpact: string;
      sourceRecordIds: string[];
      requiredHumanChecks: string[];
    },
    { proposalId: string; approvalState: "human-approved" }
  >;

assert.equal(proposeHumanApprovedAction.needsApproval, true);
const solutionProposalResult = await proposeHumanApprovedAction.execute({
  moduleId: "finance",
  title: "Review margin leakage",
  rationale:
    "Gross margin is below target and needs a human-approved recovery owner.",
  riskLevel: "high",
  expectedImpact: "Clarifies recovery owner and next review action.",
  sourceRecordIds: ["record_fin_1001"],
  requiredHumanChecks: ["Confirm margin driver and recovery owner"],
});

assert.equal(solutionProposalRecordedBy, "user_123");
assert.equal(solutionProposalResult.approvalState, "human-approved");
assert.equal(
  (
    solutionProposalResult as {
      metadata?: { sandbox?: { status: string } };
    }
  ).metadata?.sandbox?.status,
  "approved",
);

process.stdout.write("AI schema and guardrail evals passed.\n");
