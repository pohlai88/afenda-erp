import type { NavigationExtension } from "../shared/module-types";

export const appBrandName = "Afenda ERP";

export const appShellSkeletonNavItemIds = [
  "dashboard",
  "finance",
  "sales",
  "inventory",
  "approvals",
  "solution-console",
] as const;

export function getAppShellSkeletonNavItemIds() {
  return appShellSkeletonNavItemIds;
}

export const solutionConsoleAgentCopy = {
  title: "Solution Provider Agent",
  description:
    "Diagnose business problems, cite ERP evidence, and draft human-approved recovery actions.",
  inputPlaceholder: "Describe the business problem you need Afenda to solve...",
  toolRejectReason: "Rejected by Solution Console operator.",
} as const;

export const solutionConsoleUxCards = [
  {
    id: "root-causes",
    title: "Root causes",
    description:
      "The agent must identify drivers, missing data, source modules, and confidence before recommending action.",
    iconKey: "alert-triangle" as const,
  },
  {
    id: "recovery-actions",
    title: "Recovery actions",
    description:
      "Actions are ranked by business impact, owner team, risk, and source records.",
    iconKey: "badge-check" as const,
  },
  {
    id: "approval-boundary",
    title: "Approval boundary",
    description:
      "Sensitive ERP work is drafted only. Tool execution requires an explicit approval response.",
    iconKey: "send" as const,
  },
] as const;

export function getSolutionConsoleUxCards() {
  return solutionConsoleUxCards;
}

export const solutionConsoleHeroFallback = {
  title: "Recover business problems with evidence-backed actions",
  description:
    "Afenda connects ERP module signals to recovery playbooks so operators can diagnose root causes, inspect source records, and approve sensitive next actions.",
  statusLabel: "Human approved",
} as const;

export const solutionConsoleMetrics = [
  {
    id: "evidence-records",
    label: "Evidence records",
    detail: "Records available across recovery-focused modules.",
  },
  {
    id: "workflow-items",
    label: "Workflow items",
    detail: "Active work that can influence recovery timing.",
  },
  {
    id: "high-priority",
    label: "High priority",
    detail: "Urgent items that should shape recovery priority.",
  },
  {
    id: "documents",
    label: "Documents",
    detail: "Documents available for review and extraction context.",
  },
] as const;

export const solutionConsoleSections = {
  hero: {
    eyebrow: "Solution Provider Console",
  },
  playbookCatalog: {
    title: "Recovery playbook catalog",
    description:
      "Curated workflows keep the console focused on solving SME operating problems instead of becoming a generic workflow builder.",
  },
  operationalSkills: {
    title: "Operational skill layer",
    description:
      "Reusable module skills turn context, grounding, confidence, and action sandboxes into repeatable ERP operations.",
  },
  agentWorkspace: {
    title: "Agent workspace",
    description:
      "Ask the Solution Provider Agent to run a recovery workflow, inspect ERP signals, draft tasks, or prepare a human-approved action proposal.",
  },
  evidenceCoverage: {
    title: "Evidence coverage",
    description:
      "Recovery recommendations are constrained by modules and records available under the current role.",
  },
  aiUsageLedger: {
    title: "AI usage ledger",
    description:
      "Solution Provider calls are tagged by feature, tenant, user, workflow, risk, and model through AI Gateway.",
    emptyRow: ["No usage", "-", "-", "0", "-"] as const,
  },
  connectedModules: {
    title: "Connected ERP modules",
    description:
      "Open the owning workspace before approving a proposed recovery action.",
  },
} as const;

export function getSolutionConsoleSection<
  TSection extends keyof typeof solutionConsoleSections,
>(sectionId: TSection) {
  return solutionConsoleSections[sectionId];
}

export const moduleScreenMetrics = [
  {
    id: "tenant-records",
    label: "Tenant records",
    detail: "Serialized records currently available to this module route.",
  },
  {
    id: "workflow-items",
    label: "Workflow items",
    detail:
      "Open workflow items resolved from tenant data or metadata fallback.",
  },
  {
    id: "documents",
    label: "Documents",
    detail: "Blob-backed documents registered for this module.",
  },
] as const;

export const moduleScreenDetailListLabels = {
  primaryRoute: "Primary route",
  defaultViews: "Default views",
  linkedActions: "Linked actions",
  dataSource: "Data source",
  milestones: "Milestones",
  noneConfigured: "None configured",
  metadataRoutes: (count: number) => `${count} metadata routes`,
  queuedImprovements: (count: number) => `${count} queued improvements`,
} as const;

export const moduleScreenSections = {
  controlDesign: {
    title: "Control and workflow design",
  },
  tenantRecords: {
    title: "Tenant records",
    description:
      "Serialized business records for this module, normalized for route-level review.",
  },
  workflowQueue: {
    title: "Active workflow queue",
    description: "Review pressure, priority, and due timing for this route.",
  },
  observability: {
    title: "Observability posture",
    description:
      "Runtime indicators and current instrumentation focus for this route.",
  },
  savedViews: {
    title: "Saved views",
    description: "Default and tenant-specific views available to this route.",
  },
  documents: {
    title: "Document registry",
    description:
      "Blob-backed document ownership is tracked by tenant, module, entity, and access level.",
    emptyState: "No documents have been registered for this module yet.",
  },
  connectedModules: {
    title: "Connected modules",
    description:
      "Use route metadata to move into adjacent workflows without losing organizational context.",
  },
  aiAssistant: {
    title: "AI assistant",
    description:
      "Gateway-backed chat for workflow review, record queries, document guidance, and human-approved action proposals.",
  },
} as const;

export function formatModuleObservabilityFooter(input: {
  highPriorityCount: number;
  escalationCount: number;
}) {
  return `${input.highPriorityCount} high-priority items and ${input.escalationCount} escalations currently require active review on this route.`;
}

export const dashboardRouteMetrics = [
  {
    id: "accessible-modules",
    label: "Accessible modules",
    detail: "Routes available under the current role and organization context.",
  },
  {
    id: "workspace-views",
    label: "Workspace views",
    detail: (dataSourceLabel: string) =>
      `Saved views resolved from ${dataSourceLabel.toLowerCase()}.`,
  },
  {
    id: "workflow-items",
    label: "Workflow items",
    detail: (operationalModules: number, controlModules: number) =>
      `${operationalModules} operational modules and ${controlModules} watchlist modules are in scope.`,
  },
] as const;

export const dashboardRouteSections = {
  priorityQueue: {
    title: "Priority queue",
  },
  automationTelemetry: {
    title: "Automation and telemetry",
    description: "Runtime health and scheduled background execution.",
    scheduledAutomationsTitle: "Scheduled automations",
  },
  aiAssistant: {
    title: "AI assistant",
    description:
      "Gateway-backed chat for workflow review, document extraction guidance, and human-approved approval proposals.",
    aiUsageLedger: {
      title: "AI usage ledger",
      description:
        "Gateway calls are logged by tenant, user, feature, model, token count, and latency after completion.",
      emptyRow: ["No usage", "-", "-", "0", "-"] as const,
    },
  },
  productionHardening: {
    title: "Production hardening",
    description:
      "Operational controls for telemetry, scheduled work, security posture, and tenant defense in depth.",
  },
  savedViews: {
    title: "Saved workspace views",
    description:
      "Dashboard view presets are resolved from tenant data when available and module metadata otherwise.",
  },
  moduleSurfaces: {
    title: "Module surfaces",
    description:
      "The live navigation model is derived from role capabilities and shared module metadata.",
  },
} as const;

export function getNavigationExtensionHeroCopy(
  extension: NavigationExtension | null | undefined,
) {
  return {
    title: extension?.label ?? solutionConsoleHeroFallback.title,
    description:
      extension?.description ?? solutionConsoleHeroFallback.description,
    statusLabel:
      extension?.status.label ?? solutionConsoleHeroFallback.statusLabel,
    statusTone: extension?.status.tone ?? ("positive" as const),
  };
}

export const solutionConsolePageMetadata = {
  title: "Solution Console",
  description:
    "AI-native ERP problem solving for evidence-backed recovery plans and human-approved execution.",
} as const;

export const erpAssistantPanelCopy = {
  title: "ERP assistant",
  description: "Gateway-backed guidance with approved tool execution.",
  inputPlaceholder:
    "Ask for a workflow summary or draft an approval proposal...",
  emptyStateSuffix: "or describe the next operational action you need.",
  toolRejectReason: "Rejected by operator.",
} as const;

export const documentWorkflowCopy = {
  upload: {
    idleMessage: "Ready for private document upload.",
    selectDocumentWarning: "Select a document before uploading.",
    invalidTypeWarning: "This file type is not accepted for ERP documents.",
    sizeLimitWarning: (limitLabel: string) =>
      `Document size must be ${limitLabel} or less.`,
    uploadingMessage: "Uploading document to Vercel Blob.",
    successMessage:
      "Document uploaded. Registry will refresh after completion.",
    failureMessage: "Document upload failed.",
    blobUnavailableMessage:
      "Document uploads are unavailable in this environment.",
    titleLabel: "Document title",
    titlePlaceholder: "Invoice, receipt, contract",
    ownerEntityLabel: "Owner entity",
    ownerEntityPlaceholder: "Optional record ID",
    fileLabel: "File",
    submitLabel: "Upload document",
    submittingLabel: "Uploading",
  },
  extraction: {
    idleMessage: "Paste document text to run schema-validated extraction.",
    runningMessage: "Running extraction through AI Gateway.",
    successMessage: "Extraction completed and logged for review.",
    failureMessage: "Document extraction failed.",
    unexpectedPayloadMessage:
      "Document extraction returned an unexpected payload.",
    titleLabel: "Document title",
    titlePlaceholder: "Supplier invoice",
    documentIdLabel: "Document ID",
    documentIdPlaceholder: "Optional registry ID",
    documentTextLabel: "Document text",
    documentTextPlaceholder:
      "Paste invoice, purchase order, receipt, or HR document text...",
    submitLabel: "Extract",
    lineItemsTitle: "Extracted line items",
    rawPayloadTitle: "Raw schema payload",
  },
} as const;

export const routeErrorCopy = {
  appError: {
    title: "Workspace error",
    description:
      "The workspace could not load this module. Retry or return to the dashboard.",
    actionLabel: "Try again",
  },
  appNotFound: {
    title: "Module not found",
    description:
      "This module route is unavailable or you do not have access to it.",
    actionLabel: "Back to dashboard",
  },
  rootError: {
    title: "Unexpected error",
    description:
      "Something went wrong while loading this page. You can retry or return to the dashboard.",
    actionLabel: "Try again",
  },
  onboardingError: {
    title: "Onboarding error",
    description:
      "Workspace onboarding could not finish. Retry or contact your administrator.",
    actionLabel: "Try again",
  },
  authError: {
    title: "Authentication error",
    description:
      "The sign-in flow could not be completed. Retry or return to the sign-in page.",
    actionLabel: "Try again",
  },
} as const;
