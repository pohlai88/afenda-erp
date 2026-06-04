import { z } from "zod";

import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID =
  "metadata-ui.schema.approval-timeline" as const;

export const METADATA_UI_APPROVAL_TIMELINE_SCHEMA_VERSION = 1 as const;

export type MetadataUiApprovalTimelineSchemaStability = "beta";

export const METADATA_UI_APPROVAL_TIMELINE_SCHEMA_STABILITY: MetadataUiApprovalTimelineSchemaStability =
  "beta";

const METADATA_UI_APPROVAL_TIMELINE_STEP_STATUS_VALUES = [
  "not-started",
  "pending",
  "approved",
  "rejected",
  "skipped",
  "blocked",
  "failed",
] as const;

const METADATA_UI_APPROVAL_TIMELINE_ACTOR_TYPE_VALUES = [
  "user",
  "group",
  "system",
  "integration",
] as const;

export const METADATA_UI_APPROVAL_TIMELINE_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Approval timeline keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_APPROVAL_TIMELINE_STEP_STATUS_SCHEMA = z.enum(
  METADATA_UI_APPROVAL_TIMELINE_STEP_STATUS_VALUES,
);

export const METADATA_UI_APPROVAL_TIMELINE_ACTOR_SCHEMA = z.object({
  actorId: z.string().min(1).max(160),
  actorType: z.enum(METADATA_UI_APPROVAL_TIMELINE_ACTOR_TYPE_VALUES),
  displayName: z.string().min(1).max(160).optional(),
});

export const METADATA_UI_APPROVAL_TIMELINE_STEP_SCHEMA = z
  .object({
    key: METADATA_UI_APPROVAL_TIMELINE_KEY_SCHEMA,
    label: z.string().min(1).max(160),
    description: z.string().min(1).max(320).optional(),
    status: METADATA_UI_APPROVAL_TIMELINE_STEP_STATUS_SCHEMA,
    actor: METADATA_UI_APPROVAL_TIMELINE_ACTOR_SCHEMA.optional(),
    occurredAt: z.string().datetime().optional(),
    dueAt: z.string().datetime().optional(),
    comment: z.string().min(1).max(500).optional(),
    reason: z.string().min(1).max(320).optional(),
    order: z.number().int().min(0).max(500),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((step, ctx) => {
    if (
      (step.status === "blocked" ||
        step.status === "failed" ||
        step.status === "rejected") &&
      !step.reason
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message:
          "Blocked, failed, and rejected approval steps must provide a reason.",
      });
    }
  });

export const METADATA_UI_APPROVAL_TIMELINE_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID)
    .default(METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_APPROVAL_TIMELINE_SCHEMA_VERSION)
    .default(METADATA_UI_APPROVAL_TIMELINE_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_APPROVAL_TIMELINE_SCHEMA_STABILITY)
    .default(METADATA_UI_APPROVAL_TIMELINE_SCHEMA_STABILITY),

  key: METADATA_UI_APPROVAL_TIMELINE_KEY_SCHEMA,

  title: z.string().min(1).max(120).default("Approval timeline"),
  description: z.string().min(1).max(320).optional(),

  steps: z.array(METADATA_UI_APPROVAL_TIMELINE_STEP_SCHEMA).max(50).default([]),

  currentStepKey: METADATA_UI_APPROVAL_TIMELINE_KEY_SCHEMA.optional(),
  emptyStateKey: METADATA_UI_APPROVAL_TIMELINE_KEY_SCHEMA.optional(),

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

type MetadataUiApprovalTimelineSchemaOutput = z.output<
  typeof METADATA_UI_APPROVAL_TIMELINE_SCHEMA
>;

type MetadataUiApprovalTimelineStepSchemaOutput = z.output<
  typeof METADATA_UI_APPROVAL_TIMELINE_STEP_SCHEMA
>;

type MetadataUiApprovalTimelineActorSchemaOutput = z.output<
  typeof METADATA_UI_APPROVAL_TIMELINE_ACTOR_SCHEMA
>;

type MetadataUiApprovalTimelineDiagnosticsSchemaOutput = NonNullable<
  MetadataUiApprovalTimelineSchemaOutput["diagnostics"]
>;

export type MetadataUiApprovalTimelineInput = z.input<
  typeof METADATA_UI_APPROVAL_TIMELINE_SCHEMA
>;

export type MetadataUiApprovalTimelineStepInput = z.input<
  typeof METADATA_UI_APPROVAL_TIMELINE_STEP_SCHEMA
>;

export type MetadataUiApprovalTimelineActorInput = z.input<
  typeof METADATA_UI_APPROVAL_TIMELINE_ACTOR_SCHEMA
>;

export type MetadataUiApprovalTimelineStepStatus =
  (typeof METADATA_UI_APPROVAL_TIMELINE_STEP_STATUS_VALUES)[number];

export type MetadataUiApprovalTimelineActorType =
  (typeof METADATA_UI_APPROVAL_TIMELINE_ACTOR_TYPE_VALUES)[number];

declare const metadataUiApprovalTimelineKeyBrand: unique symbol;
declare const metadataUiApprovalTimelineActorIdBrand: unique symbol;
declare const metadataUiApprovalTimelineBoundedStepsBrand: unique symbol;
declare const metadataUiApprovalTimelineDiagnosticKeyBrand: unique symbol;

export type MetadataUiApprovalTimelineKey = string & {
  readonly [metadataUiApprovalTimelineKeyBrand]: true;
};

export type MetadataUiApprovalTimelineActorId = string & {
  readonly [metadataUiApprovalTimelineActorIdBrand]: true;
};

export type MetadataUiApprovalTimelineDiagnosticKey = string & {
  readonly [metadataUiApprovalTimelineDiagnosticKeyBrand]: true;
};

export type MetadataUiApprovalTimelineActor = Omit<
  MetadataUiApprovalTimelineActorSchemaOutput,
  "actorId"
> & {
  actorId: MetadataUiApprovalTimelineActorId;
};

export type MetadataUiApprovalTimelineStepForStatus<
  Status extends MetadataUiApprovalTimelineStepStatus,
> = Omit<
  MetadataUiApprovalTimelineStepSchemaOutput,
  "actor" | "key" | "status"
> & {
  key: MetadataUiApprovalTimelineKey;
  status: Status;
  actor?: MetadataUiApprovalTimelineActor;
};

export type MetadataUiApprovalTimelineStep = {
  [Status in MetadataUiApprovalTimelineStepStatus]: MetadataUiApprovalTimelineStepForStatus<Status>;
}[MetadataUiApprovalTimelineStepStatus];

export type MetadataUiApprovalTimelineBoundedSteps =
  MetadataUiApprovalTimelineStep[] & {
    readonly [metadataUiApprovalTimelineBoundedStepsBrand]: true;
  };

export type MetadataUiApprovalTimelineDiagnostics = Omit<
  MetadataUiApprovalTimelineDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiApprovalTimelineDiagnosticKey;
  sectionKey?: MetadataUiApprovalTimelineDiagnosticKey;
  rendererKey?: MetadataUiApprovalTimelineDiagnosticKey;
  testId?: MetadataUiApprovalTimelineDiagnosticKey;
};

export type MetadataUiApprovalTimeline = Omit<
  MetadataUiApprovalTimelineSchemaOutput,
  | "currentStepKey"
  | "diagnostics"
  | "emptyStateKey"
  | "key"
  | "permission"
  | "presentation"
  | "steps"
> & {
  key: MetadataUiApprovalTimelineKey;
  steps: MetadataUiApprovalTimelineBoundedSteps;
  currentStepKey?: MetadataUiApprovalTimelineKey;
  emptyStateKey?: MetadataUiApprovalTimelineKey;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiApprovalTimelineDiagnostics;
};

export type MetadataUiApprovalTimelineParseResult =
  | {
      success: true;
      data: MetadataUiApprovalTimeline;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiApprovalTimelineInvariants(
  timeline: MetadataUiApprovalTimelineSchemaOutput,
): asserts timeline is MetadataUiApprovalTimelineSchemaOutput &
  MetadataUiApprovalTimeline {
  if (timeline.steps.length > 50) {
    throw new Error("Approval timelines may declare at most fifty steps.");
  }

  const knownStepKeys = new Set(timeline.steps.map((step) => step.key));
  if (knownStepKeys.size !== timeline.steps.length) {
    throw new Error("Approval timeline step keys must be unique.");
  }

  if (timeline.currentStepKey && !knownStepKeys.has(timeline.currentStepKey)) {
    throw new Error("Approval timeline currentStepKey must reference a declared step.");
  }
}

export function parseMetadataUiApprovalTimeline(
  input: unknown,
): MetadataUiApprovalTimeline {
  const timeline = METADATA_UI_APPROVAL_TIMELINE_SCHEMA.parse(input);
  assertMetadataUiApprovalTimelineInvariants(timeline);
  return timeline;
}

export function safeParseMetadataUiApprovalTimeline(
  input: unknown,
): MetadataUiApprovalTimelineParseResult {
  const result = METADATA_UI_APPROVAL_TIMELINE_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiApprovalTimelineInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
