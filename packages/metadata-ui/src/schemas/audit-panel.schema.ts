import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_AUDIT_PANEL_SCHEMA_ID =
  "metadata-ui.schema.audit-panel" as const;

export const METADATA_UI_AUDIT_PANEL_SCHEMA_VERSION = 1 as const;

export type MetadataUiAuditPanelSchemaStability = "beta";

export const METADATA_UI_AUDIT_PANEL_SCHEMA_STABILITY: MetadataUiAuditPanelSchemaStability =
  "beta";

const METADATA_UI_AUDIT_EVENT_TONE_VALUES = [
  "neutral",
  "info",
  "positive",
  "warning",
  "critical",
] as const;

const METADATA_UI_AUDIT_ACTOR_TYPE_VALUES = [
  "user",
  "system",
  "integration",
  "service",
] as const;

const METADATA_UI_AUDIT_PANEL_ACTION_PLACEMENT_VALUES = [
  "header",
  "event",
  "overflow",
] as const;

export const METADATA_UI_AUDIT_PANEL_KEY_SCHEMA = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Audit panel keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_AUDIT_EVENT_TONE_SCHEMA = z.enum(
  METADATA_UI_AUDIT_EVENT_TONE_VALUES,
);

export const METADATA_UI_AUDIT_ACTOR_SCHEMA = z.object({
  actorId: z.string().trim().min(1).max(160),
  actorType: z.enum(METADATA_UI_AUDIT_ACTOR_TYPE_VALUES),
  displayName: z.string().trim().min(1).max(160).optional(),
});

export const METADATA_UI_AUDIT_TARGET_SCHEMA = z.object({
  targetType: z.string().trim().min(1).max(120),
  targetId: z.string().trim().min(1).max(160),
  label: z.string().trim().min(1).max(160).optional(),
});

export const METADATA_UI_AUDIT_EVENT_SCHEMA = z.object({
  key: METADATA_UI_AUDIT_PANEL_KEY_SCHEMA,

  occurredAt: z.string().datetime(),

  action: z.string().trim().min(1).max(160),

  summary: z.string().trim().min(1).max(240),

  tone: METADATA_UI_AUDIT_EVENT_TONE_SCHEMA.default("neutral"),

  actor: METADATA_UI_AUDIT_ACTOR_SCHEMA,

  target: METADATA_UI_AUDIT_TARGET_SCHEMA.optional(),

  reason: z.string().trim().min(1).max(320).optional(),

  source: z
    .object({
      moduleKey: z.string().trim().min(1).max(160).optional(),
      featureKey: z.string().trim().min(1).max(160).optional(),
      requestId: z.string().trim().min(1).max(160).optional(),
      correlationId: z.string().trim().min(1).max(160).optional(),
    })
    .optional(),

  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const METADATA_UI_AUDIT_PANEL_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,
  placement: z
    .enum(METADATA_UI_AUDIT_PANEL_ACTION_PLACEMENT_VALUES)
    .default("header"),
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_AUDIT_PANEL_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_AUDIT_PANEL_SCHEMA_ID)
    .default(METADATA_UI_AUDIT_PANEL_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_AUDIT_PANEL_SCHEMA_VERSION)
    .default(METADATA_UI_AUDIT_PANEL_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_AUDIT_PANEL_SCHEMA_STABILITY)
    .default(METADATA_UI_AUDIT_PANEL_SCHEMA_STABILITY),

  key: METADATA_UI_AUDIT_PANEL_KEY_SCHEMA,

  title: z.string().trim().min(1).max(120).default("Audit trail"),
  description: z.string().trim().min(1).max(320).optional(),

  target: METADATA_UI_AUDIT_TARGET_SCHEMA.optional(),

  events: z.array(METADATA_UI_AUDIT_EVENT_SCHEMA).max(100).default([]),

  actions: z.array(METADATA_UI_AUDIT_PANEL_ACTION_SCHEMA).max(6).default([]),

  emptyStateKey: METADATA_UI_AUDIT_PANEL_KEY_SCHEMA.optional(),

  presentation: metadataUiPresentationContractSchema.optional(),
  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      componentKey: z.string().trim().min(1).max(160).optional(),
      sectionKey: z.string().trim().min(1).max(160).optional(),
      rendererKey: z.string().trim().min(1).max(160).optional(),
      testId: z.string().trim().min(1).max(160).optional(),
    })
    .optional(),
});

type MetadataUiAuditPanelSchemaOutput = z.output<
  typeof METADATA_UI_AUDIT_PANEL_SCHEMA
>;

type MetadataUiAuditEventSchemaOutput = z.output<
  typeof METADATA_UI_AUDIT_EVENT_SCHEMA
>;

type MetadataUiAuditActorSchemaOutput = z.output<
  typeof METADATA_UI_AUDIT_ACTOR_SCHEMA
>;

type MetadataUiAuditTargetSchemaOutput = z.output<
  typeof METADATA_UI_AUDIT_TARGET_SCHEMA
>;

type MetadataUiAuditPanelActionSchemaOutput = z.output<
  typeof METADATA_UI_AUDIT_PANEL_ACTION_SCHEMA
>;

type MetadataUiAuditPanelDiagnosticsSchemaOutput = NonNullable<
  MetadataUiAuditPanelSchemaOutput["diagnostics"]
>;

type MetadataUiAuditEventSourceSchemaOutput = NonNullable<
  MetadataUiAuditEventSchemaOutput["source"]
>;

export type MetadataUiAuditPanelInput = z.input<
  typeof METADATA_UI_AUDIT_PANEL_SCHEMA
>;

export type MetadataUiAuditEventInput = z.input<
  typeof METADATA_UI_AUDIT_EVENT_SCHEMA
>;

export type MetadataUiAuditActorInput = z.input<
  typeof METADATA_UI_AUDIT_ACTOR_SCHEMA
>;

export type MetadataUiAuditTargetInput = z.input<
  typeof METADATA_UI_AUDIT_TARGET_SCHEMA
>;

export type MetadataUiAuditPanelActionInput = z.input<
  typeof METADATA_UI_AUDIT_PANEL_ACTION_SCHEMA
>;

export type MetadataUiAuditEventTone =
  (typeof METADATA_UI_AUDIT_EVENT_TONE_VALUES)[number];

export type MetadataUiAuditActorType =
  (typeof METADATA_UI_AUDIT_ACTOR_TYPE_VALUES)[number];

export type MetadataUiAuditPanelActionPlacement =
  (typeof METADATA_UI_AUDIT_PANEL_ACTION_PLACEMENT_VALUES)[number];

declare const metadataUiAuditPanelKeyBrand: unique symbol;
declare const metadataUiAuditActorIdBrand: unique symbol;
declare const metadataUiAuditTargetIdBrand: unique symbol;
declare const metadataUiAuditDiagnosticKeyBrand: unique symbol;
declare const metadataUiAuditBoundedEventsBrand: unique symbol;
declare const metadataUiAuditBoundedActionsBrand: unique symbol;

type MetadataUiAuditTupleUpTo<
  Value,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator | MetadataUiAuditTupleUpTo<Value, Max, [...Accumulator, Value]>;

export type MetadataUiAuditPanelKey = string & {
  readonly [metadataUiAuditPanelKeyBrand]: true;
};

export type MetadataUiAuditPanelKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiAuditPanelKey;

export type MetadataUiAuditActorId = string & {
  readonly [metadataUiAuditActorIdBrand]: true;
};

export type MetadataUiAuditTargetId = string & {
  readonly [metadataUiAuditTargetIdBrand]: true;
};

export type MetadataUiAuditDiagnosticKey = string & {
  readonly [metadataUiAuditDiagnosticKeyBrand]: true;
};

export type MetadataUiAuditActorForType<
  ActorType extends MetadataUiAuditActorType,
> = Omit<MetadataUiAuditActorSchemaOutput, "actorId" | "actorType"> & {
  actorId: MetadataUiAuditActorId;
  actorType: ActorType;
};

export type MetadataUiAuditActor = {
  [ActorType in MetadataUiAuditActorType]: MetadataUiAuditActorForType<ActorType>;
}[MetadataUiAuditActorType];

export type MetadataUiAuditTarget = Omit<
  MetadataUiAuditTargetSchemaOutput,
  "targetId"
> & {
  targetId: MetadataUiAuditTargetId;
};

export type MetadataUiAuditEventSource = Omit<
  MetadataUiAuditEventSourceSchemaOutput,
  "correlationId" | "featureKey" | "moduleKey" | "requestId"
> & {
  moduleKey?: MetadataUiAuditPanelKey;
  featureKey?: MetadataUiAuditPanelKey;
  requestId?: MetadataUiAuditDiagnosticKey;
  correlationId?: MetadataUiAuditDiagnosticKey;
};

export type MetadataUiAuditEventForTone<
  Tone extends MetadataUiAuditEventTone,
> = Omit<
  MetadataUiAuditEventSchemaOutput,
  "actor" | "key" | "source" | "target" | "tone"
> & {
  key: MetadataUiAuditPanelKey;
  tone: Tone;
  actor: MetadataUiAuditActor;
  target?: MetadataUiAuditTarget;
  source?: MetadataUiAuditEventSource;
};

export type MetadataUiAuditEvent = {
  [Tone in MetadataUiAuditEventTone]: MetadataUiAuditEventForTone<Tone>;
}[MetadataUiAuditEventTone];

export type MetadataUiAuditEventsByTone<
  Events extends readonly MetadataUiAuditEvent[],
> = {
  [Tone in MetadataUiAuditEventTone]: Extract<Events[number], { tone: Tone }>[];
};

export type MetadataUiAuditEventsByActorType<
  Events extends readonly MetadataUiAuditEvent[],
> = {
  [ActorType in MetadataUiAuditActorType]: Extract<
    Events[number],
    { actor: { actorType: ActorType } }
  >[];
};

export type MetadataUiAuditBoundedEvents = MetadataUiAuditEvent[] & {
  readonly [metadataUiAuditBoundedEventsBrand]: true;
};

export type MetadataUiAuditPanelActionForPlacement<
  Placement extends MetadataUiAuditPanelActionPlacement,
> = Omit<
  MetadataUiAuditPanelActionSchemaOutput,
  "action" | "permission" | "placement"
> & {
  action: MetadataUiActionContract;
  placement: Placement;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiAuditPanelAction = {
  [Placement in MetadataUiAuditPanelActionPlacement]: MetadataUiAuditPanelActionForPlacement<Placement>;
}[MetadataUiAuditPanelActionPlacement];

export type MetadataUiAuditPanelActionsByPlacement<
  Actions extends readonly MetadataUiAuditPanelAction[],
> = {
  [Placement in MetadataUiAuditPanelActionPlacement]: Extract<
    Actions[number],
    { placement: Placement }
  >[];
};

export type MetadataUiAuditBoundedActions =
  MetadataUiAuditTupleUpTo<MetadataUiAuditPanelAction, 6> & {
    readonly [metadataUiAuditBoundedActionsBrand]: true;
  };

export type MetadataUiAuditPanelDiagnostics = Omit<
  MetadataUiAuditPanelDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiAuditDiagnosticKey;
  sectionKey?: MetadataUiAuditDiagnosticKey;
  rendererKey?: MetadataUiAuditDiagnosticKey;
  testId?: MetadataUiAuditDiagnosticKey;
};

export type MetadataUiAuditPanel = Omit<
  MetadataUiAuditPanelSchemaOutput,
  | "actions"
  | "diagnostics"
  | "emptyStateKey"
  | "events"
  | "key"
  | "permission"
  | "presentation"
  | "target"
> & {
  key: MetadataUiAuditPanelKey;
  target?: MetadataUiAuditTarget;
  events: MetadataUiAuditBoundedEvents;
  actions: MetadataUiAuditBoundedActions;
  emptyStateKey?: MetadataUiAuditPanelKey;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiAuditPanelDiagnostics;
};

export type MetadataUiAuditPanelParseResult =
  | {
      success: true;
      data: MetadataUiAuditPanel;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiAuditPanelInvariants(
  auditPanel: MetadataUiAuditPanelSchemaOutput,
): asserts auditPanel is MetadataUiAuditPanelSchemaOutput & MetadataUiAuditPanel {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(auditPanel.key)) {
    throw new Error("Audit panel keys must use lowercase kebab/dot notation.");
  }

  if (auditPanel.events.length > 100) {
    throw new Error("Audit panels may declare at most one hundred events.");
  }

  if (auditPanel.actions.length > 6) {
    throw new Error("Audit panels may declare at most six actions.");
  }
}

export function parseMetadataUiAuditPanel(
  input: unknown,
): MetadataUiAuditPanel {
  const auditPanel = METADATA_UI_AUDIT_PANEL_SCHEMA.parse(input);
  assertMetadataUiAuditPanelInvariants(auditPanel);
  return auditPanel;
}

export function safeParseMetadataUiAuditPanel(
  input: unknown,
): MetadataUiAuditPanelParseResult {
  const result = METADATA_UI_AUDIT_PANEL_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiAuditPanelInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
