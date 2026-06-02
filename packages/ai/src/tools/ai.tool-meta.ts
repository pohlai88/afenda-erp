import type { GovernedToolMeta } from "../contracts/ai.tools.contract";

/**
 * Governed tool metadata registry.
 * Each tool in ai.erp-tools.tool.server.ts must have an entry here.
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

export const allToolMeta: Record<string, GovernedToolMeta> = {
  ...erpAssistantToolMeta,
};

/** Expected tool ids for ERP assistant — stability test anchor. */
export const ERP_ASSISTANT_TOOL_IDS = [
  "summarizeWorkspace",
  "searchRecords",
  "lookupDocument",
  "draftTask",
  "proposeApprovalDecision",
] as const;

export type ErpAssistantToolId = (typeof ERP_ASSISTANT_TOOL_IDS)[number];
