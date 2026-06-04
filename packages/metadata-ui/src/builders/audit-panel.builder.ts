import { z } from "zod";

import {
  METADATA_UI_AUDIT_EVENT_SCHEMA,
  METADATA_UI_AUDIT_PANEL_ACTION_SCHEMA,
  METADATA_UI_AUDIT_PANEL_SCHEMA,
  parseMetadataUiAuditPanel,
  type MetadataUiAuditEvent,
  type MetadataUiAuditEventForTone,
  type MetadataUiAuditEventInput,
  type MetadataUiAuditEventTone,
  type MetadataUiAuditPanel,
  type MetadataUiAuditPanelAction,
  type MetadataUiAuditPanelActionForPlacement,
  type MetadataUiAuditPanelActionInput,
  type MetadataUiAuditPanelActionPlacement,
  type MetadataUiAuditPanelInput,
} from "../schemas/audit-panel.schema";

type MetadataUiAuditPanelSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type AuditPanelBuilderInput = Omit<
  MetadataUiAuditPanelInput,
  MetadataUiAuditPanelSystemFields
>;

export type MetadataUiAuditPanelBuilderResult<
  Input extends AuditPanelBuilderInput,
> = MetadataUiAuditPanel & {
  key: Input["key"];
};

export type MetadataUiAuditEventBuilderResult<
  Input extends MetadataUiAuditEventInput,
> = Input extends {
  tone?: infer Tone extends MetadataUiAuditEventTone;
}
  ? MetadataUiAuditEventForTone<Tone>
  : MetadataUiAuditEvent;

export type MetadataUiAuditPanelActionBuilderResult<
  Input extends MetadataUiAuditPanelActionInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiAuditPanelActionPlacement;
}
  ? MetadataUiAuditPanelActionForPlacement<Placement>
  : MetadataUiAuditPanelAction;

export type MetadataUiAuditPanelBasicInput<
  Key extends string = string,
  Events extends readonly MetadataUiAuditEventInput[] = MetadataUiAuditEventInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  events?: Events;
};

export type MetadataUiAuditPanelSafeCreateResult<
  Data extends MetadataUiAuditPanel = MetadataUiAuditPanel,
> =
  | {
      success: true;
      data: Data;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

export function createAuditPanel<const Input extends AuditPanelBuilderInput>(
  input: Input,
): MetadataUiAuditPanelBuilderResult<Input> {
  return parseMetadataUiAuditPanel(
    input,
  ) as MetadataUiAuditPanelBuilderResult<Input>;
}

export function createAuditTrailPanel<
  const Input extends MetadataUiAuditPanelBasicInput,
>(input: Input): MetadataUiAuditPanelBuilderResult<{
  key: Input["key"];
  title: string;
  events: Input["events"] extends readonly MetadataUiAuditEventInput[]
    ? Input["events"]
    : [];
}> {
  return createAuditPanel({
    key: input.key,
    title: input.title ?? "Audit trail",
    description: input.description,
    events: input.events ?? [],
    actions: [],
  });
}

export function createAuditEvent<const Input extends MetadataUiAuditEventInput>(
  input: Input,
): MetadataUiAuditEventBuilderResult<Input> {
  return METADATA_UI_AUDIT_EVENT_SCHEMA.parse(
    input,
  ) as MetadataUiAuditEventBuilderResult<Input>;
}

export function createAuditPanelAction<
  const Input extends MetadataUiAuditPanelActionInput,
>(input: Input): MetadataUiAuditPanelActionBuilderResult<Input> {
  return METADATA_UI_AUDIT_PANEL_ACTION_SCHEMA.parse(
    input,
  ) as MetadataUiAuditPanelActionBuilderResult<Input>;
}

export function withAuditPanelEvents(
  panel: MetadataUiAuditPanelInput,
  events: MetadataUiAuditEventInput[],
): MetadataUiAuditPanel {
  return createAuditPanel({
    ...panel,
    events,
  });
}

export function appendAuditPanelEvent(
  panel: MetadataUiAuditPanelInput,
  event: MetadataUiAuditEventInput,
): MetadataUiAuditPanel {
  return createAuditPanel({
    ...panel,
    events: [...(panel.events ?? []), event],
  });
}

export function withAuditPanelActions(
  panel: MetadataUiAuditPanelInput,
  actions: MetadataUiAuditPanelActionInput[],
): MetadataUiAuditPanel {
  return createAuditPanel({
    ...panel,
    actions,
  });
}

export function appendAuditPanelAction(
  panel: MetadataUiAuditPanelInput,
  action: MetadataUiAuditPanelActionInput,
): MetadataUiAuditPanel {
  return createAuditPanel({
    ...panel,
    actions: [...(panel.actions ?? []), action],
  });
}

export function safeCreateAuditPanel(
  input: unknown,
): MetadataUiAuditPanelSafeCreateResult {
  const result = METADATA_UI_AUDIT_PANEL_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiAuditPanel(result.data),
  };
}
