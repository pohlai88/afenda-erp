import {
  createApprovalFlowTimeline,
  createApprovalTimelineStep,
} from "../builders/approval-timeline.builder";
import type { MetadataUiApprovalTimeline } from "../schemas/approval-timeline.schema";
import type { MetadataUiGovernedSurfaceParityNote } from "./parity-adapters.shared";

export type LegacyApprovalTimelineStepInput = Readonly<{
  id: string;
  label: string;
  description?: string;
  status: "pending" | "approved" | "rejected" | "skipped" | "blocked" | "failed";
  actorLabel?: string;
  occurredAt?: string;
  dueAt?: string;
  note?: string;
  reason?: string;
}>;

export type LegacyApprovalTimelineInput = Readonly<{
  key?: string;
  title?: string;
  description?: string;
  currentStepId?: string;
  steps: readonly LegacyApprovalTimelineStepInput[];
  policyDescription?: string;
}>;

export type MetadataUiApprovalTimelineMigrationResult = Readonly<{
  data: MetadataUiApprovalTimeline;
  parityNotes: readonly MetadataUiGovernedSurfaceParityNote[];
}>;

function normalizeApprovalTimelineKey(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "approval"
  );
}

function approvalTimelineKey(value: string): string {
  return `approval-timeline.${normalizeApprovalTimelineKey(value)}`;
}

function createApprovalTimelineParityNote(
  sourceField: string,
  disposition: MetadataUiGovernedSurfaceParityNote["disposition"],
  message: string,
): MetadataUiGovernedSurfaceParityNote {
  return {
    surface: "approval-timeline",
    sourceField,
    disposition,
    message,
  };
}

export function adaptLegacyApprovalTimelineToMetadataUi(
  input: LegacyApprovalTimelineInput,
): MetadataUiApprovalTimelineMigrationResult {
  const stepKeyById = new Map(
    input.steps.map((step) => [step.id, approvalTimelineKey(step.id)]),
  );
  const data = createApprovalFlowTimeline({
    key: input.key ?? approvalTimelineKey(input.title ?? "approval-flow"),
    title: input.title,
    description: input.description,
    currentStepKey: input.currentStepId
      ? stepKeyById.get(input.currentStepId)
      : undefined,
    steps: input.steps.map((step, index) =>
      createApprovalTimelineStep({
        key: approvalTimelineKey(step.id),
        label: step.label,
        description: step.description,
        status: step.status,
        order: index,
        actor: step.actorLabel
          ? {
              actorId: approvalTimelineKey(step.actorLabel),
              actorType: "user",
              displayName: step.actorLabel,
            }
          : undefined,
        occurredAt: step.occurredAt,
        dueAt: step.dueAt,
        comment: step.note,
        reason: step.reason,
      }),
    ),
  });

  return {
    data,
    parityNotes: input.policyDescription
      ? [
          createApprovalTimelineParityNote(
            "policyDescription",
            "unsupported",
            "Approval policy remains host-owned and is not executed by metadata-ui.",
          ),
        ]
      : [],
  };
}
