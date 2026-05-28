import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";

const MACHINE_LAYER_APPROVE_REQUIRED_REASON =
  "Requires system-admin.machine-layer.approve.";

function formatAiFeatureLabel(feature: string) {
  return feature
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type AiApprovalProposalListRow = {
  id: string;
  moduleId: string;
  proposedAction: string;
  rationale: string;
  riskLevel: string;
  status: string;
  created: string;
};

type AiUsageListRow = {
  id: string;
  feature: string;
  model: string;
  status: string;
  totalTokens: string;
  latency: string;
};

type AiActionSandboxListRow = {
  id: string;
  title: string;
  moduleId: string;
  actionType: string;
  riskLevel: string;
  status: string;
  proposedBy: string;
  created: string;
};

type AiFeatureEntitlementListRow = {
  id: string;
  feature: string;
  enabled: string;
  updated: string;
  updatedByAuthUserId: string;
};

const AI_USAGE_COLUMNS = [
  { id: "feature", header: "Feature", priority: "primary" as const, pin: "start" as const },
  { id: "model", header: "Model" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "totalTokens", header: "Tokens" },
  { id: "latency", header: "Latency" },
];

const AI_APPROVALS_COLUMNS = [
  {
    id: "proposedAction",
    header: "Action",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "moduleId", header: "Module" },
  { id: "riskLevel", header: "Risk", cellKind: { kind: "badge" as const } },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "created", header: "Created" },
];

const AI_SANDBOXES_COLUMNS = [
  {
    id: "title",
    header: "Action",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "moduleId", header: "Module" },
  { id: "actionType", header: "Type" },
  { id: "riskLevel", header: "Risk", cellKind: { kind: "badge" as const } },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "proposedBy", header: "Proposed by" },
  { id: "created", header: "Created" },
];

const AI_ENTITLEMENTS_COLUMNS = [
  {
    id: "feature",
    header: "Feature",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "enabled", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "updated", header: "Updated" },
  { id: "updatedByAuthUserId", header: "Updated by" },
];

function buildPagination(pageSize: number | undefined, total: number) {
  const size = pageSize ?? total;
  return {
    pageSize: Math.max(1, size),
    totalCount: total,
    hasNextPage: false,

  };
}

export const systemAdminAiUsageSurfaceKey =
  "system-admin.machine-usage.list";
export const systemAdminAiApprovalsSurfaceKey =
  "system-admin.machine-approvals.list";
export const systemAdminAiSandboxesSurfaceKey =
  "system-admin.machine-sandboxes.list";
export const systemAdminAiEntitlementsSurfaceKey =
  "system-admin.machine-entitlements.list";

function machineToolbar(input: {
  scope: string;
  searchPlaceholder: string;
  sortColumn: string;
  statusParam?: string;
  statusOptions?: Array<{ label: string; value: string }>;
}) {
  return {
    search: {
      param: `${input.scope}Q`,
      label: "Search",
      placeholder: input.searchPlaceholder,
    },
    filters: input.statusParam
      ? [
          {
            id: "status",
            label: "Status",
            param: input.statusParam,
            options: input.statusOptions ?? [
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
              { label: "Executed", value: "executed" },
              { label: "Failed", value: "failed" },
            ],
          },
        ]
      : undefined,
    sort: {
      label: "Sort",
      param: `${input.scope}Sort`,
      options: [
        {
          label: "Ascending",
          value: "asc",
          columnId: input.sortColumn,
          direction: "asc" as const,
        },
        {
          label: "Descending",
          value: "desc",
          columnId: input.sortColumn,
          direction: "desc" as const,
        },
      ],
    },
    densityToggle: true,
    columnPicker: true,
    resetParams: [
      `${input.scope}Q`,
      `${input.scope}Sort`,
      ...(input.statusParam ? [input.statusParam] : []),
    ],
  };
}

export function buildSystemAdminAiUsageListSurface(input: {
  events: readonly AiUsageListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.events;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: machineToolbar({
        scope: "machineUsage",
        searchPlaceholder: "Search machine usage",
        sortColumn: "feature",
        statusParam: "machineUsageStatus",
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "machine-usage",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: "Machine usage ledger" },
      columnsId: "system-admin-machine-usage",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No machine usage events recorded yet.",
      },
    },
    columns: AI_USAGE_COLUMNS,
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

export function buildSystemAdminAiApprovalsListSurface(input: {
  proposals: readonly AiApprovalProposalListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.proposals;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: machineToolbar({
        scope: "machineApprovals",
        searchPlaceholder: "Search machine approvals",
        sortColumn: "proposedAction",
        statusParam: "machineApprovalsStatus",
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "machine-approvals",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: "Machine approval proposals" },
      columnsId: "system-admin-machine-approvals",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No machine approval proposals recorded yet.",
      },
    },
    columns: AI_APPROVALS_COLUMNS,
    rows: rows.map((proposal) => ({
      id: proposal.id,
      cells: {
        proposedAction: proposal.proposedAction,
        moduleId: proposal.moduleId,
        riskLevel: proposal.riskLevel,
        status: proposal.status,
        created: proposal.created,
      },
      rowTone:
        proposal.riskLevel === "high"
          ? ("attention" as const)
          : ("default" as const),
    })),
  });
}

export function buildSystemAdminAiSandboxesListSurface(input: {
  sandboxes: readonly AiActionSandboxListRow[];
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.sandboxes;
  const canMutate = input.canMutate ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: machineToolbar({
        scope: "machineSandboxes",
        searchPlaceholder: "Search Lynx action sandboxes",
        sortColumn: "created",
        statusParam: "machineSandboxesStatus",
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "machine-sandboxes",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: "Lynx action sandboxes" },
      columnsId: "system-admin-machine-sandboxes",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No Lynx action sandboxes recorded yet.",
      },
    },
    columns: AI_SANDBOXES_COLUMNS,
    rows: rows.map((sandbox) => ({
      id: sandbox.id,
      cells: {
        title: sandbox.title,
        moduleId: sandbox.moduleId,
        actionType: sandbox.actionType,
        riskLevel: sandbox.riskLevel,
        status: sandbox.status,
        proposedBy: sandbox.proposedBy,
        created: sandbox.created,
      },
      rowTone:
        sandbox.riskLevel === "high"
          ? ("attention" as const)
          : ("default" as const),
      trailingAction:
        sandbox.status === "pending"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: canMutate,
              disabledReason: MACHINE_LAYER_APPROVE_REQUIRED_REASON,
              descriptor: {
                id: "system-admin.machine-sandbox.review",
                label: "Review sandbox",
                intent: "default",
              },
            })
          : listSurfaceRowTrailingActionHidden(),
    })),
  });
}

export function buildSystemAdminAiEntitlementsListSurface(input: {
  entitlements: readonly AiFeatureEntitlementListRow[];
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.entitlements;
  const canMutate = input.canMutate ?? false;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: machineToolbar({
        scope: "machineEntitlements",
        searchPlaceholder: "Search machine feature entitlements",
        sortColumn: "feature",
        statusParam: "machineEntitlementsStatus",
        statusOptions: [
          { label: "Enabled", value: "enabled" },
          { label: "Disabled", value: "disabled" },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "machine-entitlements",
      function: "read",
    },
    pagination: buildPagination(undefined, rows.length),
    surface: {
      header: { title: "Machine feature entitlements" },
      columnsId: "system-admin-machine-entitlements",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No machine feature entitlement rows found.",
      },
    },
    columns: AI_ENTITLEMENTS_COLUMNS,
    rows: rows.map((entitlement) => ({
      id: entitlement.id,
      cells: {
        feature: formatAiFeatureLabel(entitlement.feature),
        enabled: entitlement.enabled,
        updated: entitlement.updated || "-",
        updatedByAuthUserId: entitlement.updatedByAuthUserId,
      },
      rowTone:
        entitlement.enabled === "disabled"
          ? ("attention" as const)
          : ("default" as const),
      trailingAction: resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: canMutate,
        disabledReason: MACHINE_LAYER_APPROVE_REQUIRED_REASON,
        descriptor: {
          id: `system-admin.machine-entitlement.${entitlement.feature}`,
          label:
            entitlement.enabled === "enabled"
              ? "Disable feature"
              : "Enable feature",
          intent: "default",
        },
      }),
    })),
  });
}
