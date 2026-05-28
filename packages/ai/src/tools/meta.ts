import type { GovernedToolMeta } from "./contracts";

/**
 * Governed tool metadata registry.
 * Each tool in erp-tools.ts and solution-provider-tools.ts must have an entry here.
 *
 * Rules:
 * - `access: "write"` tools must route through sandbox/approval flow.
 * - `audit: "record"` tools emit a structured audit log entry per call.
 * - Entries are keyed by the exact tool name returned from the tool factory.
 * - Tests assert that all registered tools have a meta entry and that ids are stable.
 */
export const erpAssistantToolMeta: Record<string, GovernedToolMeta> = {
  summarizeWorkspace: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "low",
    audit: "silent",
  },
  searchRecords: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "low",
    audit: "silent",
  },
  lookupDocument: {
    risk: "low",
    category: "documents",
    access: "read",
    dataSensitivity: "low",
    audit: "silent",
  },
  draftTask: {
    risk: "low",
    category: "operations",
    access: "read",
    dataSensitivity: "none",
    audit: "silent",
  },
  proposeApprovalDecision: {
    risk: "high",
    category: "approvals",
    access: "write",
    dataSensitivity: "medium",
    audit: "record",
  },
};

export const solutionProviderToolMeta: Record<string, GovernedToolMeta> = {
  analyzeProfitAndLoss: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "medium",
    audit: "silent",
  },
  findRevenueLeakage: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "medium",
    audit: "silent",
  },
  findCostDrivers: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "medium",
    audit: "silent",
  },
  reviewCashConversion: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "medium",
    audit: "silent",
  },
  assessInventoryRisk: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "medium",
    audit: "silent",
  },
  reviewApprovalThroughput: {
    risk: "low",
    category: "approvals",
    access: "read",
    dataSensitivity: "low",
    audit: "silent",
  },
  reviewAuditReadiness: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "low",
    audit: "silent",
  },
  draftRecoveryTasks: {
    risk: "medium",
    category: "operations",
    access: "read",
    dataSensitivity: "medium",
    audit: "record",
  },
  proposeHumanApprovedAction: {
    risk: "high",
    category: "operations",
    access: "write",
    dataSensitivity: "medium",
    audit: "record",
  },
};

export const allToolMeta: Record<string, GovernedToolMeta> = {
  ...erpAssistantToolMeta,
  ...solutionProviderToolMeta,
};

/** Expected tool ids for ERP assistant — stability test anchor. */
export const ERP_ASSISTANT_TOOL_IDS = [
  "summarizeWorkspace",
  "searchRecords",
  "lookupDocument",
  "draftTask",
  "proposeApprovalDecision",
] as const;

/** Expected tool ids for solution provider — stability test anchor. */
export const SOLUTION_PROVIDER_TOOL_IDS = [
  "analyzeProfitAndLoss",
  "findRevenueLeakage",
  "findCostDrivers",
  "reviewCashConversion",
  "assessInventoryRisk",
  "reviewApprovalThroughput",
  "reviewAuditReadiness",
  "draftRecoveryTasks",
  "proposeHumanApprovedAction",
] as const;

export type ErpAssistantToolId = (typeof ERP_ASSISTANT_TOOL_IDS)[number];
export type SolutionProviderToolId =
  (typeof SOLUTION_PROVIDER_TOOL_IDS)[number];
