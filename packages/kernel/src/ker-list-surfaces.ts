import type { ModuleId } from "@afenda/config/module-ids";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceToolbar,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "./ker-governed-surface-contract";
import type { ModuleWorkspaceListQuery } from "./ker-module-workspace-query";
import {
  getModuleRecordTypeDefinitions,
  resolveModuleRecordListDefinition,
  resolveRecordTypeRowHref,
  resolveRecordTypeTrailingAction,
} from "./ker-record-types";
import {
  dashboardRouteSections,
  moduleScreenSections,
} from "./ker-route-copy-metadata";

type AiUsageListRow = {
  id: string;
  feature: string;
  model: string;
  status: string;
  totalTokens: string;
  latency: string;
};
type ModuleRecordRow = {
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
  extensionValid?: boolean;
  extensionIssues?: readonly string[];
};

type ModuleWorkItemRow = {
  id: string;
  subject: string;
  owner: string;
  status: string;
  priority: string;
  due: string;
  dueAt: string;
};

type DashboardWorkItemRow = ModuleWorkItemRow & {
  moduleId: ModuleId;
};

type ModuleListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type ModulePaginationKind =
  | "records"
  | "work-items"
  | "documents"
  | "document-activity";

const MODULE_WORK_ITEM_COLUMNS = [
  {
    id: "subject",
    header: "Work item",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 220,
  },
  { id: "owner", header: "Owner" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  {
    id: "priority",
    header: "Priority",
    cellKind: { kind: "badge" as const, tone: "attention" as const },
  },
  { id: "due", header: "Due", cellKind: { kind: "date" as const } },
];

const DASHBOARD_WORKFLOW_COLUMNS = [
  {
    id: "subject",
    header: "Work item",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 220,
  },
  { id: "moduleId", header: "Module", cellKind: { kind: "badge" as const } },
  { id: "owner", header: "Owner" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "due", header: "Due", cellKind: { kind: "date" as const } },
];

const DASHBOARD_AI_USAGE_COLUMNS = [
  {
    id: "feature",
    header: "Feature",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "model", header: "Model" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "totalTokens", header: "Tokens" },
  { id: "latency", header: "Latency" },
];

const WORK_ITEM_TOOLBAR = {
  filters: [
    {
      id: "work-item-status",
      label: "Status",
      param: "workItemsStatus",
      options: [
        { label: "Pending", value: "pending" },
        { label: "In review", value: "in-review" },
        { label: "Escalated", value: "escalated" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Completed", value: "completed" },
      ],
    },
    {
      id: "work-item-priority",
      label: "Priority",
      param: "workItemsPriority",
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
    },
  ],
  sort: {
    label: "Sort",
    param: "workItemsSort",
    options: [
      {
        label: "Due soonest",
        value: "due-asc",
        columnId: "due",
        direction: "asc" as const,
      },
      {
        label: "Priority",
        value: "priority-desc",
        columnId: "priority",
        direction: "desc" as const,
      },
      {
        label: "Recently updated",
        value: "updated-desc",
        columnId: "updatedAt",
        direction: "desc" as const,
      },
    ],
  },
  resetParams: ["workItemsCursor"],
  columnPicker: true,
} satisfies ListSurfaceToolbar;

function moduleSurfaceKey(moduleId: ModuleId, kind: "records" | "work-items") {
  return `${moduleId}.${kind}.list`;
}

function buildPagination(
  window: ModuleListWindow | undefined,
  rowCount: number,
) {
  if (!window) {
    return {
      pageSize: Math.max(1, rowCount),
      totalCount: rowCount,
      hasNextPage: false,
    };
  }

  return {
    pageSize: Math.max(1, window.pageSize),
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    ...(window.hasNextPage && window.nextCursor
      ? { nextCursor: window.nextCursor }
      : {}),
  };
}

function decodeWindowOffset(cursor: string | undefined) {
  const match = cursor ? /^offset:(\d+)$/.exec(cursor) : null;
  return match ? Number(match[1]) : 0;
}

function buildModuleListHref(input: {
  moduleId: ModuleId | "dashboard" | "lynx";
  kind: ModulePaginationKind;
  query?: ModuleWorkspaceListQuery;
  cursor?: string;
}) {
  const params = new URLSearchParams();
  const query = input.query;

  if (query?.recordsSort) params.set("recordsSort", query.recordsSort);
  if (query?.recordsStatus) params.set("recordsStatus", query.recordsStatus);
  if (query?.recordsRecordType) {
    params.set("recordsRecordType", query.recordsRecordType);
  }
  if (query?.workItemsSort) params.set("workItemsSort", query.workItemsSort);
  if (query?.workItemsStatus) {
    params.set("workItemsStatus", query.workItemsStatus);
  }
  if (query?.workItemsPriority) {
    params.set("workItemsPriority", query.workItemsPriority);
  }

  const cursorParam =
    input.kind === "records"
      ? "recordsCursor"
      : input.kind === "documents"
        ? "documentsCursor"
        : input.kind === "document-activity"
          ? "documentActivityCursor"
          : "workItemsCursor";
  if (input.cursor) {
    params.set(cursorParam, input.cursor);
  }

  const path =
    input.moduleId === "dashboard"
      ? "/dashboard"
      : input.moduleId === "lynx"
        ? "/lynx"
        : `/${input.moduleId}`;
  const queryString = params.toString();

  return queryString ? `${path}?${queryString}` : path;
}

function buildWorkItemHref(input: {
  moduleId: ModuleId;
  workItemId: string;
}): `/${string}` {
  return `/${input.moduleId}/work-items/${encodeURIComponent(input.workItemId)}`;
}

function buildPaginationWithHref(input: {
  moduleId: ModuleId | "dashboard" | "lynx";
  kind: ModulePaginationKind;
  window?: ModuleListWindow;
  rowCount: number;
  query?: ModuleWorkspaceListQuery;
}) {
  const pagination = buildPagination(input.window, input.rowCount);
  const cursor =
    input.kind === "records"
      ? input.query?.recordsCursor
      : input.kind === "documents"
        ? input.query?.documentsCursor
        : input.kind === "document-activity"
          ? input.query?.documentActivityCursor
          : input.query?.workItemsCursor;
  const currentOffset = decodeWindowOffset(cursor);
  const pageSize = input.window?.pageSize ?? input.rowCount;
  const previousOffset = Math.max(0, currentOffset - Math.max(1, pageSize));

  return {
    ...pagination,
    ...(currentOffset > 0
      ? {
          prevCursor:
            previousOffset > 0 ? `offset:${previousOffset}` : undefined,
          prevHref: buildModuleListHref({
            moduleId: input.moduleId,
            kind: input.kind,
            query: input.query,
            cursor: previousOffset > 0 ? `offset:${previousOffset}` : undefined,
          }),
        }
      : {}),
    ...(pagination.hasNextPage && pagination.nextCursor
      ? {
          nextHref: buildModuleListHref({
            moduleId: input.moduleId,
            kind: input.kind,
            query: input.query,
            cursor: pagination.nextCursor,
          }),
        }
      : {}),
  };
}

function applyRecordToolbarState(input: {
  moduleId: ModuleId;
  toolbar?: ListSurfaceToolbar;
  query?: ModuleWorkspaceListQuery;
}): ListSurfaceToolbar | undefined {
  const toolbar = input.toolbar;
  if (!toolbar) {
    return undefined;
  }
  const recordTypes = getModuleRecordTypeDefinitions(input.moduleId);
  const recordTypeFilter =
    recordTypes.length > 0
      ? {
          id: "record-type",
          label: "Type",
          param: "recordsRecordType",
          value: input.query?.recordsRecordType,
          options: recordTypes.map((definition) => ({
            label: definition.title,
            value: definition.recordType,
          })),
        }
      : null;

  return {
    ...toolbar,
    filters: [
      ...(toolbar.filters ?? []).map((filter) => ({
        ...filter,
        value:
          filter.param === "recordsStatus"
            ? input.query?.recordsStatus
            : filter.value,
      })),
      ...(recordTypeFilter ? [recordTypeFilter] : []),
    ],
    sort: toolbar.sort
      ? {
          ...toolbar.sort,
          value: input.query?.recordsSort,
        }
      : undefined,
  };
}

function applyWorkItemToolbarState(
  query: ModuleWorkspaceListQuery | undefined,
): ListSurfaceToolbar {
  return {
    ...WORK_ITEM_TOOLBAR,
    filters: WORK_ITEM_TOOLBAR.filters.map((filter) => ({
      ...filter,
      value:
        filter.param === "workItemsStatus"
          ? query?.workItemsStatus
          : query?.workItemsPriority,
    })),
    sort: {
      ...WORK_ITEM_TOOLBAR.sort,
      value: query?.workItemsSort,
    },
  };
}

function resolveRecordRowTone(record: ModuleRecordRow) {
  if (record.status === "blocked") {
    return "critical" as const;
  }

  if (record.extensionValid === false || record.status === "draft") {
    return "attention" as const;
  }

  return "default" as const;
}

function resolveRecordDecisionLedger(record: ModuleRecordRow) {
  if (record.extensionValid !== false) {
    return undefined;
  }

  return {
    reason:
      record.extensionIssues && record.extensionIssues.length > 0
        ? record.extensionIssues.join("; ")
        : "Record extension metadata did not match the record type schema.",
    policyLabel: "Record type extension schema",
    riskTone: "attention" as const,
    nextActionLabel: "Review metadata",
  };
}

function resolveWorkItemRowTone(item: ModuleWorkItemRow) {
  if (item.priority === "high" || item.status === "escalated") {
    return "critical" as const;
  }

  if (item.status === "in-review" || item.priority === "medium") {
    return "attention" as const;
  }

  return "default" as const;
}

export function buildModuleRecordListSurface(input: {
  moduleId: ModuleId;
  records: readonly ModuleRecordRow[];
  window?: ModuleListWindow;
  query?: ModuleWorkspaceListQuery;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.records;
  const listDefinition = resolveModuleRecordListDefinition({
    moduleId: input.moduleId,
    records: input.records,
  });

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: listDefinition.defaultProfile,
    requiresErpPermission: {
      module: input.moduleId,
      object: "records",
      function: "read",
    },
    pagination: buildPaginationWithHref({
      moduleId: input.moduleId,
      kind: "records",
      window: input.window,
      rowCount: rows.length,
      query: input.query,
    }),
    presentation: {
      toolbar: applyRecordToolbarState({
        moduleId: input.moduleId,
        toolbar: listDefinition.toolbar,
        query: input.query,
      }),
    },
    surface: {
      header: { title: moduleScreenSections.tenantRecords.title },
      columnsId: `${input.moduleId}-records`,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: moduleScreenSections.tenantRecords.description,
      },
    },
    columns: [...listDefinition.columns],
    rows: rows.map((record) => {
      const decisionLedger = resolveRecordDecisionLedger(record);

      return {
        id: record.id,
        rowHref: resolveRecordTypeRowHref({
          moduleId: input.moduleId,
          recordType: record.recordType,
          recordId: record.id,
        }),
        linkColumnId: "reference",
        rowTone: resolveRecordRowTone(record),
        ...(decisionLedger ? { decisionLedger } : {}),
        trailingAction: {
          state: "ready" as const,
          descriptor:
            resolveRecordTypeTrailingAction({
              moduleId: input.moduleId,
              recordType: record.recordType,
            }) ?? undefined,
        },
        cellKinds:
          record.amountValue === null
            ? undefined
            : {
                amount: { kind: "currency", currency: record.currency },
              },
        cells: {
          reference: record.reference,
          title: record.title,
          recordType: record.recordType,
          status: record.status,
          owner: record.owner,
          amount: record.amountValue ?? record.amount,
          due: record.dueAt ?? record.due,
          metadataSummary: record.metadataSummary,
        },
      };
    }),
  });
}

export function buildModuleWorkItemListSurface(input: {
  moduleId: ModuleId;
  workItems: readonly ModuleWorkItemRow[];
  window?: ModuleListWindow;
  query?: ModuleWorkspaceListQuery;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.workItems;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    requiresErpPermission: {
      module: input.moduleId,
      object: "work-items",
      function: "read",
    },
    pagination: buildPaginationWithHref({
      moduleId: input.moduleId,
      kind: "work-items",
      window: input.window,
      rowCount: rows.length,
      query: input.query,
    }),
    presentation: {
      toolbar: applyWorkItemToolbarState(input.query),
    },
    surface: {
      header: { title: moduleScreenSections.workflowQueue.title },
      columnsId: `${input.moduleId}-work-items`,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: moduleScreenSections.workflowQueue.description,
      },
    },
    columns: [...MODULE_WORK_ITEM_COLUMNS],
    rows: rows.map((item) => ({
      id: item.id,
      rowHref: buildWorkItemHref({
        moduleId: input.moduleId,
        workItemId: item.id,
      }),
      linkColumnId: "subject",
      rowTone: resolveWorkItemRowTone(item),
      trailingAction: {
        state: "ready" as const,
        descriptor: {
          id: `${input.moduleId}.work-item.open`,
          label: "Open work item",
          intent: "default",
        },
      },
      cells: {
        subject: item.subject,
        owner: item.owner,
        status: item.status,
        priority: item.priority,
        due: item.dueAt,
      },
    })),
  });
}

export function getModuleListSurfaceKeys(moduleId: ModuleId) {
  return {
    records: moduleSurfaceKey(moduleId, "records"),
    workItems: moduleSurfaceKey(moduleId, "work-items"),
    savedViews: `${moduleId}.saved-views.list`,
    documents: `${moduleId}.documents.list`,
    documentActivity: `${moduleId}.documents.activity`,
  };
}

export function buildDashboardWorkflowListSurface(input: {
  workItems: readonly DashboardWorkItemRow[];
  window?: ModuleListWindow;
  query?: ModuleWorkspaceListQuery;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.workItems;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    requiresErpPermission: {
      module: "dashboard",
      object: "work-items",
      function: "read",
    },
    pagination: buildPaginationWithHref({
      moduleId: "dashboard",
      kind: "work-items",
      window: input.window,
      rowCount: rows.length,
      query: input.query,
    }),
    presentation: {
      toolbar: applyWorkItemToolbarState(input.query),
    },
    surface: {
      header: { title: dashboardRouteSections.priorityQueue.title },
      columnsId: "dashboard-workflow",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No active queue items",
      },
    },
    columns: [...DASHBOARD_WORKFLOW_COLUMNS],
    rows: rows.map((item) => ({
      id: item.id,
      rowHref: buildWorkItemHref({
        moduleId: item.moduleId,
        workItemId: item.id,
      }),
      linkColumnId: "subject",
      rowTone: resolveWorkItemRowTone(item),
      trailingAction: {
        state: "ready" as const,
        descriptor: {
          id: `${item.moduleId}.work-item.open`,
          label: "Open work item",
          intent: "default",
        },
      },
      cells: {
        subject: item.subject,
        moduleId: item.moduleId,
        owner: item.owner,
        status: item.status,
        due: item.dueAt,
      },
    })),
  });
}

export function buildDashboardAiUsageListSurface(input: {
  events: readonly AiUsageListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.events;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "dashboard",
      object: "ai-usage",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: {
        title: dashboardRouteSections.aiAssistant.aiUsageLedger.title,
      },
      columnsId: "dashboard-ai-usage",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: dashboardRouteSections.aiAssistant.aiUsageLedger.emptyRow[0],
      },
    },
    columns: [...DASHBOARD_AI_USAGE_COLUMNS],
    rows: rows.map((event) => ({
      id: event.id,
      cells: {
        feature: event.feature,
        model: event.model,
        status: event.status,
        totalTokens: event.totalTokens,
        latency: event.latency,
      },
    })),
  });
}

export function buildDashboardHardeningChecklistSurface(input: {
  items: readonly {
    area: string;
    status: string;
    detail: string;
  }[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.items;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "dashboard",
      object: "hardening-checklist",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: dashboardRouteSections.productionHardening.title },
      columnsId: "dashboard-hardening-checklist",
      rowKey: "area",
      empty: {
        variant: "muted",
        title: "No hardening checklist items are configured.",
      },
    },
    columns: [
      {
        id: "area",
        header: "Area",
        priority: "primary" as const,
        pin: "start" as const,
        wrap: true,
        minWidth: 160,
      },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge" as const },
      },
      { id: "detail", header: "Detail", wrap: true },
    ],
    rows: rows.map((item) => ({
      id: item.area,
      cells: {
        area: item.area,
        status: item.status,
        detail: item.detail,
      },
      rowTone:
        item.status === "review" ? ("attention" as const) : ("default" as const),
    })),
  });
}

export const dashboardHardeningChecklistSurfaceKey =
  "dashboard.hardening-checklist.list";

export function getDashboardListSurfaceKeys() {
  return {
    workflow: "dashboard.workflow.list",
    aiUsage: "dashboard.ai-usage.list",
    automations: "dashboard.automations.list",
    savedViews: "dashboard.saved-views.list",
    hardeningChecklist: dashboardHardeningChecklistSurfaceKey,
  };
}

// ─── Saved-views list ────────────────────────────────────────────────────────

type SavedViewRow = {
  id: string;
  name: string;
  description: string;
  visibility: string;
};

const SAVED_VIEWS_COLUMNS = [
  {
    id: "name",
    header: "View name",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 180,
  },
  { id: "description", header: "Description", wrap: true },
  { id: "visibility", header: "Visibility", cellKind: { kind: "badge" as const } },
];

export function buildSavedViewsListSurface(input: {
  views: readonly SavedViewRow[];
  moduleId: ModuleId | "dashboard";
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.views;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: input.moduleId === "dashboard" ? "dashboard" : input.moduleId,
      object: "saved-views",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: moduleScreenSections.savedViews.title },
      columnsId: `${input.moduleId}-saved-views`,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No saved views are configured for this route yet.",
      },
    },
    columns: [...SAVED_VIEWS_COLUMNS],
    rows: rows.map((view) => ({
      id: view.id,
      cells: {
        name: view.name,
        description: view.description,
        visibility: view.visibility,
      },
    })),
  });
}

// ─── Automation-run list ──────────────────────────────────────────────────────

type AutomationRunRow = {
  id: string;
  name: string;
  schedule: string;
  status: string;
  detail: string;
};

const AUTOMATION_RUN_COLUMNS = [
  {
    id: "name",
    header: "Automation",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 180,
  },
  { id: "schedule", header: "Schedule" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "detail", header: "Detail", wrap: true },
];

export function buildDashboardAutomationListSurface(input: {
  runs: readonly AutomationRunRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.runs;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "dashboard",
      object: "automations",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: dashboardRouteSections.automationTelemetry.scheduledAutomationsTitle },
      columnsId: "dashboard-automations",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No scheduled automations are active.",
      },
    },
    columns: [...AUTOMATION_RUN_COLUMNS],
    rows: rows.map((run) => ({
      id: run.id,
      cells: {
        name: run.name,
        schedule: run.schedule,
        status: run.status,
        detail: run.detail,
      },
    })),
  });
}

// ─── Document-registry list ───────────────────────────────────────────────────

const sensitiveDocumentClassifications = new Set([
  "confidential",
  "restricted",
  "highly-restricted",
  "regulated",
]);

function isSensitiveDocumentClassification(classification: string) {
  return sensitiveDocumentClassifications.has(classification);
}

function maskSensitiveDocumentLabel(
  value: string,
  canViewSensitive: boolean,
): string {
  if (canViewSensitive || !value.trim()) {
    return value;
  }

  return "Restricted document";
}

function formatDocumentGovernanceLabel(value: string): string {
  if (!value.trim()) {
    return value;
  }

  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function documentScanAllowsDownload(scanStatus: string): boolean {
  return scanStatus === "passed";
}

type DocumentRegistryRow = {
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

type DocumentQuarantineInboxRow = DocumentRegistryRow & {
  moduleId: ModuleId;
};

function mapDocumentRegistryRowCells(input: {
  doc: DocumentRegistryRow;
  moduleId: ModuleId;
  canViewSensitive: boolean;
  canWrite: boolean;
}) {
  const { doc, moduleId, canViewSensitive, canWrite } = input;
  const canExpose =
    canViewSensitive || !isSensitiveDocumentClassification(doc.classification);
  const title = maskSensitiveDocumentLabel(doc.title, canViewSensitive);
  const classification = canExpose
    ? formatDocumentGovernanceLabel(doc.classification)
    : maskSensitiveDocumentLabel(doc.classification, canViewSensitive);
  const scanStatus = canExpose
    ? formatDocumentGovernanceLabel(doc.scanStatus)
    : maskSensitiveDocumentLabel(doc.scanStatus, canViewSensitive);
  const retentionClass = canExpose
    ? formatDocumentGovernanceLabel(doc.retentionClass)
    : maskSensitiveDocumentLabel(doc.retentionClass, canViewSensitive);
  const access = canExpose
    ? formatDocumentGovernanceLabel(doc.access)
    : maskSensitiveDocumentLabel(doc.access, canViewSensitive);
  const canDownload = canExpose && documentScanAllowsDownload(doc.scanStatus);
  const onLegalHold = doc.retentionClass === "legal-hold";
  const scanQuarantined =
    doc.scanStatus === "failed" || doc.scanStatus === "quarantined";

  return {
    id: doc.id,
    cells: {
      title,
      contentType: doc.contentType,
      size: doc.size,
      classification,
      scanStatus,
      retentionClass,
      access,
      createdAt: doc.createdAt,
      download: canDownload ? "Download" : "—",
      retentionClassValue: doc.retentionClass,
      scanStatusValue: doc.scanStatus,
      moduleIdValue: moduleId,
    },
    trailingAction: canWrite
      ? resolveListSurfaceRowTrailingAction({
          visible: canExpose,
          allowed: true,
          descriptor: {
            id: "document-lifecycle",
            label: onLegalHold
              ? "Release hold"
              : scanQuarantined
                ? "Review scan"
                : "Manage",
            intent: "default",
          },
        })
      : resolveListSurfaceRowTrailingAction({
          visible: false,
          allowed: false,
        }),
    cellKinds: {
      classification: {
        kind: "badge" as const,
        tone: resolveDocumentClassificationTone(doc.classification),
      },
      scanStatus: {
        kind: "badge" as const,
        tone: resolveDocumentScanTone(doc.scanStatus),
      },
      retentionClass: {
        kind: "badge" as const,
        tone: resolveDocumentRetentionTone(doc.retentionClass),
      },
      access: {
        kind: "badge" as const,
        tone: doc.access === "public" ? ("positive" as const) : ("default" as const),
      },
      download: canDownload
        ? {
            kind: "link" as const,
            href: `/api/internal/v1/documents/${doc.id}/download?moduleId=${moduleId}`,
          }
        : { kind: "text" as const },
    },
  };
}

function resolveDocumentClassificationTone(classification: string) {
  if (
    classification === "highly-restricted" ||
    classification === "regulated"
  ) {
    return "critical" as const;
  }

  if (classification === "confidential" || classification === "restricted") {
    return "attention" as const;
  }

  return "default" as const;
}

function resolveDocumentScanTone(scanStatus: string) {
  if (scanStatus === "failed" || scanStatus === "quarantined") {
    return "critical" as const;
  }

  if (scanStatus === "pending" || scanStatus === "scanning") {
    return "attention" as const;
  }

  return "positive" as const;
}

function resolveDocumentRetentionTone(retentionClass: string) {
  if (retentionClass === "legal-hold") {
    return "critical" as const;
  }

  if (retentionClass === "short-term") {
    return "attention" as const;
  }

  return "default" as const;
}

const DOCUMENT_REGISTRY_COLUMNS = [
  {
    id: "title",
    header: "Document",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 180,
  },
  { id: "contentType", header: "Type" },
  { id: "size", header: "Size" },
  {
    id: "classification",
    header: "Classification",
    cellKind: { kind: "badge" as const },
  },
  {
    id: "scanStatus",
    header: "Scan",
    cellKind: { kind: "badge" as const, tone: "attention" as const },
  },
  {
    id: "retentionClass",
    header: "Retention",
    cellKind: { kind: "badge" as const },
  },
  {
    id: "access",
    header: "Access",
    cellKind: { kind: "badge" as const },
  },
  {
    id: "createdAt",
    header: "Uploaded",
    cellKind: { kind: "date" as const },
  },
  {
    id: "download",
    header: "Download",
    cellKind: { kind: "link" as const },
  },
];

export function buildDocumentRegistryListSurface(input: {
  documents: readonly DocumentRegistryRow[];
  moduleId: ModuleId;
  window?: ModuleListWindow;
  query?: ModuleWorkspaceListQuery;
  canViewSensitive?: boolean;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.documents;
  const canViewSensitive = input.canViewSensitive ?? false;
  const canWrite = input.canWrite ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: input.moduleId,
      object: "documents",
      function: "read",
    },
    pagination: buildPaginationWithHref({
      moduleId: input.moduleId,
      kind: "documents",
      window: input.window,
      rowCount: rows.length,
      query: input.query,
    }),
    surface: {
      header: { title: "Document registry" },
      columnsId: `${input.moduleId}-documents`,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: moduleScreenSections.documents.emptyState,
      },
    },
    columns: [...DOCUMENT_REGISTRY_COLUMNS],
    rows: rows.map((doc) =>
      mapDocumentRegistryRowCells({
        doc,
        moduleId: input.moduleId,
        canViewSensitive,
        canWrite,
      }),
    ),
  });
}

export function buildDocumentQuarantineInboxListSurface(input: {
  documents: readonly DocumentQuarantineInboxRow[];
  window?: ModuleListWindow;
  query?: ModuleWorkspaceListQuery;
  canViewSensitive?: boolean;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.documents;
  const canViewSensitive = input.canViewSensitive ?? false;
  const canWrite = input.canWrite ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-audit-ledger",
    requiresErpPermission: {
      module: "system-admin",
      object: "documents",
      function: "read",
    },
    pagination: buildPagination(input.window, rows.length),
    surface: {
      header: { title: "Quarantine inbox" },
      columnsId: "system-admin-documents-quarantine",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No quarantined documents.",
      },
    },
    columns: [...DOCUMENT_REGISTRY_COLUMNS],
    rows: rows.map((doc) =>
      mapDocumentRegistryRowCells({
        doc,
        moduleId: doc.moduleId,
        canViewSensitive,
        canWrite,
      }),
    ),
  });
}

type DocumentActivityLineRow = {
  id: string;
  summary: string;
  actorLabel: string;
  occurredAt: string;
  evidenceHref?: string;
  policyLabel?: string;
  riskTone?: "default" | "positive" | "attention" | "critical";
};

const DOCUMENT_ACTIVITY_COLUMNS = [
  {
    id: "summary",
    header: "Event",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 220,
  },
  { id: "actorLabel", header: "Actor" },
  { id: "occurredAt", header: "Occurred" },
];

/** Document audit / traceability lines — uses `document-lines` data nature. */
export function buildDocumentActivityLinesListSurface(input: {
  events: readonly DocumentActivityLineRow[];
  moduleId: ModuleId;
  window?: ModuleListWindow;
  query?: ModuleWorkspaceListQuery;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.events;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "document-lines",
    presentationProfile: "erp-audit-ledger",
    requiresErpPermission: {
      module: input.moduleId,
      object: "documents",
      function: "read",
    },
    pagination: buildPaginationWithHref({
      moduleId: input.moduleId,
      kind: "document-activity",
      window: input.window,
      rowCount: rows.length,
      query: input.query,
    }),
    surface: {
      header: { title: "Document activity" },
      columnsId: `${input.moduleId}-document-activity`,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No document activity recorded yet.",
      },
    },
    columns: [...DOCUMENT_ACTIVITY_COLUMNS],
    rows: rows.map((event) => ({
      id: event.id,
      cells: {
        summary: event.summary,
        actorLabel: event.actorLabel,
        occurredAt: event.occurredAt,
      },
      decisionLedger: {
        reason: event.summary,
        actorLabel: event.actorLabel,
        occurredAt: event.occurredAt,
        ...(event.evidenceHref ? { evidenceHref: event.evidenceHref } : {}),
        ...(event.policyLabel ? { policyLabel: event.policyLabel } : {}),
        ...(event.riskTone ? { riskTone: event.riskTone } : {}),
      },
    })),
  });
}
