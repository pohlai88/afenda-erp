import { z } from "zod";

import {
  metadataUiActionContractSchema,
  metadataUiSafeNavigationHrefSchema,
} from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_LIST_SCHEMA_ID = "metadata-ui.schema.list" as const;
export const METADATA_UI_LIST_SCHEMA_VERSION = 1 as const;

export type MetadataUiListSchemaStability = "beta";

export const METADATA_UI_LIST_SCHEMA_STABILITY: MetadataUiListSchemaStability =
  "beta";

const METADATA_UI_LIST_COLUMN_ALIGN_VALUES = [
  "start",
  "center",
  "end",
] as const;

const METADATA_UI_LIST_COLUMN_FORMAT_VALUES = [
  "text",
  "number",
  "currency",
  "percentage",
  "date",
  "datetime",
  "boolean",
  "badge",
  "status",
  "custom",
] as const;

const METADATA_UI_LIST_SORT_DIRECTION_VALUES = ["asc", "desc"] as const;

const METADATA_UI_LIST_SELECTION_MODE_VALUES = [
  "none",
  "single",
  "multiple",
] as const;

const METADATA_UI_LIST_DENSITY_VALUES = [
  "comfortable",
  "compact",
  "dense",
] as const;

const METADATA_UI_LIST_COLUMN_PINNED_VALUES = ["start", "end"] as const;

const METADATA_UI_LIST_FILTER_OPERATOR_VALUES = [
  "equals",
  "not-equals",
  "contains",
  "starts-with",
  "ends-with",
  "greater-than",
  "greater-than-or-equal",
  "less-than",
  "less-than-or-equal",
  "between",
  "in",
  "not-in",
  "is-empty",
  "is-not-empty",
] as const;

const METADATA_UI_LIST_ROW_ACTION_PLACEMENT_VALUES = [
  "inline",
  "overflow",
] as const;

const METADATA_UI_LIST_TRAILING_CELL_KIND_VALUES = [
  "metadata",
  "action",
  "status",
  "document",
  "quarantine",
] as const;

const METADATA_UI_LIST_DEFAULT_PAGINATION = {
  enabled: true,
  pageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
};

const METADATA_UI_LIST_DEFAULT_VIRTUALIZATION = {
  enabled: false,
  rowEstimate: 48,
  overscan: 8,
  maxHeight: 640,
};

const METADATA_UI_LIST_DEFAULT_TOOLBAR = {
  enabled: false,
  showSearch: false,
  searchPlaceholder: "Search current window",
  showFilters: false,
  showSavedViews: false,
  savedViews: [],
  showSort: false,
  showDensity: false,
  showExport: false,
  resetLabel: "Reset",
};

export const METADATA_UI_LIST_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "List keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_LIST_COLUMN_ALIGN_SCHEMA = z.enum(
  METADATA_UI_LIST_COLUMN_ALIGN_VALUES,
);

export const METADATA_UI_LIST_COLUMN_FORMAT_SCHEMA = z.enum(
  METADATA_UI_LIST_COLUMN_FORMAT_VALUES,
);

export const METADATA_UI_LIST_SORT_DIRECTION_SCHEMA = z.enum(
  METADATA_UI_LIST_SORT_DIRECTION_VALUES,
);

export const METADATA_UI_LIST_SELECTION_MODE_SCHEMA = z.enum(
  METADATA_UI_LIST_SELECTION_MODE_VALUES,
);

export const METADATA_UI_LIST_DENSITY_SCHEMA = z.enum(
  METADATA_UI_LIST_DENSITY_VALUES,
);

export const METADATA_UI_LIST_COLUMN_SCHEMA = z.object({
  key: METADATA_UI_LIST_KEY_SCHEMA,

  label: z.string().min(1).max(120),

  description: z.string().min(1).max(240).optional(),

  field: z.string().min(1).max(160),

  format: METADATA_UI_LIST_COLUMN_FORMAT_SCHEMA.default("text"),

  align: METADATA_UI_LIST_COLUMN_ALIGN_SCHEMA.default("start"),

  sortable: z.boolean().default(false),

  filterable: z.boolean().default(false),

  hidden: z.boolean().default(false),

  pinned: z.enum(METADATA_UI_LIST_COLUMN_PINNED_VALUES).optional(),

  width: z
    .object({
      min: z.number().int().min(40).max(1000).optional(),
      ideal: z.number().int().min(40).max(1400).optional(),
      max: z.number().int().min(40).max(2000).optional(),
    })
    .optional(),

  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_LIST_FILTER_OPERATOR_SCHEMA = z.enum(
  METADATA_UI_LIST_FILTER_OPERATOR_VALUES,
);

export const METADATA_UI_LIST_FILTER_SCHEMA = z.object({
  key: METADATA_UI_LIST_KEY_SCHEMA,

  label: z.string().min(1).max(120),

  field: z.string().min(1).max(160),

  operator: METADATA_UI_LIST_FILTER_OPERATOR_SCHEMA,

  value: z.unknown().optional(),

  locked: z.boolean().default(false),

  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_LIST_SORT_SCHEMA = z.object({
  field: z.string().min(1).max(160),
  direction: METADATA_UI_LIST_SORT_DIRECTION_SCHEMA.default("asc"),
});

export const METADATA_UI_LIST_ROW_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,
  placement: z.enum(METADATA_UI_LIST_ROW_ACTION_PLACEMENT_VALUES).default("overflow"),
  stateField: z.string().min(1).max(160).optional(),
  disabledReasonField: z.string().min(1).max(160).optional(),
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_LIST_TRAILING_CELL_SCHEMA = z
  .object({
    key: METADATA_UI_LIST_KEY_SCHEMA,
    kind: z.enum(METADATA_UI_LIST_TRAILING_CELL_KIND_VALUES),
    label: z.string().min(1).max(120),
    field: z.string().min(1).max(160).optional(),
    action: metadataUiActionContractSchema.optional(),
    statusField: z.string().min(1).max(160).optional(),
    documentKeyField: z.string().min(1).max(160).optional(),
    stateField: z.string().min(1).max(160).optional(),
    disabledReasonField: z.string().min(1).max(160).optional(),
    hidden: z.boolean().default(false),
    disabledReason: z.string().min(1).max(240).optional(),
    permission: metadataUiPermissionContractSchema.optional(),
  })
  .strict()
  .superRefine((cell, ctx) => {
    if (cell.kind === "action" && !cell.action) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["action"],
        message: "Action trailing cells must declare an action contract.",
      });
    }

    if (cell.kind === "status" && !cell.statusField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["statusField"],
        message: "Status trailing cells must declare statusField.",
      });
    }

    if (cell.kind === "document" && !cell.documentKeyField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentKeyField"],
        message: "Document trailing cells must declare documentKeyField.",
      });
    }

    if (cell.kind === "quarantine" && !cell.field && !cell.disabledReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["field"],
        message:
          "Quarantine trailing cells must declare a field or disabledReason.",
      });
    }
  });

export const METADATA_UI_LIST_BULK_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,
  requiresSelection: z.boolean().default(true),
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_LIST_PAGINATION_SCHEMA = z.object({
  enabled: z.boolean().default(true),
  pageSize: z.number().int().min(5).max(200).default(25),
  pageSizeOptions: z.array(z.number().int().min(5).max(200)).max(8).default([
    10,
    25,
    50,
    100,
  ]),
});

export const METADATA_UI_LIST_VIRTUALIZATION_SCHEMA = z.object({
  enabled: z.boolean().default(false),
  rowEstimate: z.number().int().min(28).max(120).default(48),
  overscan: z.number().int().min(2).max(40).default(8),
  maxHeight: z.number().int().min(240).max(1200).default(640),
});

export const METADATA_UI_LIST_SAVED_VIEW_SCHEMA = z.object({
  key: METADATA_UI_LIST_KEY_SCHEMA,
  label: z.string().min(1).max(120),
  href: metadataUiSafeNavigationHrefSchema.optional(),
  active: z.boolean().default(false),
});

export const METADATA_UI_LIST_TOOLBAR_SCHEMA = z.object({
  enabled: z.boolean().default(false),
  showSearch: z.boolean().default(false),
  searchPlaceholder: z.string().min(1).max(120).default("Search current window"),
  showFilters: z.boolean().default(false),
  showSavedViews: z.boolean().default(false),
  savedViews: z.array(METADATA_UI_LIST_SAVED_VIEW_SCHEMA).max(12).default([]),
  showSort: z.boolean().default(false),
  showDensity: z.boolean().default(false),
  showExport: z.boolean().default(false),
  exportAction: metadataUiActionContractSchema.optional(),
  resetLabel: z.string().min(1).max(80).default("Reset"),
});

export const METADATA_UI_LIST_SCHEMA = z.object({
  schemaId: z.literal(METADATA_UI_LIST_SCHEMA_ID).default(
    METADATA_UI_LIST_SCHEMA_ID,
  ),

  schemaVersion: z.literal(METADATA_UI_LIST_SCHEMA_VERSION).default(
    METADATA_UI_LIST_SCHEMA_VERSION,
  ),

  stability: z
    .literal(METADATA_UI_LIST_SCHEMA_STABILITY)
    .default(METADATA_UI_LIST_SCHEMA_STABILITY),

  key: METADATA_UI_LIST_KEY_SCHEMA,

  title: z.string().min(1).max(120).optional(),

  description: z.string().min(1).max(320).optional(),

  rowKey: z.string().min(1).max(160).default("id"),

  density: METADATA_UI_LIST_DENSITY_SCHEMA.default("comfortable"),

  selectionMode: METADATA_UI_LIST_SELECTION_MODE_SCHEMA.default("none"),

  selectableField: z.string().min(1).max(160).optional(),

  selectionDisabledReasonField: z.string().min(1).max(160).optional(),

  columns: z.array(METADATA_UI_LIST_COLUMN_SCHEMA).min(1).max(64),

  filters: z.array(METADATA_UI_LIST_FILTER_SCHEMA).max(24).default([]),

  defaultSort: z.array(METADATA_UI_LIST_SORT_SCHEMA).max(4).default([]),

  rowActions: z.array(METADATA_UI_LIST_ROW_ACTION_SCHEMA).max(12).default([]),

  trailingCells: z
    .array(METADATA_UI_LIST_TRAILING_CELL_SCHEMA)
    .max(8)
    .default([]),

  bulkActions: z.array(METADATA_UI_LIST_BULK_ACTION_SCHEMA).max(12).default([]),

  pagination: METADATA_UI_LIST_PAGINATION_SCHEMA.default(
    METADATA_UI_LIST_DEFAULT_PAGINATION,
  ),

  virtualization: METADATA_UI_LIST_VIRTUALIZATION_SCHEMA.default(
    METADATA_UI_LIST_DEFAULT_VIRTUALIZATION,
  ),

  toolbar: METADATA_UI_LIST_TOOLBAR_SCHEMA.default(
    METADATA_UI_LIST_DEFAULT_TOOLBAR,
  ),

  emptyStateKey: METADATA_UI_LIST_KEY_SCHEMA.optional(),

  presentation: metadataUiPresentationContractSchema.optional(),

  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      componentKey: z.string().min(1).max(160).optional(),
      sectionKey: z.string().min(1).max(160).optional(),
      rendererKey: z.string().min(1).max(160).optional(),
      testId: z.string().min(1).max(160).optional(),
    })
    .optional(),
});

type MetadataUiListSchemaOutput = z.output<typeof METADATA_UI_LIST_SCHEMA>;

type MetadataUiListColumnSchemaOutput = z.output<
  typeof METADATA_UI_LIST_COLUMN_SCHEMA
>;

type MetadataUiListFilterSchemaOutput = z.output<
  typeof METADATA_UI_LIST_FILTER_SCHEMA
>;

type MetadataUiListSortSchemaOutput = z.output<
  typeof METADATA_UI_LIST_SORT_SCHEMA
>;

type MetadataUiListRowActionSchemaOutput = z.output<
  typeof METADATA_UI_LIST_ROW_ACTION_SCHEMA
>;

type MetadataUiListTrailingCellSchemaOutput = z.output<
  typeof METADATA_UI_LIST_TRAILING_CELL_SCHEMA
>;

type MetadataUiListBulkActionSchemaOutput = z.output<
  typeof METADATA_UI_LIST_BULK_ACTION_SCHEMA
>;

type MetadataUiListPaginationSchemaOutput = z.output<
  typeof METADATA_UI_LIST_PAGINATION_SCHEMA
>;

type MetadataUiListVirtualizationSchemaOutput = z.output<
  typeof METADATA_UI_LIST_VIRTUALIZATION_SCHEMA
>;

type MetadataUiListToolbarSchemaOutput = z.output<
  typeof METADATA_UI_LIST_TOOLBAR_SCHEMA
>;

type MetadataUiListSavedViewSchemaOutput = z.output<
  typeof METADATA_UI_LIST_SAVED_VIEW_SCHEMA
>;

type MetadataUiListDiagnosticsSchemaOutput = NonNullable<
  MetadataUiListSchemaOutput["diagnostics"]
>;

export type MetadataUiListInput = z.input<typeof METADATA_UI_LIST_SCHEMA>;

export type MetadataUiListColumnInput = z.input<
  typeof METADATA_UI_LIST_COLUMN_SCHEMA
>;

export type MetadataUiListFilterInput = z.input<
  typeof METADATA_UI_LIST_FILTER_SCHEMA
>;

export type MetadataUiListSortInput = z.input<
  typeof METADATA_UI_LIST_SORT_SCHEMA
>;

export type MetadataUiListRowActionInput = z.input<
  typeof METADATA_UI_LIST_ROW_ACTION_SCHEMA
>;

export type MetadataUiListTrailingCellInput = z.input<
  typeof METADATA_UI_LIST_TRAILING_CELL_SCHEMA
>;

export type MetadataUiListBulkActionInput = z.input<
  typeof METADATA_UI_LIST_BULK_ACTION_SCHEMA
>;

export type MetadataUiListToolbarInput = z.input<
  typeof METADATA_UI_LIST_TOOLBAR_SCHEMA
>;

export type MetadataUiListColumnAlign =
  (typeof METADATA_UI_LIST_COLUMN_ALIGN_VALUES)[number];

export type MetadataUiListColumnFormat =
  (typeof METADATA_UI_LIST_COLUMN_FORMAT_VALUES)[number];

export type MetadataUiListSortDirection =
  (typeof METADATA_UI_LIST_SORT_DIRECTION_VALUES)[number];

export type MetadataUiListSelectionMode =
  (typeof METADATA_UI_LIST_SELECTION_MODE_VALUES)[number];

export type MetadataUiListDensity =
  (typeof METADATA_UI_LIST_DENSITY_VALUES)[number];

export type MetadataUiListColumnPinned =
  (typeof METADATA_UI_LIST_COLUMN_PINNED_VALUES)[number];

export type MetadataUiListFilterOperator =
  (typeof METADATA_UI_LIST_FILTER_OPERATOR_VALUES)[number];

export type MetadataUiListRowActionPlacement =
  (typeof METADATA_UI_LIST_ROW_ACTION_PLACEMENT_VALUES)[number];

export type MetadataUiListTrailingCellKind =
  (typeof METADATA_UI_LIST_TRAILING_CELL_KIND_VALUES)[number];

declare const metadataUiListKeyBrand: unique symbol;
declare const metadataUiListFieldKeyBrand: unique symbol;
declare const metadataUiListDiagnosticKeyBrand: unique symbol;
declare const metadataUiListBoundedColumnsBrand: unique symbol;
declare const metadataUiListBoundedFiltersBrand: unique symbol;
declare const metadataUiListBoundedSortsBrand: unique symbol;
declare const metadataUiListBoundedActionsBrand: unique symbol;

type MetadataUiListTupleBetween<
  Value,
  Min extends number,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator["length"] extends Min
    ? Accumulator | MetadataUiListTupleBetween<Value, Min, Max, [...Accumulator, Value]>
    : MetadataUiListTupleBetween<Value, Min, Max, [...Accumulator, Value]>;

type MetadataUiListTupleUpTo<
  Value,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator | MetadataUiListTupleUpTo<Value, Max, [...Accumulator, Value]>;

export type MetadataUiListKey = string & {
  readonly [metadataUiListKeyBrand]: true;
};

export type MetadataUiListKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiListKey;

export type MetadataUiListFieldKey = string & {
  readonly [metadataUiListFieldKeyBrand]: true;
};

export type MetadataUiListDiagnosticKey = string & {
  readonly [metadataUiListDiagnosticKeyBrand]: true;
};

export type MetadataUiListColumnForFormat<
  Format extends MetadataUiListColumnFormat,
> = Omit<
  MetadataUiListColumnSchemaOutput,
  "field" | "format" | "key" | "permission"
> & {
  key: MetadataUiListKey;
  field: MetadataUiListFieldKey;
  format: Format;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiListColumn = {
  [Format in MetadataUiListColumnFormat]: MetadataUiListColumnForFormat<Format>;
}[MetadataUiListColumnFormat];

export type MetadataUiListColumnsByFormat<
  Columns extends readonly MetadataUiListColumn[],
> = {
  [Format in MetadataUiListColumnFormat]: Extract<
    Columns[number],
    { format: Format }
  >[];
};

export type MetadataUiListFilterForOperator<
  Operator extends MetadataUiListFilterOperator,
> = Omit<
  MetadataUiListFilterSchemaOutput,
  "field" | "key" | "operator" | "permission"
> & {
  key: MetadataUiListKey;
  field: MetadataUiListFieldKey;
  operator: Operator;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiListFilter = {
  [Operator in MetadataUiListFilterOperator]: MetadataUiListFilterForOperator<Operator>;
}[MetadataUiListFilterOperator];

export type MetadataUiListFiltersByOperator<
  Filters extends readonly MetadataUiListFilter[],
> = {
  [Operator in MetadataUiListFilterOperator]: Extract<
    Filters[number],
    { operator: Operator }
  >[];
};

export type MetadataUiListSort = Omit<
  MetadataUiListSortSchemaOutput,
  "field"
> & {
  field: MetadataUiListFieldKey;
};

export type MetadataUiListRowActionForPlacement<
  Placement extends MetadataUiListRowActionPlacement,
> = Omit<
  MetadataUiListRowActionSchemaOutput,
  "action" | "disabledReasonField" | "permission" | "placement" | "stateField"
> & {
  action: MetadataUiActionContract;
  placement: Placement;
  stateField?: MetadataUiListFieldKey;
  disabledReasonField?: MetadataUiListFieldKey;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiListRowAction = {
  [Placement in MetadataUiListRowActionPlacement]: MetadataUiListRowActionForPlacement<Placement>;
}[MetadataUiListRowActionPlacement];

export type MetadataUiListTrailingCellForKind<
  Kind extends MetadataUiListTrailingCellKind,
> = Omit<
  MetadataUiListTrailingCellSchemaOutput,
  | "action"
  | "disabledReasonField"
  | "documentKeyField"
  | "field"
  | "key"
  | "kind"
  | "permission"
  | "stateField"
  | "statusField"
> & {
  key: MetadataUiListKey;
  kind: Kind;
  stateField?: MetadataUiListFieldKey;
  disabledReasonField?: MetadataUiListFieldKey;
  permission?: MetadataUiPermissionContract;
} & (Kind extends "action"
    ? {
        action: MetadataUiActionContract;
        field?: MetadataUiListFieldKey;
        statusField?: never;
        documentKeyField?: never;
      }
    : Kind extends "status"
      ? {
          statusField: MetadataUiListFieldKey;
          field?: MetadataUiListFieldKey;
          action?: never;
          documentKeyField?: never;
        }
      : Kind extends "document"
        ? {
            documentKeyField: MetadataUiListFieldKey;
            field?: MetadataUiListFieldKey;
            action?: never;
            statusField?: never;
          }
        : Kind extends "quarantine"
          ? {
              field?: MetadataUiListFieldKey;
              disabledReason?: string;
              action?: never;
              statusField?: never;
              documentKeyField?: never;
            }
          : {
              field: MetadataUiListFieldKey;
              action?: never;
              statusField?: never;
              documentKeyField?: never;
            });

export type MetadataUiListTrailingCell = {
  [Kind in MetadataUiListTrailingCellKind]: MetadataUiListTrailingCellForKind<Kind>;
}[MetadataUiListTrailingCellKind];

export type MetadataUiListBulkAction = Omit<
  MetadataUiListBulkActionSchemaOutput,
  "action" | "permission"
> & {
  action: MetadataUiActionContract;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiListBoundedColumns =
  MetadataUiListTupleBetween<MetadataUiListColumn, 1, 64> & {
    readonly [metadataUiListBoundedColumnsBrand]: true;
  };

export type MetadataUiListBoundedFilters =
  MetadataUiListTupleUpTo<MetadataUiListFilter, 24> & {
    readonly [metadataUiListBoundedFiltersBrand]: true;
  };

export type MetadataUiListBoundedSorts =
  MetadataUiListTupleUpTo<MetadataUiListSort, 4> & {
    readonly [metadataUiListBoundedSortsBrand]: true;
  };

export type MetadataUiListBoundedRowActions =
  MetadataUiListTupleUpTo<MetadataUiListRowAction, 12> & {
    readonly [metadataUiListBoundedActionsBrand]: true;
  };

export type MetadataUiListBoundedTrailingCells =
  MetadataUiListTupleUpTo<MetadataUiListTrailingCell, 8> & {
    readonly [metadataUiListBoundedActionsBrand]: true;
  };

export type MetadataUiListBoundedBulkActions =
  MetadataUiListTupleUpTo<MetadataUiListBulkAction, 12> & {
    readonly [metadataUiListBoundedActionsBrand]: true;
  };

export type MetadataUiListPagination = MetadataUiListPaginationSchemaOutput;

export type MetadataUiListVirtualization =
  MetadataUiListVirtualizationSchemaOutput;

export type MetadataUiListSavedView = MetadataUiListSavedViewSchemaOutput;

export type MetadataUiListToolbar = MetadataUiListToolbarSchemaOutput;

export type MetadataUiListDiagnostics = Omit<
  MetadataUiListDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiListDiagnosticKey;
  sectionKey?: MetadataUiListDiagnosticKey;
  rendererKey?: MetadataUiListDiagnosticKey;
  testId?: MetadataUiListDiagnosticKey;
};

export type MetadataUiList = Omit<
  MetadataUiListSchemaOutput,
  | "bulkActions"
  | "columns"
  | "defaultSort"
  | "diagnostics"
  | "emptyStateKey"
  | "filters"
  | "key"
  | "permission"
  | "presentation"
  | "rowActions"
  | "rowKey"
  | "selectableField"
  | "selectionDisabledReasonField"
  | "trailingCells"
> & {
  key: MetadataUiListKey;
  rowKey: MetadataUiListFieldKey;
  selectableField?: MetadataUiListFieldKey;
  selectionDisabledReasonField?: MetadataUiListFieldKey;
  columns: MetadataUiListBoundedColumns;
  filters: MetadataUiListBoundedFilters;
  defaultSort: MetadataUiListBoundedSorts;
  rowActions: MetadataUiListBoundedRowActions;
  trailingCells: MetadataUiListBoundedTrailingCells;
  bulkActions: MetadataUiListBoundedBulkActions;
  emptyStateKey?: MetadataUiListKey;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiListDiagnostics;
};

export type MetadataUiListForSelectionMode<
  SelectionMode extends MetadataUiListSelectionMode,
> = MetadataUiList & {
  selectionMode: SelectionMode;
};

export type MetadataUiListForDensity<Density extends MetadataUiListDensity> =
  MetadataUiList & {
    density: Density;
  };

export type MetadataUiListParseResult =
  | {
      success: true;
      data: MetadataUiList;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiListInvariants(
  list: MetadataUiListSchemaOutput,
): asserts list is MetadataUiListSchemaOutput & MetadataUiList {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(list.key)) {
    throw new Error("List keys must use lowercase kebab/dot notation.");
  }

  if (list.columns.length < 1 || list.columns.length > 64) {
    throw new Error("Lists must declare between one and sixty-four columns.");
  }

  if (list.filters.length > 24) {
    throw new Error("Lists may declare at most twenty-four filters.");
  }
}

export function parseMetadataUiList(input: unknown): MetadataUiList {
  const list = METADATA_UI_LIST_SCHEMA.parse(input);
  assertMetadataUiListInvariants(list);
  return list;
}

export function safeParseMetadataUiList(
  input: unknown,
): MetadataUiListParseResult {
  const result = METADATA_UI_LIST_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiListInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
