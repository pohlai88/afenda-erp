import "server-only";

import {
  createContainsFilter,
  createList,
  createListBulkAction,
  createListRowAction,
  createListToolbar,
  createNumberColumn,
  createStatusColumn,
  createTextColumn,
  type MetadataUiActionContractInput,
} from "@afenda/metadata-ui";

import { METADATA_UI_ADVANCED_TABLE_LAB_ROWS } from "./advanced-seed.fixture";
import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

const inspectTableRowAction = {
  id: "metadata-ui.playground.advanced.table.action.inspect-row",
  label: "Inspect",
  description: "Inspect the static table-lab row.",
  intent: "open",
  tone: "neutral",
  risk: "low",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.advanced.table.event.inspect-row",
  },
} as const satisfies MetadataUiActionContractInput;

const reviewSelectedRowsAction = {
  id: "metadata-ui.playground.advanced.table.action.review-selected",
  label: "Review selected",
  description: "Preview a bulk review action without executing a write.",
  intent: "approve",
  tone: "neutral",
  risk: "low",
  visibility: "disabled",
  disabledReason: "Bulk actions are inert in this playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.advanced.table.event.review-selected",
  },
} as const satisfies MetadataUiActionContractInput;

const exportWindowAction = {
  id: "metadata-ui.playground.advanced.table.action.export-window",
  label: "Export current window",
  description: "Preview export affordance without producing a file.",
  intent: "export",
  tone: "neutral",
  risk: "low",
  visibility: "disabled",
  disabledReason: "Exports are disabled in the static playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.advanced.table.event.export-window",
  },
} as const satisfies MetadataUiActionContractInput;

export const METADATA_UI_ADVANCED_TABLE_LAB_RENDER_ROWS =
  METADATA_UI_ADVANCED_TABLE_LAB_ROWS.map((row) => ({
    id: row.id,
    recordLabel: row.recordLabel,
    queueLabel: row.queueLabel,
    status: row.status,
    sortBucket: row.sortBucket,
    filterTagsLabel: row.filterTags.join(", "),
    canSelectLabel: row.canSelect ? "Selectable" : "Locked",
    canSelect: row.canSelect,
    selectionDisabledReason: row.canSelect
      ? ""
      : "Selection is disabled by static permission metadata.",
    rowActionState: row.trailingActionState,
    rowActionDisabledReason:
      row.trailingActionState === "disabled"
        ? "Inspect is disabled by static permission metadata."
        : "",
    trailingActionState: row.trailingActionState,
    trailingActionDisabledReason:
      row.trailingActionState === "disabled"
        ? "Trailing inspect is disabled by static permission metadata."
        : "",
  })) as readonly Record<string, unknown>[];

export function createMetadataUiAdvancedTableLabList() {
  return createList({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabMetadata,
    title: "TanStack table lab",
    description:
      "Metadata-driven table scenario for sorting, filtering, selection, and inert actions.",
    rowKey: "id",
    selectableField: "canSelect",
    selectionDisabledReasonField: "selectionDisabledReason",
    density: "dense",
    selectionMode: "multiple",
    columns: [
      createTextColumn({
        key: "metadata-ui.playground.advanced.table.column.record",
        field: "recordLabel",
        label: "Record",
        sortable: true,
        filterable: true,
        pinned: "start",
        width: {
          min: 190,
          ideal: 240,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.table.column.queue",
        field: "queueLabel",
        label: "Queue",
        sortable: true,
        filterable: true,
        width: {
          min: 160,
          ideal: 190,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.table.column.status",
        field: "status",
        label: "Status",
        sortable: true,
        filterable: true,
        width: {
          min: 112,
          ideal: 128,
        },
      }),
      createNumberColumn({
        key: "metadata-ui.playground.advanced.table.column.sort-bucket",
        field: "sortBucket",
        label: "Sort bucket",
        sortable: true,
        align: "end",
        width: {
          min: 120,
          ideal: 136,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.table.column.filter-tags",
        field: "filterTagsLabel",
        label: "Filters",
        filterable: true,
        width: {
          min: 180,
          ideal: 220,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.table.column.selection",
        field: "canSelectLabel",
        label: "Selection",
        filterable: true,
        width: {
          min: 128,
          ideal: 144,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.table.column.trailing-action",
        field: "trailingActionState",
        label: "Action",
        sortable: true,
        pinned: "end",
        width: {
          min: 112,
          ideal: 132,
        },
      }),
    ],
    filters: [
      createContainsFilter({
        key: "metadata-ui.playground.advanced.table.filter.ready",
        field: "filterTagsLabel",
        label: "Ready or review rows",
        value: "ready",
        locked: false,
      }),
    ],
    rowActions: [
      createListRowAction({
        action: inspectTableRowAction,
        placement: "inline",
        stateField: "rowActionState",
        disabledReasonField: "rowActionDisabledReason",
      }),
    ],
    trailingCells: [
      {
        key: "metadata-ui.playground.advanced.table.trailing.inspect",
        kind: "action",
        label: "Inspect",
        action: inspectTableRowAction,
        stateField: "trailingActionState",
        disabledReasonField: "trailingActionDisabledReason",
      },
    ],
    bulkActions: [
      createListBulkAction({
        action: reviewSelectedRowsAction,
        requiresSelection: true,
      }),
    ],
    toolbar: createListToolbar({
      enabled: true,
      showSearch: true,
      searchPlaceholder: "Search seeded table rows",
      showFilters: true,
      showSavedViews: true,
      savedViews: [
        {
          key: "metadata-ui.playground.advanced.table.view.ready",
          label: "Ready rows",
          active: true,
        },
        {
          key: "metadata-ui.playground.advanced.table.view.permission",
          label: "Permission states",
        },
      ],
      showSort: true,
      showDensity: true,
      showExport: true,
      exportAction: exportWindowAction,
      resetLabel: "Reset table lab",
    }),
    pagination: {
      enabled: true,
      pageSize: 8,
      pageSizeOptions: [8, 16],
    },
    virtualization: {
      enabled: true,
      rowEstimate: 40,
      overscan: 6,
      maxHeight: 520,
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-table-lab",
    },
  });
}
