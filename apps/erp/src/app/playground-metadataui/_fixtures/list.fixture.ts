import {
  createContainsFilter,
  createDateColumn,
  createList,
  createListRowAction,
  createStatusColumn,
  createTextColumn,
  type MetadataUiActionContractInput,
} from "@afenda/metadata-ui";

import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS,
} from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

const inspectRecordAction = {
  id: "metadata-ui.playground.action.inspect-record",
  label: "Inspect",
  description: "Inspect the static sample row.",
  intent: "open",
  tone: "neutral",
  risk: "low",
  visibility: "disabled",
  disabledReason: "Row actions are inert in this playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.event.inspect-record",
  },
} as const satisfies MetadataUiActionContractInput;

export const METADATA_UI_PLAYGROUND_LIST_ROWS = [
  {
    id: "metadata-ui-playground-row-001",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 001`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} A`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Ready",
    reviewBand: "Standard",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.baseline,
  },
  {
    id: "metadata-ui-playground-row-002",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 002`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} B`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Ready",
    reviewBand: "Compact",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowStart,
  },
  {
    id: "metadata-ui-playground-row-003",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 003`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} C`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Queued",
    reviewBand: "Dense",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowStart,
  },
  {
    id: "metadata-ui-playground-row-004",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 004`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} D`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Queued",
    reviewBand: "Standard",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowStart,
  },
  {
    id: "metadata-ui-playground-row-005",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 005`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} E`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Review",
    reviewBand: "Compact",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
  },
  {
    id: "metadata-ui-playground-row-006",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 006`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} F`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Review",
    reviewBand: "Dense",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
  },
  {
    id: "metadata-ui-playground-row-007",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 007`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} G`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Paused",
    reviewBand: "Standard",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
  },
  {
    id: "metadata-ui-playground-row-008",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 008`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} H`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    statusLabel: "Paused",
    reviewBand: "Compact",
    reviewedAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
  },
] as const satisfies readonly Record<string, unknown>[];

export function createMetadataUiPlaygroundDenseList() {
  return createList({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.listMetadata,
    title: "Dense list preview",
    description:
      "Current-window sample rows for list density, toolbar, selection, and row actions.",
    rowKey: "id",
    density: "dense",
    selectionMode: "none",
    columns: [
      createTextColumn({
        key: "metadata-ui.playground.list.column.record",
        field: "recordLabel",
        label: "Record",
        filterable: true,
        width: {
          min: 180,
          ideal: 220,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.list.column.location",
        field: "locationLabel",
        label: "Location",
        filterable: true,
        width: {
          min: 160,
          ideal: 180,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.list.column.owner",
        field: "ownerLabel",
        label: "Owner",
        width: {
          min: 160,
          ideal: 180,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.list.column.status",
        field: "statusLabel",
        label: "Status",
        width: {
          min: 120,
          ideal: 140,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.list.column.review-band",
        field: "reviewBand",
        label: "Review band",
        width: {
          min: 132,
          ideal: 148,
        },
      }),
      createDateColumn({
        key: "metadata-ui.playground.list.column.reviewed-at",
        field: "reviewedAt",
        label: "Reviewed",
        align: "end",
        width: {
          min: 184,
          ideal: 210,
        },
      }),
    ],
    filters: [
      createContainsFilter({
        key: "metadata-ui.playground.list.filter.record",
        field: "recordLabel",
        label: "Record label",
        value: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord,
        locked: true,
      }),
    ],
    rowActions: [
      createListRowAction({
        action: inspectRecordAction,
        placement: "inline",
      }),
    ],
    pagination: {
      enabled: true,
      pageSize: 8,
      pageSizeOptions: [8, 16, 24],
    },
    virtualization: {
      enabled: false,
      rowEstimate: 36,
      overscan: 4,
      maxHeight: 420,
    },
    diagnostics: {
      testId: "metadata-ui-playground-dense-list",
    },
  });
}
