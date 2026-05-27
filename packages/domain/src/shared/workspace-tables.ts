export const moduleRecordTableColumns = [
  "Reference",
  "Title",
  "Type",
  "Status",
  "Owner",
  "Amount",
  "Due",
  "Metadata",
] as const;

export const moduleWorkItemTableColumns = [
  "Work item",
  "Owner",
  "Status",
  "Priority",
  "Due",
] as const;

export const dashboardWorkflowTableColumns = [
  "Work item",
  "Module",
  "Owner",
  "Status",
  "Due",
] as const;

export const aiUsageTableColumns = [
  "Feature",
  "Model",
  "Status",
  "Tokens",
  "Latency",
] as const;

export const evidenceCoverageTableColumns = [
  "Module",
  "Records",
  "Work",
  "Documents",
  "Source",
] as const;

export type DataTableRow = {
  id: string;
  cells: readonly string[];
};

type ModuleRecordRowInput = {
  id: string;
  reference: string;
  title: string;
  recordType: string;
  status: string;
  owner: string;
  amount: string;
  due: string;
  metadataSummary: string;
};

type ModuleWorkItemRowInput = {
  id: string;
  subject: string;
  owner: string;
  status: string;
  priority: string;
  due: string;
};

type DashboardWorkItemRowInput = ModuleWorkItemRowInput & {
  moduleId: string;
};

export function serializeModuleRecordRow(
  record: ModuleRecordRowInput,
): DataTableRow {
  return {
    id: record.id,
    cells: [
      record.reference,
      record.title,
      record.recordType,
      record.status,
      record.owner,
      record.amount,
      record.due,
      record.metadataSummary,
    ],
  };
}

export function serializeModuleWorkItemRow(
  item: ModuleWorkItemRowInput,
): DataTableRow {
  return {
    id: item.id,
    cells: [item.subject, item.owner, item.status, item.priority, item.due],
  };
}

export function buildModuleRecordRows(
  moduleId: string,
  records: readonly ModuleRecordRowInput[],
): readonly DataTableRow[] {
  if (records.length > 0) {
    return records.map(serializeModuleRecordRow);
  }

  return [
    {
      id: `${moduleId}-empty-records`,
      cells: ["No records", "Seed core ERP data", "-", "-", "-", "-", "-", "-"],
    },
  ];
}

export function buildModuleWorkItemRows(
  moduleId: string,
  workItems: readonly ModuleWorkItemRowInput[],
): readonly DataTableRow[] {
  if (workItems.length > 0) {
    return workItems.map(serializeModuleWorkItemRow);
  }

  return [
    {
      id: `${moduleId}-empty-workflow`,
      cells: ["No active queue items", "System", "stable", "-", "-"],
    },
  ];
}

export function buildDashboardWorkflowRows(
  workItems: readonly DashboardWorkItemRowInput[],
): readonly DataTableRow[] {
  if (workItems.length > 0) {
    return workItems.map((item) => ({
      id: item.id,
      cells: [item.subject, item.moduleId, item.owner, item.status, item.due],
    }));
  }

  return [
    {
      id: "dashboard-empty-workflow",
      cells: ["No active queue items", "All modules", "System", "stable", "-"],
    },
  ];
}

export type ModuleDataMode = "persisted" | "metadata";

export function resolveWorkspaceDataMode(
  sessionSource: "dev" | "neon",
): ModuleDataMode {
  return sessionSource === "neon" ? "persisted" : "metadata";
}

export function describeWorkspaceDataSource(input: {
  dataMode: ModuleDataMode;
  fallbackApplied: boolean;
}) {
  if (input.dataMode === "persisted" && input.fallbackApplied) {
    return "Tenant database (metadata fallback)";
  }

  if (input.dataMode === "persisted") {
    return "Tenant database";
  }

  return "Module metadata";
}
