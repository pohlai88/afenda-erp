import type { GovernedToolMeta } from "@afenda/ai/client";

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

export type SolutionProviderToolId =
  (typeof SOLUTION_PROVIDER_TOOL_IDS)[number];
