import type { ModuleId } from "@afenda/config/module-ids";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceToolbar,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ModuleWorkspaceListQuery } from "../shared/module-workspace-query";
import {
  getModuleRecordTypeDefinitions,
  resolveModuleRecordListDefinition,
  resolveRecordTypeRowHref,
  resolveRecordTypeTrailingAction,
} from "./record-types";
import {
  dashboardRouteSections,
  moduleScreenSections,
  solutionConsoleSections,
} from "../shell/route-copy-metadata";
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

type ModulePaginationKind = "records" | "work-items";

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

const SOLUTION_CONSOLE_EVIDENCE_COLUMNS = [
  {
    id: "module",
    header: "Module",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 180,
  },
  { id: "records", header: "Records" },
  { id: "workItems", header: "Work" },
  { id: "documents", header: "Documents" },
  { id: "source", header: "Source", cellKind: { kind: "badge" as const } },
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
} as const satisfies ListSurfaceToolbar;

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
  moduleId: ModuleId | "dashboard" | "solution-console";
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
    input.kind === "records" ? "recordsCursor" : "workItemsCursor";
  if (input.cursor) {
    params.set(cursorParam, input.cursor);
  }

  const path =
    input.moduleId === "dashboard"
      ? "/dashboard"
      : input.moduleId === "solution-console"
        ? "/solution-console"
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
  moduleId: ModuleId | "dashboard" | "solution-console";
  kind: ModulePaginationKind;
  window?: ModuleListWindow;
  rowCount: number;
  query?: ModuleWorkspaceListQuery;
}) {
  const pagination = buildPagination(input.window, input.rowCount);
  const cursor =
    input.kind === "records"
      ? input.query?.recordsCursor
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
    columns: MODULE_WORK_ITEM_COLUMNS,
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
    columns: DASHBOARD_WORKFLOW_COLUMNS,
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
    columns: DASHBOARD_AI_USAGE_COLUMNS,
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

export function getDashboardListSurfaceKeys() {
  return {
    workflow: "dashboard.workflow.list",
    aiUsage: "dashboard.ai-usage.list",
  };
}

type SolutionConsoleEvidenceRow = {
  moduleId: string;
  moduleLabel: string;
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  dataSource: string;
};

export function buildSolutionConsoleEvidenceListSurface(input: {
  rows: readonly SolutionConsoleEvidenceRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "solution-console",
      object: "evidence",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: solutionConsoleSections.evidenceCoverage.title },
      columnsId: "solution-console-evidence",
      rowKey: "moduleId",
      empty: {
        variant: "muted",
        title: "No recovery modules available",
      },
    },
    columns: SOLUTION_CONSOLE_EVIDENCE_COLUMNS,
    rows: rows.map((row) => ({
      id: row.moduleId,
      cells: {
        module: row.moduleLabel,
        records: String(row.recordCount),
        workItems: String(row.workItemCount),
        documents: String(row.documentCount),
        source: row.dataSource,
      },
    })),
  });
}

export function buildSolutionConsoleAiUsageListSurface(input: {
  events: readonly AiUsageListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.events;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "solution-console",
      object: "ai-usage",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: {
        title: solutionConsoleSections.aiUsageLedger.title,
      },
      columnsId: "solution-console-ai-usage",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: solutionConsoleSections.aiUsageLedger.emptyRow[0],
      },
    },
    columns: DASHBOARD_AI_USAGE_COLUMNS,
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

export function getSolutionConsoleListSurfaceKeys() {
  return {
    evidence: "solution-console.evidence.list",
    aiUsage: "solution-console.ai-usage.list",
  };
}
