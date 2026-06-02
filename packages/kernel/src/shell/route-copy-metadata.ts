export const appBrandName = "Afenda ERP";

export const workspaceSkeletonNavItemIds = [
  "dashboard",
  "finance",
  "sales",
  "inventory",
  "approvals",
  "lynx",
] as const;

export function getWorkspaceSkeletonNavItemIds() {
  return workspaceSkeletonNavItemIds;
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
    title: "Lynx review",
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
    title: "Lynx review",
    description:
      "Gateway-backed chat for workflow review, document extraction guidance, and human-approved approval proposals.",
    aiUsageLedger: {
      title: "Lynx usage ledger",
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

export const erpAssistantPanelCopy = {
  title: "Lynx workspace",
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
    uploadingMessage: "Uploading document to secure object storage.",
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
  systemAdmin: {
    title: "System admin error",
    description:
      "This governance surface could not load. Retry or return to the System Admin hub.",
    actionLabel: "Try again",
    hubActionLabel: "Back to hub",
  },
} as const;
