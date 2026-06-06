import "server-only";

import {
  createActionBarItem,
  createContainsFilter,
  createList,
  createListBulkAction,
  createListRowAction,
  createListToolbar,
  createStatusColumn,
  createTextColumn,
  createToolbarActionBar,
  type MetadataUiActionContractInput,
} from "@afenda/metadata-ui";

import { METADATA_UI_ADVANCED_OPERATIONS_ROWS } from "./advanced-seed.fixture";
import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_ROUTE,
} from "./constants.fixture";

const inspectOperationsQueueAction = {
  id: "metadata-ui.playground.advanced.operations.action.inspect-queue",
  label: "Inspect queue",
  description: "Navigate to the static operations queue route.",
  intent: "open",
  tone: "primary",
  risk: "low",
  visibility: "visible",
  execution: {
    kind: "navigation",
    href: `${METADATA_UI_PLAYGROUND_ROUTE}/operations-list`,
    target: "self",
  },
} as const satisfies MetadataUiActionContractInput;

const approveOperationAction = {
  id: "metadata-ui.playground.advanced.operations.action.approve",
  label: "Approve",
  description: "Preview approval command metadata without executing a write.",
  intent: "approve",
  tone: "positive",
  risk: "medium",
  visibility: "disabled",
  disabledReason:
    "Approval commands require a feature package command handler outside this playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.advanced.operations.event.approve",
  },
  lifecycle: {
    state: "blocked",
    reason: "This static playground does not execute ERP writes.",
    feedback: {
      blocked: {
        placement: "inline",
        label: "Command blocked",
        description: "This static playground does not execute ERP writes.",
      },
    },
  },
} as const satisfies MetadataUiActionContractInput;

const rejectOperationAction = {
  id: "metadata-ui.playground.advanced.operations.action.reject",
  label: "Reject",
  description: "Preview rejection command metadata without executing a write.",
  intent: "reject",
  tone: "warning",
  risk: "medium",
  visibility: "disabled",
  disabledReason:
    "Rejection commands require a feature package command handler outside this playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.advanced.operations.event.reject",
  },
  lifecycle: {
    state: "blocked",
    reason: "This static playground does not execute ERP writes.",
    feedback: {
      blocked: {
        placement: "inline",
        label: "Command blocked",
        description: "This static playground does not execute ERP writes.",
      },
    },
  },
} as const satisfies MetadataUiActionContractInput;

const exportOperationsWindowAction = {
  id: "metadata-ui.playground.advanced.operations.action.export-window",
  label: "Export window",
  description: "Preview current-window export metadata without producing a file.",
  intent: "export",
  tone: "neutral",
  risk: "low",
  visibility: "disabled",
  disabledReason: "Exports are disabled in the static playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.advanced.operations.event.export-window",
  },
} as const satisfies MetadataUiActionContractInput;

export const METADATA_UI_ADVANCED_OPERATIONS_RENDER_ROWS =
  METADATA_UI_ADVANCED_OPERATIONS_ROWS.map((row) => ({
    id: row.id,
    recordLabel: row.recordLabel,
    locationLabel: row.locationLabel,
    ownerLabel: row.ownerLabel,
    status: row.status,
    priority: row.priority,
    reviewBand: row.reviewBand,
    permissionBand: row.permissionBand,
    commandState:
      row.permissionBand === "available" ? "Command available" : "Command disabled",
    updatedAt: row.updatedAt,
  })) as readonly Record<string, unknown>[];

export function createMetadataUiAdvancedOperationsActionBar() {
  return createToolbarActionBar({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsActionBarMetadata,
    title: "Operations command preview",
    description:
      "Static command metadata for approval-like operations without ERP mutation behavior.",
    overflow: {
      enabled: true,
      triggerLabel: "More commands",
      collapseAfter: 2,
    },
    actions: [
      createActionBarItem({
        key: inspectOperationsQueueAction.id,
        action: inspectOperationsQueueAction,
        priority: "primary",
        placement: "main",
        diagnostics: {
          testId: "metadata-ui-playground-advanced-operations-inspect",
        },
      }),
      createActionBarItem({
        key: approveOperationAction.id,
        action: approveOperationAction,
        priority: "secondary",
        placement: "main",
        disabled: {
          value: true,
          reason: approveOperationAction.disabledReason,
        },
        diagnostics: {
          testId: "metadata-ui-playground-advanced-operations-approve",
        },
      }),
      createActionBarItem({
        key: rejectOperationAction.id,
        action: rejectOperationAction,
        priority: "tertiary",
        placement: "overflow",
        disabled: {
          value: true,
          reason: rejectOperationAction.disabledReason,
        },
        diagnostics: {
          testId: "metadata-ui-playground-advanced-operations-reject",
        },
      }),
    ],
  });
}

export function createMetadataUiAdvancedOperationsList() {
  return createList({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsListMetadata,
    title: "Operations command surface",
    description:
      "Approval-like current-window rows with inert row, trailing, bulk, and export command previews.",
    rowKey: "id",
    density: "dense",
    selectionMode: "multiple",
    columns: [
      createTextColumn({
        key: "metadata-ui.playground.advanced.operations.column.record",
        field: "recordLabel",
        label: "Record",
        sortable: true,
        filterable: true,
        pinned: "start",
        width: {
          min: 190,
          ideal: 230,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.operations.column.location",
        field: "locationLabel",
        label: "Location",
        filterable: true,
        width: {
          min: 156,
          ideal: 180,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.operations.column.owner",
        field: "ownerLabel",
        label: "Owner",
        width: {
          min: 150,
          ideal: 180,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.operations.column.status",
        field: "status",
        label: "Status",
        sortable: true,
        filterable: true,
        width: {
          min: 112,
          ideal: 132,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.operations.column.priority",
        field: "priority",
        label: "Priority",
        sortable: true,
        filterable: true,
        width: {
          min: 112,
          ideal: 132,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.operations.column.review-band",
        field: "reviewBand",
        label: "Review band",
        filterable: true,
        width: {
          min: 132,
          ideal: 156,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.operations.column.command-state",
        field: "commandState",
        label: "Command",
        pinned: "end",
        width: {
          min: 156,
          ideal: 180,
        },
      }),
    ],
    filters: [
      createContainsFilter({
        key: "metadata-ui.playground.advanced.operations.filter.review-band",
        field: "reviewBand",
        label: "Review band",
        value: "elevated",
        locked: false,
      }),
    ],
    rowActions: [
      createListRowAction({
        action: approveOperationAction,
        placement: "inline",
      }),
      createListRowAction({
        action: rejectOperationAction,
        placement: "overflow",
      }),
    ],
    trailingCells: [
      {
        key: "metadata-ui.playground.advanced.operations.trailing.permission",
        kind: "status",
        label: "Permission band",
        statusField: "permissionBand",
      },
      {
        key: "metadata-ui.playground.advanced.operations.trailing.approve",
        kind: "action",
        label: "Approve",
        action: approveOperationAction,
        disabledReason: approveOperationAction.disabledReason,
      },
    ],
    bulkActions: [
      createListBulkAction({
        action: approveOperationAction,
        requiresSelection: true,
      }),
    ],
    toolbar: createListToolbar({
      enabled: true,
      showSearch: true,
      searchPlaceholder: "Search operations rows",
      showFilters: true,
      showSavedViews: true,
      savedViews: [
        {
          key: "metadata-ui.playground.advanced.operations.view.elevated",
          label: "Elevated review",
          active: true,
        },
        {
          key: "metadata-ui.playground.advanced.operations.view.disabled",
          label: "Disabled commands",
        },
      ],
      showSort: true,
      showDensity: true,
      showExport: true,
      exportAction: exportOperationsWindowAction,
      resetLabel: "Reset operations",
    }),
    pagination: {
      enabled: true,
      pageSize: 8,
      pageSizeOptions: [8],
    },
    virtualization: {
      enabled: true,
      rowEstimate: 40,
      overscan: 4,
      maxHeight: 480,
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-operations-list",
    },
  });
}
