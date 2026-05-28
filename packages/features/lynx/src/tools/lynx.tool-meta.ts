import type { GovernedToolMeta } from "@afenda/ai/client";
import { LYNX_ERP_READ_TOOL_IDS } from "../schemas/lynx.erp-read-tools.schema";

export const LYNX_KNOWLEDGE_TOOL_IDS = [
  "searchKnowledge",
  "recentKnowledgeChunks",
] as const;

export const LYNX_READINESS_TOOL_IDS = ["inspectLynxReadiness"] as const;

export const LYNX_TOOL_IDS = [
  ...LYNX_KNOWLEDGE_TOOL_IDS,
  ...LYNX_READINESS_TOOL_IDS,
  ...LYNX_ERP_READ_TOOL_IDS,
] as const;

type LynxKnowledgeToolId = (typeof LYNX_KNOWLEDGE_TOOL_IDS)[number];
type LynxReadinessToolId = (typeof LYNX_READINESS_TOOL_IDS)[number];
type LynxErpReadToolId = (typeof LYNX_ERP_READ_TOOL_IDS)[number];
type LynxToolId = (typeof LYNX_TOOL_IDS)[number];

export const lynxKnowledgeToolMeta = {
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
} satisfies Record<LynxKnowledgeToolId, GovernedToolMeta>;

export const lynxReadinessToolMeta = {
  inspectLynxReadiness: {
    risk: "low",
    category: "operations",
    access: "read",
    dataSensitivity: "low",
    audit: "record",
  },
} satisfies Record<LynxReadinessToolId, GovernedToolMeta>;

export const lynxErpReadToolMeta = {
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
} satisfies Record<LynxErpReadToolId, GovernedToolMeta>;

export const lynxToolMeta: Record<LynxToolId, GovernedToolMeta> = {
  ...lynxKnowledgeToolMeta,
  ...lynxReadinessToolMeta,
  ...lynxErpReadToolMeta,
};
