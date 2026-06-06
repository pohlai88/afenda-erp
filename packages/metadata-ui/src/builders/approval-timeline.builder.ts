import { z } from "zod";

import {
  METADATA_UI_APPROVAL_TIMELINE_SCHEMA,
  METADATA_UI_APPROVAL_TIMELINE_STEP_SCHEMA,
  parseMetadataUiApprovalTimeline,
  type MetadataUiApprovalTimeline,
  type MetadataUiApprovalTimelineInput,
  type MetadataUiApprovalTimelineStep,
  type MetadataUiApprovalTimelineStepForStatus,
  type MetadataUiApprovalTimelineStepInput,
  type MetadataUiApprovalTimelineStepStatus,
} from "../schemas/approval-timeline.schema";

type MetadataUiApprovalTimelineSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type ApprovalTimelineBuilderInput = Omit<
  MetadataUiApprovalTimelineInput,
  MetadataUiApprovalTimelineSystemFields
>;

export type MetadataUiApprovalTimelineBuilderResult<
  Input extends ApprovalTimelineBuilderInput,
> = MetadataUiApprovalTimeline & {
  key: Input["key"];
};

export type MetadataUiApprovalTimelineStepBuilderResult<
  Input extends MetadataUiApprovalTimelineStepInput,
> = Input extends {
  status: infer Status extends MetadataUiApprovalTimelineStepStatus;
}
  ? MetadataUiApprovalTimelineStepForStatus<Status>
  : MetadataUiApprovalTimelineStep;

export type MetadataUiApprovalTimelineBasicInput<
  Key extends string = string,
  Steps extends readonly MetadataUiApprovalTimelineStepInput[] = MetadataUiApprovalTimelineStepInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  steps?: Steps;
  currentStepKey?: Steps[number]["key"];
};

export type MetadataUiApprovalTimelineSafeCreateResult<
  Data extends MetadataUiApprovalTimeline = MetadataUiApprovalTimeline,
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

export type MetadataUiApprovalTimelineFlowBuilderResult<
  Input extends MetadataUiApprovalTimelineBasicInput,
> = MetadataUiApprovalTimelineBuilderResult<{
  key: Input["key"];
  title: string;
  steps: Input["steps"] extends readonly MetadataUiApprovalTimelineStepInput[]
    ? Input["steps"]
    : [];
  currentStepKey: Input["currentStepKey"];
}> &
  (Input extends {
    currentStepKey?: infer CurrentStepKey extends string;
  }
    ? {
        currentStepKey?: CurrentStepKey;
      }
    : object);

export function createApprovalTimeline<
  const Input extends ApprovalTimelineBuilderInput,
>(input: Input): MetadataUiApprovalTimelineBuilderResult<Input> {
  return parseMetadataUiApprovalTimeline(
    input,
  ) as MetadataUiApprovalTimelineBuilderResult<Input>;
}

export function createApprovalFlowTimeline<
  const Input extends MetadataUiApprovalTimelineBasicInput,
>(input: Input): MetadataUiApprovalTimelineFlowBuilderResult<Input> {
  return createApprovalTimeline({
    key: input.key,
    title: input.title ?? "Approval timeline",
    description: input.description,
    steps: input.steps ?? [],
    currentStepKey: input.currentStepKey,
  }) as MetadataUiApprovalTimelineFlowBuilderResult<Input>;
}

export function createApprovalTimelineStep<
  const Input extends MetadataUiApprovalTimelineStepInput,
>(input: Input): MetadataUiApprovalTimelineStepBuilderResult<Input> {
  return METADATA_UI_APPROVAL_TIMELINE_STEP_SCHEMA.parse(
    input,
  ) as MetadataUiApprovalTimelineStepBuilderResult<Input>;
}

export function withApprovalTimelineSteps(
  timeline: MetadataUiApprovalTimelineInput,
  steps: MetadataUiApprovalTimelineStepInput[],
): MetadataUiApprovalTimeline {
  return createApprovalTimeline({
    ...timeline,
    steps,
  });
}

export function appendApprovalTimelineStep(
  timeline: MetadataUiApprovalTimelineInput,
  step: MetadataUiApprovalTimelineStepInput,
): MetadataUiApprovalTimeline {
  return createApprovalTimeline({
    ...timeline,
    steps: [...(timeline.steps ?? []), step],
  });
}

export function safeCreateApprovalTimeline(
  input: unknown,
): MetadataUiApprovalTimelineSafeCreateResult {
  const result = METADATA_UI_APPROVAL_TIMELINE_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiApprovalTimeline(result.data),
  };
}
