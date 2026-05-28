import type { GovernedToolMeta } from "@afenda/ai";

export const lynxKnowledgeToolMeta: Record<string, GovernedToolMeta> = {
  searchKnowledge: {
    risk: "low",
    category: "knowledge",
    access: "read",
    dataSensitivity: "low",
    audit: "record",
  },
  recentKnowledgeChunks: {
    risk: "low",
    category: "knowledge",
    access: "read",
    dataSensitivity: "low",
    audit: "silent",
  },
  inspectLynxReadiness: {
    risk: "low",
    category: "operations",
    access: "read",
    dataSensitivity: "low",
    audit: "record",
  },
};

export const lynxErpReadToolMeta: Record<string, GovernedToolMeta> = {
  inspectFinanceSignals: {
    risk: "low",
    category: "records",
    access: "read",
    dataSensitivity: "medium",
    audit: "record",
  },
  inspectApprovalControls: {
    risk: "low",
    category: "approvals",
    access: "read",
    dataSensitivity: "medium",
    audit: "record",
  },
  inspectAuditReadiness: {
    risk: "low",
    category: "operations",
    access: "read",
    dataSensitivity: "low",
    audit: "record",
  },
};

export const lynxToolMeta: Record<string, GovernedToolMeta> = {
  ...lynxKnowledgeToolMeta,
  ...lynxErpReadToolMeta,
};
