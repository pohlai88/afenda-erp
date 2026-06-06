import {
  createAuditEvent,
  createAuditTrailPanel,
} from "@afenda/metadata-ui";

import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS,
} from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

const sampleAuditActor = {
  actorId: "metadata-ui.playground.audit.actor.sample-operator",
  actorType: "user",
  displayName: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
} as const;

const sampleAuditTarget = {
  targetType: "sample-record",
  targetId: "metadata-ui.playground.audit.target.sample-record",
  label: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord,
} as const;

export function createMetadataUiPlaygroundAuditPanel() {
  return createAuditTrailPanel({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.auditPanelMetadata,
    title: "Audit panel preview",
    description:
      "Static audit-like events for renderer review without ERP event reads.",
    events: [
      createAuditEvent({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.auditEventCreated,
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.baseline,
        action: "Audit panel preview: sample record created",
        summary: "A static sample record was added to the preview surface.",
        tone: "info",
        actor: sampleAuditActor,
        target: sampleAuditTarget,
        source: {
          moduleKey: "metadata-ui.playground.audit",
          featureKey: "metadata-ui.playground.audit.fixture",
          requestId: "metadata-ui.playground.audit.request-001",
          correlationId: "metadata-ui.playground.audit.correlation-001",
        },
      }),
      createAuditEvent({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.auditEventReviewed,
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowStart,
        action: "Sample review noted",
        summary: "Static review metadata was recorded for visual inspection.",
        tone: "positive",
        actor: sampleAuditActor,
        target: sampleAuditTarget,
      }),
      createAuditEvent({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.auditEventBlocked,
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
        action: "Sample follow-up blocked",
        summary: "A static blocked state was recorded for audit-panel review.",
        tone: "warning",
        actor: {
          actorId: "metadata-ui.playground.audit.actor.sample-system",
          actorType: "system",
          displayName: "Sample System",
        },
        target: sampleAuditTarget,
        reason:
          "Blocked by deterministic playground fixture metadata only.",
      }),
    ],
  });
}
