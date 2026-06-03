/**
 * Data transfer types for assembling AI context from tenant ERP data.
 * These are pure input shapes — no business logic, no Zod, no imports from AI SDK.
 */

import type { OperationalModuleId } from "./ai-operations.schema";

// ---------------------------------------------------------------------------
// Context input DTOs
// ---------------------------------------------------------------------------

export type AiContextRecordInput = {
  id: string;
  reference: string;
  title: string;
  recordType: string;
  status: string;
  owner: string;
  metadataSummary: string;
};

export type AiContextWorkItemInput = {
  id: string;
  subject: string;
  priority?: string;
  status?: string;
};

export type AiContextDocumentInput = {
  id: string;
  title: string;
};

export type AiContextKpiInput = {
  id: string;
  label: string;
  value: string;
  signal: string;
};

export type AiContextModuleInput = {
  moduleId: OperationalModuleId;
  moduleLabel: string;
  ownerTeam: string;
  dataMode?: string;
  stats?: Record<string, number>;
  records?: readonly AiContextRecordInput[];
  workItems?: readonly AiContextWorkItemInput[];
  documents?: readonly AiContextDocumentInput[];
  kpis?: readonly AiContextKpiInput[];
};

export type AssembleAiContextInput = {
  organizationId: string;
  modules: readonly AiContextModuleInput[];
  maxTokens?: number;
};

// ---------------------------------------------------------------------------
// Gateway spend report
// ---------------------------------------------------------------------------

export type GatewaySpendReportEntry = {
  tag: string;
  costUsd: number;
  requestCount: number;
};

export type GatewaySpendReport = {
  available: boolean;
  /** Set when the Gateway rejects the configured API key — refresh from AI Gateway console. */
  authenticationFailed?: boolean;
  entries: readonly GatewaySpendReportEntry[];
};
