import { strict as assert } from "node:assert";
import { assembleAiContext, scoreAiConfidence } from "@afenda/ai/server";
import {
  businessProblemInputSchema,
  recoveryPlaybookSchema,
  solutionProviderRunSchema,
} from "../src/schemas/lynx.solution-provider.schema";
import { createSolutionProviderTools } from "../src/tools/lynx.solution-provider-tools.tool.server";
import {
  getOperationalSkillById,
  getOperationalSkillsForModule,
  getStagedOperationalSkillById,
} from "../src/catalogs/lynx.operational-skill.catalog.server";

type ExecutableTool<TInput, TOutput> = {
  execute: (input: TInput) => Promise<TOutput>;
  needsApproval?: boolean;
};

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

const confidence = scoreAiConfidence({
  evidenceCount: assembledContext.grounding.evidenceCount,
  directSourceCount: assembledContext.grounding.directSourceCount,
  missingDataCount: assembledContext.grounding.missingData.length,
  userGoal: "Recover negative P&L with a human-approved action plan.",
  taskRiskLevel: "high",
});

assert.ok(confidence.overall >= 50);
assert.equal(confidence.requiresHumanReview, true);

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

process.stdout.write("Lynx solution-provider evals passed.\n");
