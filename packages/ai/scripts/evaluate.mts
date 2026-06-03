import { strict as assert } from "node:assert";
import {
  approveActionSandbox,
  createActionSandbox,
  rejectActionSandbox,
} from "../src/ai-sandbox.action.server";
import { assembleAiContext } from "../src/ai-context.repository.server";
import {
  createGatewayOptions,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  hasAiGatewayRuntimeCredentials,
  verifyAiGatewayModels,
} from "../src/ai-gateway.repository.server";
import { getAssistantSystemPrompt } from "../src/ai-system.prompt";
import { scoreAiConfidence } from "../src/ai-confidence.policy";
import {
  AiBudgetError,
  AiSensitiveContentError,
  assertAiBudget,
  assertNoSensitiveCredentialContent,
  estimateTokenCount,
} from "../src/ai-guardrails.policy";
import { redactGovernedToolAuditValue } from "../src/ai-governance.tool.server";
import { createErpAssistantTools } from "../src/ai-erp-tools.tool.server";
import { actionSandboxSchema } from "../src/ai-operations.schema";
import { documentExtractionSchema } from "../src/ai-extraction.schema";
import {
  approvalRecommendationSchema,
  reportNarrativeSchema,
  workspaceSummarySchema,
} from "../src/ai-recommendations.schema";
import {
  approvalToolInputSchema,
  approvalToolOutputSchema,
  documentLookupToolInputSchema,
} from "../src/ai-tools.schema";

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
  "anthropic/claude-opus-4.7",
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
assert.equal(
  hasAiGatewayRuntimeCredentials({ AI_GATEWAY_API_KEY: "gateway-key" }),
  true,
);
assert.equal(
  hasAiGatewayRuntimeCredentials({ VERCEL_OIDC_TOKEN: "oidc-token" }),
  true,
);
assert.equal(
  hasAiGatewayRuntimeCredentials({ VERCEL_API_TOKEN: "management-token" }),
  false,
);

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
const governedGatewayOptions = createGatewayOptions({
  organizationId: "Org 123!",
  userId: "user_123",
  feature: "solution-provider",
  providerOrder: ["anthropic", "openai"],
  providerOnly: ["anthropic"],
  fallbackModels: ["google/gemini-3.1-pro-preview"],
  automaticCaching: true,
  zeroDataRetention: true,
});
assert.deepEqual(governedGatewayOptions.gateway.order, [
  "anthropic",
  "openai",
]);
assert.deepEqual(governedGatewayOptions.gateway.only, ["anthropic"]);
assert.deepEqual(governedGatewayOptions.gateway.models, [
  "google/gemini-3.1-pro-preview",
]);
assert.equal(governedGatewayOptions.gateway.caching, "auto");
assert.equal(governedGatewayOptions.gateway.zeroDataRetention, true);

const modelVerification = await verifyAiGatewayModels({
  fallbackModels: ["google/gemini-3.1-pro-preview"],
  fetch: async () =>
    new Response(
      JSON.stringify({
        data: [
          { id: "openai/gpt-5.5" },
          { id: "anthropic/claude-opus-4.7" },
          { id: "google/gemini-3.1-pro-preview" },
        ],
      }),
    ),
});
assert.equal(modelVerification.available, true);

const injectionGuardPrompt = getAssistantSystemPrompt({
  organizationName: "Afenda",
  role: "owner",
});
assert.ok(injectionGuardPrompt.includes("untrusted data"));
assert.ok(injectionGuardPrompt.includes("override this system policy"));

const circularAuditPayload: Record<string, unknown> = { value: "ok" };
circularAuditPayload.self = circularAuditPayload;
const redactedAuditPayload = redactGovernedToolAuditValue(
  {
    apiKey: "secret",
    circularAuditPayload,
    longText: "x".repeat(10),
  },
  { maxStringLength: 4 },
) as Record<string, unknown>;
assert.equal(redactedAuditPayload.apiKey, "[redacted]");
assert.equal(redactedAuditPayload.longText, "xxxx...[truncated]");
assert.deepEqual(
  redactedAuditPayload.circularAuditPayload,
  { value: "ok", self: "[circular]" },
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

process.stdout.write("AI schema and guardrail evals passed.\n");
