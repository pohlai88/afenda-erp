/**
 * FROZEN compat surface (ARCH-1002 §6.2). Bugfix-only — do not add module business logic,
 * list surfaces, or HITL here. New modules: @afenda/feature-* + @afenda/kernel/server.
 */
import type { AppCapability, OrganizationRole } from "@afenda/auth";
import {
  listAiUsageEvents,
  getTenantWorkItem,
  getTenantErpRecord,
  listAuditLogsForEntity,
  listTenantDocumentWindow,
  listTenantModuleDocumentActivityWindow,
  listTenantErpRecordWindow,
  listTenantSavedViews,
  listTenantWorkItemWindow,
  summarizeTenantModuleMetrics,
  summarizeTenantOrganizationMetrics,
  type AiUsageSummary,
  type TenantAuditLog,
  type TenantErpDocument,
  type TenantErpDocumentWindow,
  type TenantDocumentEvidenceWindow,
  type TenantDocumentEvidenceWindowRow,
  type TenantErpRecord,
  type TenantErpRecordWindow,
  type TenantErpSavedView,
  type TenantErpWorkItem,
  type TenantErpWorkItemDetail,
  type TenantErpWorkItemWindow,
} from "@afenda/db";
import type {
  AuditPanelModel,
  AuditPanelRow,
} from "@afenda/governed-surface/schemas";
import { resolveModuleMetrics } from "./shared/module-metrics";
import type { ModuleId } from "@afenda/config/module-ids";
import type { ModuleDataMode } from "./shared/workspace-data-mode";
import {
  toRecordWindowQuery,
  toDocumentWindowQuery,
  toDocumentActivityWindowQuery,
  toWorkItemWindowQuery,
  type ModuleWorkspaceListQuery,
} from "./shared/module-workspace-query";
import {
  formatErpDateTime,
  formatErpFileSize,
  formatErpMoneyFromMinorUnits,
} from "./shared/erp-formatting";
import { parseRecordTypeExtension } from "./modules/record-types";

export { resolveModuleMetrics } from "./shared/module-metrics";
export {
  formatErpDateTime,
  formatErpFileSize,
  formatErpMoneyFromMinorUnits,
  formatErpNumber,
} from "./shared/erp-formatting";

export {
  approvalToolModuleIds,
  coreModuleIds,
  documentExtractionModuleIds,
  isModuleId,
  moduleIds,
  type ModuleId,
} from "@afenda/config/module-ids";
export {
  buildDashboardAiUsageListSurface,
  buildDashboardAutomationListSurface,
  buildDashboardHardeningChecklistSurface,
  buildDashboardWorkflowListSurface,
  buildDocumentRegistryListSurface,
  buildDocumentQuarantineInboxListSurface,
  buildDocumentActivityLinesListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
  buildSavedViewsListSurface,
  dashboardHardeningChecklistSurfaceKey,
  getDashboardListSurfaceKeys,
  getModuleListSurfaceKeys,
} from "./modules/list-surfaces";
export {
  buildDashboardKpiStatGrid,
  buildDashboardWorkflowSummaryStatGrid,
  buildModuleScreenOverviewStatGrid,
  buildModuleWorkspaceCountStatGrid,
  buildModuleWorkspaceStatGrid,
  dashboardStatSurfaceKey,
  dashboardWorkflowSummaryStatSurfaceKey,
  getModuleOverviewStatSurfaceKey,
  getModuleStatSurfaceKey,
  type ResolvedMetric,
} from "./modules/stat-surfaces";
export {
  auditRowsFromPanel,
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
} from "./modules/detail-surfaces";
export {
  buildDashboardHardeningChart,
  buildModuleObservabilityChart,
  dashboardHardeningChartSurfaceKey,
  getModuleObservabilityChartSurfaceKey,
} from "./modules/chart-surfaces";
export {
  buildModuleWorkItemKanbanSurface,
  getModuleWorkItemKanbanSurfaceKey,
} from "./modules/kanban-surfaces";
export { buildDocumentExtractionFormMetadata } from "./modules/form-surfaces";
export {
  createModuleFeatureMetadata,
  isCoreModuleId,
  type CoreModuleId,
  type ModuleFeatureMetadata,
} from "./modules/feature-metadata";
export {
  resolveModuleWorkspaceListQuery,
  toDocumentActivityWindowQuery,
  toDocumentWindowQuery,
  type ModuleWorkspaceListQuery,
  type ModuleWorkspaceSearchParams,
} from "./shared/module-workspace-query";
export {
  fallbackModuleRecordColumns,
  getModuleRecordTypeDefinitions,
  getRecordTypeDefinition,
  parseRecordTypeExtension,
  recordTypeDefinitions,
  resolveModuleRecordListDefinition,
  resolveRecordTypeRowHref,
  resolveRecordTypeTrailingAction,
  type RecordTypeDefinition,
  type RecordTypeExtensionParseResult,
  type RecordTypeFilterDefinition,
  type RecordTypeListDefinition,
  type RecordTypeRouteDefinition,
  type RecordTypeSortDefinition,
} from "./modules/record-types";
export {
  describeWorkspaceDataSource,
  resolveWorkspaceDataMode,
  type ModuleDataMode,
} from "./shared/workspace-data-mode";
export {
  getModuleObservabilityIndicators,
  type ModuleObservabilityIndicator,
} from "./modules/observability";
export {
  getAssistantEmptyStateHint,
  getAssistantPromptDefinitions,
} from "./modules/assistant-prompts";
export type { AssistantPromptDefinition } from "./modules/assistant-prompts";
export {
  appBrandName,
  dashboardRouteMetrics,
  dashboardRouteSections,
  formatModuleObservabilityFooter,
  getWorkspaceSkeletonNavItemIds,
  moduleScreenDetailListLabels,
  moduleScreenMetrics,
  moduleScreenSections,
  erpAssistantPanelCopy,
  documentWorkflowCopy,
  routeErrorCopy,
} from "./shell/route-copy-metadata";
export {
  appRootMetadataCopy,
  authApiRouteCopy,
  authLoadingCopy,
  authPageMetadataCopy,
  authPageShellCopy,
  authShellCopy,
  devSignInCopy,
  forgotPasswordCopy,
  getAuthPageMetadataCopy,
  getAuthPageShellCopy,
  getNeonAuthFormModeCopy,
  neonAuthFormCopy,
  onboardingFormCopy,
  onboardingLoadingCopy,
  signInEnvironmentCopy,
  signUpEnvironmentCopy,
  uploadRouteCopy,
  type AuthPageMetadataKey,
} from "./shell/auth-route-copy";
export type {
  ErpModuleDefinition,
  BusinessProblemType,
  ModuleAction,
  ModuleFocusArea,
  ModuleMetric,
  ModuleTone,
  NavigationExtension,
  RecoveryPlaybook,
  RecoveryPlaybookIconKey,
  SolutionWorkflowId,
  WorkflowAutomationDefinition,
} from "./shared/module-types";
export {
  businessProblemTypes,
  getBusinessProblemTypeLabels,
  getSolutionToolModuleBindings,
  solutionToolModuleBindings,
  solutionWorkflowIds,
} from "./modules/solution-playbooks";
import {
  erpModules,
  getErpModuleById,
  moduleByHref,
  moduleById,
} from "./modules/definitions";

export {
  erpModules,
  getErpModuleById,
  moduleByHref,
  moduleById,
};
export {
  applyTenantModuleAvailability,
  type TenantModuleAvailabilitySetting,
} from "./modules/tenant-module-availability";
export {
  applyTenantCapabilityAvailability,
  applyTenantNavigationAvailability,
  type TenantCapabilityAvailabilitySetting,
} from "./modules/tenant-availability";
export {
  getNavigationExtensions,
  getNavigationExtensionById,
  navigationExtensions,
} from "./shell/navigation-extensions";
export {
  getRecoveryConsoleModuleIds,
  getRecoveryPlaybookByProblemType,
  getRecoveryPlaybookDefinitions,
  getWorkflowAutomationDefinitions,
} from "./modules/workflow-metadata";
export { getResolvedWorkflowAutomationRuns } from "./shared/workflow-resolution";
import type { ErpModuleDefinition, ModuleMetric } from "./shared/module-types";

export type ModuleWorkspaceRecord = {
  id: string;
  reference: string;
  title: string;
  recordType: string;
  status: string;
  owner: string;
  amount: string;
  amountValue: number | null;
  currency: string;
  due: string;
  dueAt: string | null;
  metadataSummary: string;
  extensionValid: boolean;
  extensionIssues: readonly string[];
};

export type ModuleWorkspaceRecordDetail = ModuleWorkspaceRecord & {
  moduleId: ModuleId;
  updatedAt: string;
  metadata: Record<string, unknown>;
  auditPanel: AuditPanelModel;
};

export type ModuleWorkspaceView = {
  id: string;
  name: string;
  description: string;
  visibility: string;
};

export type ModuleWorkspaceItem = {
  id: string;
  moduleId: ModuleId;
  subject: string;
  owner: string;
  status: string;
  priority: string;
  due: string;
  dueAt: string;
  sourceRecordId: string | null;
  metadata: Record<string, unknown>;
};

export type ModuleWorkspaceWorkItemDetail = ModuleWorkspaceItem & {
  metadata: Record<string, unknown>;
  metadataSummary: string;
  sourceRecordId: string | null;
  sourceRecordHref: `/${string}` | null;
  updatedAt: string;
  auditPanel: AuditPanelModel;
};

export type ModuleWorkspaceWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

export type ModuleWorkspaceDocument = {
  id: string;
  title: string;
  contentType: string;
  size: string;
  access: string;
  classification: string;
  retentionClass: string;
  scanStatus: string;
  createdAt: string;
};

export type ModuleWorkspaceDocumentActivityEvent = {
  id: string;
  summary: string;
  actorLabel: string;
  occurredAt: string;
  evidenceHref?: string;
  policyLabel?: string;
  riskTone?: "default" | "positive" | "attention" | "critical";
};

export type ModuleWorkspace = {
  module: ErpModuleDefinition;
  dataMode: import("./shared/workspace-data-mode").ModuleDataMode;
  fallbackApplied: boolean;
  records: readonly ModuleWorkspaceRecord[];
  recordWindow: ModuleWorkspaceWindow;
  savedViews: readonly ModuleWorkspaceView[];
  workItems: readonly ModuleWorkspaceItem[];
  workItemWindow: ModuleWorkspaceWindow;
  documents: readonly ModuleWorkspaceDocument[];
  documentWindow: ModuleWorkspaceWindow;
  documentActivityEvents: readonly ModuleWorkspaceDocumentActivityEvent[];
  documentActivityWindow: ModuleWorkspaceWindow;
};

export type ModuleWorkspaceStats = {
  recordCount: number;
  workItemCount: number;
  highPriorityWorkItemCount: number;
  documentCount: number;
  savedViewCount: number;
};

export type AiUsageRouteSummary = {
  id: string;
  feature: string;
  model: string;
  status: string;
  totalTokens: string;
  latency: string;
  created: string;
};

export function getDashboardMetrics() {
  const dashboard = moduleById.get("dashboard");

  if (!dashboard) {
    throw new Error("Dashboard module metadata is missing from erpModules.");
  }

  return dashboard.metrics;
}

export const roleOperatingPosture = {
  owner: {
    title: "Tenant owner",
    description: "Coordinates cross-module execution and governance outcomes.",
  },
  admin: {
    title: "Administrator",
    description:
      "Owns tenant-level controls, settings, and operational hygiene.",
  },
  "finance-manager": {
    title: "Finance manager",
    description: "Keeps close, receivables, and payables under control.",
  },
  "operations-manager": {
    title: "Operations manager",
    description:
      "Balances commercial demand, purchasing flow, and inventory execution.",
  },
  staff: {
    title: "Staff operator",
    description:
      "Works assigned workflows and resolves route-level exceptions.",
  },
  viewer: {
    title: "Viewer",
    description:
      "Consumes summaries and saved outputs without mutation rights.",
  },
} as const satisfies Record<
  OrganizationRole,
  {
    title: string;
    description: string;
  }
>;

export function getErpModuleByHref(href: string) {
  return moduleByHref.get(href) ?? null;
}

export function getAccessibleModules(capabilities: readonly AppCapability[]) {
  return erpModules.filter((module) =>
    capabilities.includes(module.requiredCapability),
  );
}

export function getWorkspaceReadinessSummary(
  capabilities: readonly AppCapability[],
) {
  const modules = getAccessibleModules(capabilities);

  return {
    accessibleModuleCount: modules.length,
    controlModules: modules.filter((module) => module.status.tone === "warning")
      .length,
    operationalModules: modules.filter(
      (module) => module.status.tone === "positive",
    ).length,
  };
}

function formatDate(value: Date | null) {
  return formatErpDateTime(value, {
    fallback: "Not scheduled",
    locale: "en-MY",
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
    timeZoneName: undefined,
  });
}

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

function formatAmount(amountCents: number | null, currency: string) {
  return formatErpMoneyFromMinorUnits(amountCents, currency, {
    fallback: "N/A",
    locale: "en-MY",
    maximumFractionDigits: 0,
  });
}

function formatSize(sizeBytes: number) {
  return formatErpFileSize(sizeBytes);
}

function summarizeMetadata(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata).slice(0, 2);

  if (entries.length === 0) {
    return "No extra metadata";
  }

  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
}

function isPrimitiveMetadataValue(value: unknown) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function mapAuditRow(input: {
  auditLog: TenantAuditLog;
  resourceLabel: string;
}): AuditPanelRow {
  const metadataChips = Object.entries(input.auditLog.metadata)
    .filter(([, value]) => isPrimitiveMetadataValue(value))
    .slice(0, 4)
    .map(([key]) => ({
      label: key,
    }));

  return {
    id: input.auditLog.id,
    action: input.auditLog.action,
    occurredAt: input.auditLog.createdAt.toISOString(),
    actorLabel: input.auditLog.actorAuthUserId,
    actorDetail: "Auth user",
    resourceLabel: input.resourceLabel,
    narrative: input.auditLog.summary,
    ...(metadataChips.length > 0 ? { metadataChips } : {}),
  };
}

export function buildAuditPanelModel(input: {
  title: string;
  description?: string;
  resourceLabel: string;
  auditLogs: readonly TenantAuditLog[];
}): AuditPanelModel {
  return {
    dataNature: "audit-trail",
    headerTitle: input.title,
    ...(input.description ? { headerDescription: input.description } : {}),
    density: "compact",
    rows: input.auditLogs.map((auditLog) =>
      mapAuditRow({
        auditLog,
        resourceLabel: input.resourceLabel,
      }),
    ),
  };
}

function serializeRecord(
  moduleId: ModuleId,
  record: TenantErpRecord,
): ModuleWorkspaceRecord {
  const extension = parseRecordTypeExtension({
    moduleId,
    recordType: record.recordType,
    metadata: record.metadata,
  });

  return {
    id: record.id,
    reference: record.reference,
    title: record.title,
    recordType: record.recordType,
    status: record.status,
    owner: record.owner,
    amount: formatAmount(record.amountCents, record.currency),
    amountValue:
      record.amountCents === null
        ? null
        : Number((record.amountCents / 100).toFixed(2)),
    currency: record.currency,
    due: formatDate(record.dueAt),
    dueAt: serializeDate(record.dueAt),
    metadataSummary: summarizeMetadata(record.metadata),
    extensionValid: extension.success,
    extensionIssues: extension.success ? [] : extension.issues,
  };
}

function serializeSavedView(view: TenantErpSavedView): ModuleWorkspaceView {
  return {
    id: view.id,
    name: view.name,
    description: view.description,
    visibility: view.visibility,
  };
}

function serializeWorkItem(item: TenantErpWorkItem): ModuleWorkspaceItem {
  return {
    id: item.id,
    moduleId: item.moduleId,
    subject: item.subject,
    owner: item.owner,
    status: item.status,
    priority: item.priority,
    due: formatDate(item.dueAt),
    dueAt: item.dueAt.toISOString(),
    sourceRecordId: item.sourceRecordId,
    metadata: item.metadata,
  };
}

function serializeWorkItemDetail(
  item: TenantErpWorkItemDetail,
  auditPanel: AuditPanelModel,
): ModuleWorkspaceWorkItemDetail {
  return {
    ...serializeWorkItem(item),
    metadata: item.metadata,
    metadataSummary: summarizeMetadata(item.metadata),
    sourceRecordId: item.sourceRecordId,
    sourceRecordHref: item.sourceRecordId
      ? `/${item.moduleId}/records/${encodeURIComponent(item.sourceRecordId)}`
      : null,
    updatedAt: item.updatedAt.toISOString(),
    auditPanel,
  };
}

function serializeDocument(
  document: TenantErpDocument,
): ModuleWorkspaceDocument {
  return {
    id: document.id,
    title: document.title,
    contentType: document.contentType,
    size: formatSize(document.sizeBytes),
    access: document.access,
    classification: document.classification,
    retentionClass: document.retentionClass,
    scanStatus: document.scanStatus,
    createdAt: document.createdAt.toISOString(),
  };
}

function createMetadataWorkspace(
  moduleDefinition: ErpModuleDefinition,
  fallbackApplied = false,
): ModuleWorkspace {
  const records = moduleDefinition.milestones.map((milestone, index) => ({
    id: `${moduleDefinition.id}-milestone-${index + 1}`,
    reference: `${moduleDefinition.id.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    title: milestone,
    recordType: "implementation-milestone",
    status: "planned",
    owner: moduleDefinition.ownerTeam,
    amount: "N/A",
    amountValue: null,
    currency: "MYR",
    due: "Roadmap",
    dueAt: null,
    metadataSummary: "source: module metadata",
    extensionValid: true,
    extensionIssues: [],
  }));
  const workItems =
    moduleDefinition.id === "dashboard"
      ? []
      : moduleDefinition.milestones.slice(0, 2).map((milestone, index) => ({
          id: `${moduleDefinition.id}-work-item-${index + 1}`,
          moduleId: moduleDefinition.id,
          subject: milestone,
          owner: moduleDefinition.ownerTeam,
          status: index === 0 ? "pending" : "scheduled",
          priority: index === 0 ? "medium" : "low",
          due: "Roadmap",
          dueAt: new Date(0).toISOString(),
          sourceRecordId: null,
          metadata: { source: "module-metadata" },
        }));

  return {
    module: moduleDefinition,
    dataMode: "metadata",
    fallbackApplied,
    records,
    recordWindow: {
      pageSize: records.length,
      totalCount: records.length,
      hasNextPage: false,
    },
    savedViews: moduleDefinition.defaultViews.map((view, index) => ({
      id: `${moduleDefinition.id}-view-${index + 1}`,
      name: view,
      description: `Default ${moduleDefinition.label.toLowerCase()} workspace view.`,
      visibility: "team",
    })),
    workItems,
    workItemWindow: {
      pageSize: workItems.length,
      totalCount: workItems.length,
      hasNextPage: false,
    },
    documents: [],
    documentWindow: {
      pageSize: 0,
      totalCount: 0,
      hasNextPage: false,
    },
    documentActivityEvents: [],
    documentActivityWindow: {
      pageSize: 0,
      totalCount: 0,
      hasNextPage: false,
    },
  };
}

function serializeRecordWindow(
  window: TenantErpRecordWindow,
): ModuleWorkspaceWindow {
  return {
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    ...(window.nextCursor ? { nextCursor: window.nextCursor } : {}),
  };
}

function serializeWorkItemWindow(
  window: TenantErpWorkItemWindow,
): ModuleWorkspaceWindow {
  return {
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    ...(window.nextCursor ? { nextCursor: window.nextCursor } : {}),
  };
}

function serializeDocumentWindow(
  window: TenantErpDocumentWindow,
): ModuleWorkspaceWindow {
  return {
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    ...(window.nextCursor ? { nextCursor: window.nextCursor } : {}),
  };
}

function serializeDocumentActivityWindow(
  window: TenantDocumentEvidenceWindow,
): ModuleWorkspaceWindow {
  return {
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    ...(window.nextCursor ? { nextCursor: window.nextCursor } : {}),
  };
}

const DOCUMENT_EVIDENCE_ACTIONS_WITH_HREF = new Set([
  "DOCUMENT_UPLOADED",
  "DOCUMENT_DOWNLOADED",
]);

function resolveDocumentEvidenceRiskTone(
  action: string,
): ModuleWorkspaceDocumentActivityEvent["riskTone"] {
  if (action.endsWith("_DENIED") || action === "DOCUMENT_DELETED") {
    return "critical";
  }

  if (action === "DOCUMENT_MALWARE_DETECTED") {
    return "critical";
  }

  if (
    action === "DOCUMENT_RETENTION_EXPIRED" ||
    action === "DOCUMENT_LEGAL_HOLD_APPLIED" ||
    action === "DOCUMENT_ORG_LEGAL_HOLD_CASCADED" ||
    action === "hr.document.archive" ||
    action === "hr.document.legal-hold"
  ) {
    return "attention";
  }

  if (
    action === "DOCUMENT_UPLOADED" ||
    action === "DOCUMENT_DOWNLOADED" ||
    action === "DOCUMENT_LEGAL_HOLD_RELEASED" ||
    action === "DOCUMENT_SCAN_QUARANTINE_RELEASED" ||
    action === "hr.document.verify" ||
    action === "hr.document.upload"
  ) {
    return "positive";
  }

  if (
    action === "hr.document.reject" ||
    action === "hr.document.delete"
  ) {
    return "critical";
  }

  return "default";
}

function formatDocumentEvidenceActionLabel(action: string) {
  const normalized = action.startsWith("hr.document.")
    ? action.replace(/^hr\.document\./, "")
    : action.replace(/^DOCUMENT_/, "").toLowerCase();

  return normalized
    .split(/[._]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveDocumentEvidenceHref(input: {
  action: string;
  entityId: string;
  moduleId: ModuleId;
}) {
  if (DOCUMENT_EVIDENCE_ACTIONS_WITH_HREF.has(input.action)) {
    return `/api/internal/v1/documents/${input.entityId}/download?moduleId=${input.moduleId}`;
  }

  if (
    input.action === "hr.document.download" &&
    input.moduleId === "hr"
  ) {
    return `/api/internal/v1/documents/${input.entityId}/download?moduleId=hr`;
  }

  return undefined;
}

function resolveDocumentEvidenceActorLabel(
  row: TenantDocumentEvidenceWindowRow,
) {
  const actorType = row.metadata.actorType;
  if (actorType === "system") {
    return "System";
  }

  if (actorType === "agent") {
    return "Agent";
  }

  const actorId = row.actorAuthUserId.trim();
  if (actorId.length <= 12) {
    return actorId || "Operator";
  }

  return `${actorId.slice(0, 8)}…`;
}

function serializeDocumentActivityEvent(
  row: TenantDocumentEvidenceWindowRow,
  moduleId: ModuleId,
): ModuleWorkspaceDocumentActivityEvent {
  const retentionClass = row.metadata.retentionClass;
  const policyLabel =
    typeof retentionClass === "string" && retentionClass.length > 0
      ? retentionClass
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : formatDocumentEvidenceActionLabel(row.action);

  const evidenceHref = resolveDocumentEvidenceHref({
    action: row.action,
    entityId: row.entityId,
    moduleId,
  });

  return {
    id: row.id,
    summary: row.summary.trim() || formatDocumentEvidenceActionLabel(row.action),
    actorLabel: resolveDocumentEvidenceActorLabel(row),
    occurredAt: row.createdAt.toISOString(),
    ...(evidenceHref ? { evidenceHref } : {}),
    ...(policyLabel ? { policyLabel } : {}),
    riskTone: resolveDocumentEvidenceRiskTone(row.action),
  };
}

export async function getModuleWorkspace(input: {
  organizationId: string;
  moduleId: ModuleId;
  dataMode: ModuleDataMode;
  query?: ModuleWorkspaceListQuery;
}): Promise<ModuleWorkspace> {
  const moduleDefinition = getErpModuleById(input.moduleId);

  if (!moduleDefinition) {
    throw new Error(`Unknown ERP module: ${input.moduleId}`);
  }

  if (input.dataMode === "metadata") {
    return createMetadataWorkspace(moduleDefinition);
  }

  const [recordWindow, savedViews, workItemWindow, documentWindow, documentActivityWindow] =
    await Promise.all([
      listTenantErpRecordWindow({
        organizationId: input.organizationId,
        moduleId: input.moduleId,
        query: toRecordWindowQuery(input.query),
      }),
      listTenantSavedViews({
        organizationId: input.organizationId,
        moduleId: input.moduleId,
      }),
      listTenantWorkItemWindow({
        organizationId: input.organizationId,
        moduleId: input.moduleId,
        query: toWorkItemWindowQuery(input.query),
      }),
      listTenantDocumentWindow({
        organizationId: input.organizationId,
        moduleId: input.moduleId,
        query: toDocumentWindowQuery(input.query),
      }),
      listTenantModuleDocumentActivityWindow({
        organizationId: input.organizationId,
        moduleId: input.moduleId,
        query: toDocumentActivityWindowQuery(input.query),
      }),
    ]);

  if (
    recordWindow.rows.length === 0 &&
    savedViews.length === 0 &&
    workItemWindow.rows.length === 0 &&
    documentWindow.rows.length === 0 &&
    documentActivityWindow.rows.length === 0
  ) {
    return createMetadataWorkspace(moduleDefinition, true);
  }

  return {
    module: moduleDefinition,
    dataMode: "persisted" as const,
    fallbackApplied: false,
    records: recordWindow.rows.map((record) =>
      serializeRecord(input.moduleId, record),
    ),
    recordWindow: serializeRecordWindow(recordWindow),
    savedViews: savedViews.map(serializeSavedView),
    workItems: workItemWindow.rows.map(serializeWorkItem),
    workItemWindow: serializeWorkItemWindow(workItemWindow),
    documents: documentWindow.rows.map(serializeDocument),
    documentWindow: serializeDocumentWindow(documentWindow),
    documentActivityEvents: documentActivityWindow.rows.map((row) =>
      serializeDocumentActivityEvent(row, input.moduleId),
    ),
    documentActivityWindow: serializeDocumentActivityWindow(
      documentActivityWindow,
    ),
  };
}

export async function getDashboardWorkspace(input: {
  organizationId: string;
  dataMode: ModuleDataMode;
  query?: Pick<
    ModuleWorkspaceListQuery,
    | "workItemsCursor"
    | "workItemsSort"
    | "workItemsStatus"
    | "workItemsPriority"
  >;
}): Promise<ModuleWorkspace> {
  const moduleDefinition = getErpModuleById("dashboard");

  if (!moduleDefinition) {
    throw new Error("Dashboard module metadata is missing.");
  }

  if (input.dataMode === "metadata") {
    return createMetadataWorkspace(moduleDefinition);
  }

  const [savedViews, workItemWindow] = await Promise.all([
    listTenantSavedViews({
      organizationId: input.organizationId,
      moduleId: "dashboard",
    }),
    listTenantWorkItemWindow({
      organizationId: input.organizationId,
      limit: 8,
      query: toWorkItemWindowQuery(input.query),
    }),
  ]);

  const hasPersistedData =
    savedViews.length > 0 || workItemWindow.rows.length > 0;

  return {
    module: moduleDefinition,
    dataMode: hasPersistedData ? "persisted" : "metadata",
    fallbackApplied: !hasPersistedData,
    records: [],
    recordWindow: {
      pageSize: 0,
      totalCount: 0,
      hasNextPage: false,
    },
    savedViews:
      savedViews.length > 0
        ? savedViews.map(serializeSavedView)
        : createMetadataWorkspace(moduleDefinition).savedViews,
    workItems: workItemWindow.rows.map(serializeWorkItem),
    workItemWindow: serializeWorkItemWindow(workItemWindow),
    documents: [],
    documentWindow: {
      pageSize: 0,
      totalCount: 0,
      hasNextPage: false,
    },
    documentActivityEvents: [],
    documentActivityWindow: {
      pageSize: 0,
      totalCount: 0,
      hasNextPage: false,
    },
  };
}

export async function getModuleWorkspaceRecord(input: {
  organizationId: string;
  moduleId: ModuleId;
  recordId: string;
  dataMode: ModuleDataMode;
}): Promise<ModuleWorkspaceRecordDetail | null> {
  const moduleDefinition = getErpModuleById(input.moduleId);

  if (!moduleDefinition) {
    throw new Error(`Unknown ERP module: ${input.moduleId}`);
  }

  if (input.dataMode === "metadata") {
    const workspace = createMetadataWorkspace(moduleDefinition);
    const record = workspace.records.find((item) => item.id === input.recordId);

    return record
      ? {
          ...record,
          moduleId: input.moduleId,
          updatedAt: new Date(0).toISOString(),
          metadata: { source: "module metadata" },
          auditPanel: buildAuditPanelModel({
            title: `${record.reference} audit`,
            description:
              "No persisted audit rows are available in metadata mode.",
            resourceLabel: record.reference,
            auditLogs: [],
          }),
        }
      : null;
  }

  const record = await getTenantErpRecord({
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    recordId: input.recordId,
  });

  if (!record) {
    return null;
  }

  const auditLogs = await listAuditLogsForEntity({
    organizationId: input.organizationId,
    entityType: "erp-record",
    entityId: input.recordId,
  });

  return {
    ...serializeRecord(input.moduleId, record),
    moduleId: input.moduleId,
    updatedAt: record.updatedAt.toISOString(),
    metadata: record.metadata,
    auditPanel: buildAuditPanelModel({
      title: `${record.reference} audit`,
      description: "Read-only audit entries scoped to this record.",
      resourceLabel: record.reference,
      auditLogs,
    }),
  };
}

export async function getModuleWorkspaceWorkItem(input: {
  organizationId: string;
  moduleId: ModuleId;
  workItemId: string;
  dataMode: ModuleDataMode;
}): Promise<ModuleWorkspaceWorkItemDetail | null> {
  const moduleDefinition = getErpModuleById(input.moduleId);

  if (!moduleDefinition) {
    throw new Error(`Unknown ERP module: ${input.moduleId}`);
  }

  if (input.dataMode === "metadata") {
    const workspace = createMetadataWorkspace(moduleDefinition);
    const workItem = workspace.workItems.find(
      (item) => item.id === input.workItemId,
    );

    return workItem
      ? {
          ...workItem,
          metadata: { source: "module metadata" },
          metadataSummary: "source: module metadata",
          sourceRecordId: workspace.records[0]?.id ?? null,
          sourceRecordHref: workspace.records[0]
            ? `/${input.moduleId}/records/${encodeURIComponent(workspace.records[0].id)}`
            : null,
          updatedAt: new Date(0).toISOString(),
          auditPanel: buildAuditPanelModel({
            title: `${workItem.subject} audit`,
            description:
              "No persisted audit rows are available in metadata mode.",
            resourceLabel: workItem.subject,
            auditLogs: [],
          }),
        }
      : null;
  }

  const workItem = await getTenantWorkItem({
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    workItemId: input.workItemId,
  });

  if (!workItem) {
    return null;
  }

  const auditLogs = await listAuditLogsForEntity({
    organizationId: input.organizationId,
    entityType: "workflow-item",
    entityId: input.workItemId,
  });

  return serializeWorkItemDetail(
    workItem,
    buildAuditPanelModel({
      title: `${workItem.subject} audit`,
      description: "Read-only audit entries scoped to this work item.",
      resourceLabel: workItem.subject,
      auditLogs,
    }),
  );
}

export function getModuleWorkspaceStats(
  workspace: ModuleWorkspace,
): ModuleWorkspaceStats {
  return {
    recordCount: workspace.records.length,
    workItemCount: workspace.workItems.length,
    highPriorityWorkItemCount: workspace.workItems.filter(
      (item) => item.priority === "high",
    ).length,
    documentCount: workspace.documentWindow.totalCount,
    savedViewCount: workspace.savedViews.length,
  };
}

function serializeAiUsageEvent(event: AiUsageSummary): AiUsageRouteSummary {
  return {
    id: event.id,
    feature: event.feature,
    model: event.model,
    status: event.status,
    totalTokens: String(event.totalTokens),
    latency: `${event.latencyMs}ms`,
    created: formatDate(event.createdAt),
  };
}

export async function getAiUsageRouteSummary(input: {
  organizationId: string;
  limit?: number;
}) {
  const events = await listAiUsageEvents({
    organizationId: input.organizationId,
    limit: input.limit,
  });

  return events.map(serializeAiUsageEvent);
}

export async function getResolvedModuleMetrics(input: {
  organizationId: string;
  moduleId: ModuleId;
  metrics: readonly ModuleMetric[];
}) {
  const summary = await summarizeTenantModuleMetrics({
    organizationId: input.organizationId,
    moduleId: input.moduleId,
  });

  return resolveModuleMetrics(input.metrics, summary);
}

export async function getResolvedDashboardMetrics(organizationId: string) {
  const summary = await summarizeTenantOrganizationMetrics({ organizationId });

  return resolveModuleMetrics(getDashboardMetrics(), summary);
}
