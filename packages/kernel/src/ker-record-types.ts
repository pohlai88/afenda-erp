import type { ModuleId } from "@afenda/config/module-ids";
import type {
  ActionDescriptor,
  ErpPermissionRequirement,
  ListColumn,
  ListPresentationProfileId,
  ListSurfaceToolbar,
} from "./ker-governed-surface-contract";
import { z } from "zod";

export type RecordTypeSortDefinition = {
  readonly id: string;
  readonly label: string;
  readonly columnId: string;
  readonly direction: "asc" | "desc";
};

export type RecordTypeFilterDefinition = {
  readonly id: string;
  readonly label: string;
  readonly param: string;
  readonly options: readonly {
    readonly label: string;
    readonly value: string;
  }[];
};

export type RecordTypeRouteDefinition = {
  readonly list?: `/${string}`;
  readonly detail?: `/${string}`;
};

export type RecordTypeListDefinition = {
  readonly defaultProfile: ListPresentationProfileId;
  readonly columns: readonly ListColumn[];
  readonly defaultSort?: readonly RecordTypeSortDefinition[];
  readonly defaultFilters?: readonly RecordTypeFilterDefinition[];
  readonly toolbar?: ListSurfaceToolbar;
  readonly rowHrefTemplate?: `/${string}/records/:recordId`;
  readonly trailingAction?: ActionDescriptor;
};

export type RecordTypeDefinition = {
  readonly moduleId: ModuleId;
  readonly recordType: string;
  readonly title: string;
  readonly description: string;
  readonly route?: RecordTypeRouteDefinition;
  readonly list: RecordTypeListDefinition;
  readonly permissions: {
    readonly read: ErpPermissionRequirement;
    readonly create?: ErpPermissionRequirement;
    readonly update?: ErpPermissionRequirement;
    readonly delete?: ErpPermissionRequirement;
    readonly search?: ErpPermissionRequirement;
    readonly audit?: ErpPermissionRequirement;
  };
  readonly extensionSchema?: z.ZodType<unknown>;
};

export type RecordTypeExtensionParseResult =
  | {
      readonly success: true;
      readonly data: unknown;
    }
  | {
      readonly success: false;
      readonly issues: readonly string[];
    };

type RecordTypeLookupInput = {
  readonly moduleId: ModuleId;
  readonly recordType: string;
};

type RecordListColumnInput = {
  readonly moduleId: ModuleId;
  readonly records: readonly { readonly recordType: string }[];
};

const referenceColumn = {
  id: "reference",
  header: "Reference",
  priority: "primary",
  pin: "start",
} as const satisfies ListColumn;

const titleColumn = {
  id: "title",
  header: "Title",
  wrap: true,
  minWidth: 220,
} as const satisfies ListColumn;

const recordTypeColumn = {
  id: "recordType",
  header: "Type",
  cellKind: { kind: "badge" },
} as const satisfies ListColumn;

const statusColumn = {
  id: "status",
  header: "Status",
  cellKind: { kind: "badge", tone: "attention" },
} as const satisfies ListColumn;

const ownerColumn = {
  id: "owner",
  header: "Owner",
} as const satisfies ListColumn;

const amountColumn = {
  id: "amount",
  header: "Amount",
  cellKind: { kind: "currency", currency: "MYR" },
  align: "end",
} as const satisfies ListColumn;

const dueColumn = {
  id: "due",
  header: "Due",
  cellKind: { kind: "date" },
} as const satisfies ListColumn;

const metadataColumn = {
  id: "metadataSummary",
  header: "Metadata",
  wrap: true,
  minWidth: 180,
} as const satisfies ListColumn;

const recordStatusFilter = {
  id: "record-status",
  label: "Status",
  param: "recordsStatus",
  options: [
    { label: "Active", value: "active" },
    { label: "Blocked", value: "blocked" },
    { label: "Draft", value: "draft" },
    { label: "Ready", value: "ready" },
    { label: "Closed", value: "closed" },
  ],
} as const satisfies RecordTypeFilterDefinition;

const dueAscendingSort = {
  id: "due-asc",
  label: "Due soonest",
  columnId: "due",
  direction: "asc",
} as const satisfies RecordTypeSortDefinition;

const updatedDescendingSort = {
  id: "updated-desc",
  label: "Recently updated",
  columnId: "updatedAt",
  direction: "desc",
} as const satisfies RecordTypeSortDefinition;

const referenceAscendingSort = {
  id: "reference-asc",
  label: "Reference",
  columnId: "reference",
  direction: "asc",
} as const satisfies RecordTypeSortDefinition;

const defaultRecordToolbar = {
  filters: [
    {
      id: recordStatusFilter.id,
      label: recordStatusFilter.label,
      param: recordStatusFilter.param,
      options: [...recordStatusFilter.options],
    },
  ],
  sort: {
    label: "Sort",
    param: "recordsSort",
    options: [
      {
        label: dueAscendingSort.label,
        value: dueAscendingSort.id,
        columnId: dueAscendingSort.columnId,
        direction: dueAscendingSort.direction,
      },
      {
        label: updatedDescendingSort.label,
        value: updatedDescendingSort.id,
        columnId: updatedDescendingSort.columnId,
        direction: updatedDescendingSort.direction,
      },
      {
        label: referenceAscendingSort.label,
        value: referenceAscendingSort.id,
        columnId: referenceAscendingSort.columnId,
        direction: referenceAscendingSort.direction,
      },
    ],
  },
  resetParams: ["recordsCursor"],
  columnPicker: true,
} satisfies ListSurfaceToolbar;

const defaultExtensionSchema = z.record(z.string(), z.unknown());

const approvalRequestExtensionSchema = z
  .object({
    approvalRoute: z.string().trim().min(1),
    escalation: z.boolean().optional(),
  })
  .passthrough();

const closeControlExtensionSchema = z
  .object({
    risk: z.string().trim().min(1),
  })
  .passthrough();

const stockVarianceExtensionSchema = z
  .object({
    location: z.string().trim().min(1),
    varianceType: z.string().trim().min(1),
  })
  .passthrough();

export const fallbackModuleRecordColumns = [
  referenceColumn,
  titleColumn,
  recordTypeColumn,
  statusColumn,
  ownerColumn,
  amountColumn,
  dueColumn,
  metadataColumn,
] as const satisfies readonly ListColumn[];

const monetaryOperationalColumns = [
  referenceColumn,
  titleColumn,
  statusColumn,
  ownerColumn,
  amountColumn,
  dueColumn,
  metadataColumn,
] as const satisfies readonly ListColumn[];

const nonMonetaryOperationalColumns = [
  referenceColumn,
  titleColumn,
  statusColumn,
  ownerColumn,
  dueColumn,
  metadataColumn,
] as const satisfies readonly ListColumn[];

function readPermission(moduleId: ModuleId): ErpPermissionRequirement {
  return {
    module: moduleId,
    object: "records",
    function: "read",
  };
}

function searchPermission(moduleId: ModuleId): ErpPermissionRequirement {
  return {
    module: moduleId,
    object: "records",
    function: "search",
  };
}

function updatePermission(moduleId: ModuleId): ErpPermissionRequirement {
  return {
    module: moduleId,
    object: "records",
    function: "update",
  };
}

function defineRecordType(input: {
  readonly moduleId: ModuleId;
  readonly recordType: string;
  readonly title: string;
  readonly description: string;
  readonly columns: readonly ListColumn[];
  readonly defaultProfile?: ListPresentationProfileId;
  readonly defaultFilters?: readonly RecordTypeFilterDefinition[];
  readonly extensionSchema?: z.ZodType<unknown>;
}): RecordTypeDefinition {
  const detailRoute = `/${input.moduleId}/records/:recordId` as const;

  return {
    moduleId: input.moduleId,
    recordType: input.recordType,
    title: input.title,
    description: input.description,
    route: {
      list: `/${input.moduleId}`,
      detail: detailRoute,
    },
    list: {
      defaultProfile: input.defaultProfile ?? "erp-operational-table",
      columns: input.columns,
      defaultSort: [dueAscendingSort, updatedDescendingSort],
      defaultFilters: input.defaultFilters ?? [recordStatusFilter],
      toolbar: defaultRecordToolbar,
      rowHrefTemplate: detailRoute,
      trailingAction: {
        id: `${input.moduleId}.${input.recordType}.open`,
        label: "Open record",
        intent: "default",
      },
    },
    permissions: {
      read: readPermission(input.moduleId),
      search: searchPermission(input.moduleId),
      update: updatePermission(input.moduleId),
    },
    extensionSchema: input.extensionSchema ?? defaultExtensionSchema,
  };
}

export const recordTypeDefinitions = [
  defineRecordType({
    moduleId: "finance",
    recordType: "close-control",
    title: "Close control",
    description:
      "Period-close control records with amount exposure and due dates.",
    columns: monetaryOperationalColumns,
    extensionSchema: closeControlExtensionSchema,
  }),
  defineRecordType({
    moduleId: "sales",
    recordType: "sales-order",
    title: "Sales order",
    description:
      "Commercial order records that need value, owner, and status review.",
    columns: monetaryOperationalColumns,
  }),
  defineRecordType({
    moduleId: "purchasing",
    recordType: "purchase-order",
    title: "Purchase order",
    description:
      "Supplier and purchasing records with approval-sensitive value.",
    columns: monetaryOperationalColumns,
  }),
  defineRecordType({
    moduleId: "inventory",
    recordType: "stock-variance",
    title: "Stock variance",
    description:
      "Inventory variance records where location and exception metadata matter more than amount.",
    columns: nonMonetaryOperationalColumns,
    extensionSchema: stockVarianceExtensionSchema,
  }),
  defineRecordType({
    moduleId: "hr",
    recordType: "people-change",
    title: "People change",
    description:
      "People operations records with policy and sensitivity metadata.",
    columns: nonMonetaryOperationalColumns,
  }),
  defineRecordType({
    moduleId: "crm",
    recordType: "account-risk",
    title: "Account risk",
    description:
      "Customer account risk records with renewal or revenue exposure.",
    columns: monetaryOperationalColumns,
  }),
  defineRecordType({
    moduleId: "approvals",
    recordType: "approval-request",
    title: "Approval request",
    description:
      "Approval records that need amount, owner, due date, and status visibility.",
    columns: monetaryOperationalColumns,
    defaultProfile: "erp-exception-table",
    extensionSchema: approvalRequestExtensionSchema,
  }),
  defineRecordType({
    moduleId: "reports",
    recordType: "saved-report",
    title: "Saved report",
    description:
      "Report governance records focused on freshness and export metadata.",
    columns: nonMonetaryOperationalColumns,
  }),
  defineRecordType({
    moduleId: "system-admin",
    recordType: "governance-review",
    title: "Governance review",
    description:
      "Administrative governance records for role, access, and tenant review.",
    columns: nonMonetaryOperationalColumns,
  }),
] as const satisfies readonly RecordTypeDefinition[];

const recordTypeDefinitionsByKey = new Map(
  recordTypeDefinitions.map((definition) => [
    recordTypeDefinitionKey(definition),
    definition,
  ]),
);

function recordTypeDefinitionKey(input: RecordTypeLookupInput) {
  return `${input.moduleId}:${input.recordType}`;
}

export function getRecordTypeDefinition(input: RecordTypeLookupInput) {
  return recordTypeDefinitionsByKey.get(recordTypeDefinitionKey(input)) ?? null;
}

export function getModuleRecordTypeDefinitions(moduleId: ModuleId) {
  return recordTypeDefinitions.filter(
    (definition) => definition.moduleId === moduleId,
  );
}

function formatExtensionIssue(issue: z.ZodIssue) {
  return issue.path.length > 0
    ? `${issue.path.join(".")}: ${issue.message}`
    : issue.message;
}

export function parseRecordTypeExtension(input: {
  readonly moduleId: ModuleId;
  readonly recordType: string;
  readonly metadata: Record<string, unknown>;
}): RecordTypeExtensionParseResult {
  const definition = getRecordTypeDefinition(input);
  const schema = definition?.extensionSchema ?? defaultExtensionSchema;
  const parsed = schema.safeParse(input.metadata);

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
    };
  }

  return {
    success: false,
    issues: parsed.error.issues.map(formatExtensionIssue),
  };
}

export function resolveModuleRecordListDefinition(
  input: RecordListColumnInput,
): RecordTypeListDefinition {
  const recordTypes = new Set(input.records.map((record) => record.recordType));

  if (recordTypes.size === 1) {
    const recordType = recordTypes.values().next().value;
    if (recordType !== undefined) {
      const definition = getRecordTypeDefinition({
        moduleId: input.moduleId,
        recordType,
      });

      if (definition) {
        return definition.list;
      }
    }
  }

  if (recordTypes.size === 0) {
    const [definition] = getModuleRecordTypeDefinitions(input.moduleId);

    if (definition) {
      return definition.list;
    }
  }

  return {
    defaultProfile: "erp-operational-table",
    columns: fallbackModuleRecordColumns,
    defaultSort: [dueAscendingSort, updatedDescendingSort],
    defaultFilters: [recordStatusFilter],
    toolbar: defaultRecordToolbar,
  };
}

export function resolveRecordTypeRowHref(input: {
  readonly moduleId: ModuleId;
  readonly recordType: string;
  readonly recordId: string;
}) {
  const definition = getRecordTypeDefinition(input);
  const template =
    definition?.list.rowHrefTemplate ??
    (`/${input.moduleId}/records/:recordId` as const);

  return template.replace(
    ":recordId",
    encodeURIComponent(input.recordId),
  ) as `/${string}`;
}

export function resolveRecordTypeTrailingAction(input: {
  readonly moduleId: ModuleId;
  readonly recordType: string;
}) {
  const definition = getRecordTypeDefinition(input);
  return definition?.list.trailingAction ?? null;
}
