import "server-only";

import {
  createApprovalFlowTimeline,
  createApprovalTimelineStep,
  createAuditEvent,
  createAuditTab,
  createAuditTrailPanel,
  createContentTab,
  createDetailTabsSet,
  createList,
  createStatusColumn,
  createTextColumn,
} from "@afenda/metadata-ui";

import {
  METADATA_UI_ADVANCED_OPERATIONS_ROWS,
  METADATA_UI_ADVANCED_RECORDS,
} from "./advanced-seed.fixture";
import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS,
} from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

const ADVANCED_RECORD = METADATA_UI_ADVANCED_RECORDS[0];

if (!ADVANCED_RECORD) {
  throw new Error("Metadata UI advanced record fixture requires one record seed.");
}

const advancedRecordActor = {
  actorId: "metadata-ui.playground.advanced.record.actor.sample-operator",
  actorType: "user",
  displayName: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
} as const;

const advancedRecordTarget = {
  targetType: "advanced-sample-record",
  targetId: ADVANCED_RECORD.id,
  label: ADVANCED_RECORD.title,
} as const;

export const METADATA_UI_ADVANCED_RECORD_RELATED_ROWS =
  METADATA_UI_ADVANCED_OPERATIONS_ROWS.map((row) => ({
    id: row.id,
    recordLabel: row.recordLabel,
    relationshipLabel:
      row.status === "blocked" ? "Exception follow-up" : "Related operation",
    locationLabel: row.locationLabel,
    status: row.status,
    reviewBand: row.reviewBand,
  })) as readonly Record<string, unknown>[];

export function createMetadataUiAdvancedRecordDetailTabs() {
  return createDetailTabsSet({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordDetailTabsMetadata,
    title: ADVANCED_RECORD.title,
    description: ADVANCED_RECORD.subtitle,
    tabs: [
      createContentTab({
        key: "summary",
        label: "Summary",
        description: "References the related operation list section.",
        sectionKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordRelatedListSection,
        defaultSelected: true,
      }),
      createAuditTab({
        key: "audit",
        label: "Audit",
        description: "References the advanced record audit panel.",
        sectionKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordAuditPanelSection,
      }),
      createContentTab({
        key: "timeline",
        label: "Timeline",
        description: "References the advanced record approval timeline.",
        sectionKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordTimelineSection,
      }),
    ],
  });
}

export function createMetadataUiAdvancedRecordRelatedList() {
  return createList({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordRelatedListMetadata,
    title: "Related operation rows",
    description:
      "Static related rows for the advanced record detail scenario.",
    rowKey: "id",
    density: "compact",
    selectionMode: "none",
    columns: [
      createTextColumn({
        key: "metadata-ui.playground.advanced.record.related.column.record",
        field: "recordLabel",
        label: "Record",
        pinned: "start",
        filterable: true,
        width: {
          min: 190,
          ideal: 230,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.record.related.column.relationship",
        field: "relationshipLabel",
        label: "Relationship",
        width: {
          min: 170,
          ideal: 210,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.record.related.column.location",
        field: "locationLabel",
        label: "Location",
        width: {
          min: 150,
          ideal: 180,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.record.related.column.status",
        field: "status",
        label: "Status",
        sortable: true,
        width: {
          min: 110,
          ideal: 128,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.record.related.column.review-band",
        field: "reviewBand",
        label: "Review band",
        width: {
          min: 132,
          ideal: 156,
        },
      }),
    ],
    pagination: {
      enabled: true,
      pageSize: 8,
      pageSizeOptions: [8],
    },
    virtualization: {
      enabled: false,
      rowEstimate: 40,
      overscan: 4,
      maxHeight: 360,
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-record-related-list",
    },
  });
}

export function createMetadataUiAdvancedRecordAuditPanel() {
  return createAuditTrailPanel({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordAuditPanelMetadata,
    title: "Record audit trail",
    description:
      "Static audit events for the advanced record detail scenario.",
    events: [
      createAuditEvent({
        key: "metadata-ui.playground.advanced.record.audit.created",
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.baseline,
        action: "Advanced record created",
        summary: "The advanced sample record was seeded for detail review.",
        tone: "info",
        actor: advancedRecordActor,
        target: advancedRecordTarget,
        source: {
          moduleKey: "metadata-ui.playground.advanced.record",
          featureKey: "metadata-ui.playground.advanced.record.fixture",
          requestId: "metadata-ui.playground.advanced.record.request-001",
          correlationId:
            "metadata-ui.playground.advanced.record.correlation-001",
        },
      }),
      createAuditEvent({
        key: "metadata-ui.playground.advanced.record.audit.reviewed",
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowStart,
        action: "Advanced record reviewed",
        summary: "Static review metadata was linked to related operations.",
        tone: "positive",
        actor: advancedRecordActor,
        target: advancedRecordTarget,
      }),
      createAuditEvent({
        key: "metadata-ui.playground.advanced.record.audit.blocked",
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
        action: "Advanced record follow-up blocked",
        summary: "A deterministic blocked state was recorded for review.",
        tone: "warning",
        actor: {
          actorId: "metadata-ui.playground.advanced.record.actor.sample-system",
          actorType: "system",
          displayName: "Sample System",
        },
        target: advancedRecordTarget,
        reason: "Blocked by static advanced record fixture metadata only.",
      }),
    ],
  });
}

export function createMetadataUiAdvancedRecordTimeline() {
  return createApprovalFlowTimeline({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordTimelineMetadata,
    title: "Record timeline",
    description:
      "Static approval-like timeline for the advanced record detail scenario.",
    currentStepKey: "metadata-ui.playground.advanced.record.timeline.review",
    steps: [
      createApprovalTimelineStep({
        key: "metadata-ui.playground.advanced.record.timeline.prepare",
        label: "Advanced record prepared",
        description: "The sample record entered the static review path.",
        status: "approved",
        actor: advancedRecordActor,
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.baseline,
        comment: "Static preparation step for record detail review.",
        order: 10,
      }),
      createApprovalTimelineStep({
        key: "metadata-ui.playground.advanced.record.timeline.review",
        label: "Advanced record review in progress",
        description: "Current deterministic review step.",
        status: "pending",
        actor: {
          actorId: "metadata-ui.playground.advanced.record.actor.review-group",
          actorType: "group",
          displayName: "Sample Review Group",
        },
        dueAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
        comment: "Static due timestamp for screenshot-safe review.",
        order: 20,
      }),
      createApprovalTimelineStep({
        key: "metadata-ui.playground.advanced.record.timeline.follow-up",
        label: "Advanced record follow-up blocked",
        description: "Blocked deterministic follow-up step.",
        status: "blocked",
        actor: {
          actorId: "metadata-ui.playground.advanced.record.actor.sample-system",
          actorType: "system",
          displayName: "Sample System",
        },
        reason:
          "Blocked by static playground metadata; no workflow lookup is performed.",
        order: 30,
      }),
    ],
  });
}
