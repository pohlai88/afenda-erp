import { z } from "zod";

import {
  METADATA_UI_EMPTY_STATE_ACTION_SCHEMA,
  METADATA_UI_EMPTY_STATE_SCHEMA,
  parseMetadataUiEmptyState,
  type MetadataUiEmptyState,
  type MetadataUiEmptyStateAction,
  type MetadataUiEmptyStateActionForPlacement,
  type MetadataUiEmptyStateActionInput,
  type MetadataUiEmptyStateActionPlacement,
  type MetadataUiEmptyStateForKind,
  type MetadataUiEmptyStateInput,
  type MetadataUiEmptyStateKind,
  type MetadataUiEmptyStateTone,
} from "../schemas/empty-state.schema";

type MetadataUiEmptyStateSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type EmptyStateBuilderInput = Omit<
  MetadataUiEmptyStateInput,
  MetadataUiEmptyStateSystemFields
>;

export type MetadataUiEmptyStateBuilderInputForKind<
  Kind extends MetadataUiEmptyStateKind,
> = Omit<EmptyStateBuilderInput, "kind"> & {
  kind?: Kind;
};

export type MetadataUiEmptyStateBuilderResult<
  Input extends EmptyStateBuilderInput,
> = Input extends {
  kind?: infer Kind extends MetadataUiEmptyStateKind;
}
  ? MetadataUiEmptyStateForKind<Kind>
  : MetadataUiEmptyState;

export type MetadataUiEmptyStateActionBuilderResult<
  Input extends MetadataUiEmptyStateActionInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiEmptyStateActionPlacement;
}
  ? MetadataUiEmptyStateActionForPlacement<Placement>
  : MetadataUiEmptyStateAction;

export type MetadataUiEmptyStateBasicInput<
  Key extends string = string,
  Title extends string = string,
> = {
  key: Key;
  title?: Title;
  description?: string;
};

export type MetadataUiSimpleEmptyStateInput<
  Key extends string = string,
  Title extends string = string,
> = {
  key: Key;
  title: Title;
  description?: string;
};

export type MetadataUiEmptyStateSafeCreateResult<
  Data extends MetadataUiEmptyState = MetadataUiEmptyState,
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

export function createEmptyState<const Input extends EmptyStateBuilderInput>(
  input: Input,
): MetadataUiEmptyStateBuilderResult<Input> {
  return parseMetadataUiEmptyState(
    input,
  ) as MetadataUiEmptyStateBuilderResult<Input>;
}

export function createSimpleEmptyState<
  const Input extends MetadataUiSimpleEmptyStateInput,
>(input: Input): MetadataUiEmptyStateForKind<"empty"> {
  return createEmptyState({
    key: input.key,
    title: input.title,
    description: input.description,
    kind: "empty",
    tone: "neutral",
    actions: [],
  });
}

export function createNoResultsState<
  const Input extends MetadataUiEmptyStateBasicInput,
>(input: Input): MetadataUiEmptyStateForKind<"no-results"> {
  return createEmptyState({
    key: input.key,
    kind: "no-results",
    tone: "info",
    title: input.title ?? "No matching results",
    description:
      input.description ??
      "Try adjusting filters or search criteria.",
    actions: [],
  });
}

export function createForbiddenState<
  const Input extends MetadataUiEmptyStateBasicInput,
>(input: Input): MetadataUiEmptyStateForKind<"forbidden"> {
  return createEmptyState({
    key: input.key,
    kind: "forbidden",
    tone: "warning",
    title: input.title ?? "Access denied",
    description:
      input.description ??
      "You do not have permission to access this information.",
    actions: [],
  });
}

export function createErrorState<
  const Input extends MetadataUiEmptyStateBasicInput,
>(input: Input): MetadataUiEmptyStateForKind<"error"> {
  return createEmptyState({
    key: input.key,
    kind: "error",
    tone: "critical",
    title: input.title ?? "Something went wrong",
    description:
      input.description ??
      "The requested information could not be displayed.",
    actions: [],
  });
}

export function createNotConfiguredState<
  const Input extends MetadataUiEmptyStateBasicInput,
>(input: Input): MetadataUiEmptyStateForKind<"not-configured"> {
  return createEmptyState({
    key: input.key,
    kind: "not-configured",
    tone: "warning",
    title: input.title ?? "Configuration required",
    description:
      input.description ??
      "Additional setup is required before this feature can be used.",
    actions: [],
  });
}

export function createEmptyStateAction<
  const Input extends MetadataUiEmptyStateActionInput,
>(input: Input): MetadataUiEmptyStateActionBuilderResult<Input> {
  return METADATA_UI_EMPTY_STATE_ACTION_SCHEMA.parse(
    input,
  ) as MetadataUiEmptyStateActionBuilderResult<Input>;
}

export function withEmptyStateActions(
  state: MetadataUiEmptyStateInput,
  actions: MetadataUiEmptyStateActionInput[],
): MetadataUiEmptyState {
  return createEmptyState({
    ...state,
    actions,
  });
}

export function withEmptyStateTone<const Tone extends MetadataUiEmptyStateTone>(
  state: MetadataUiEmptyStateInput,
  tone: Tone,
): MetadataUiEmptyState & { tone: Tone } {
  return createEmptyState({
    ...state,
    tone,
  }) as MetadataUiEmptyState & { tone: Tone };
}

export function withEmptyStateKind<const Kind extends MetadataUiEmptyStateKind>(
  state: MetadataUiEmptyStateInput,
  kind: Kind,
): MetadataUiEmptyStateForKind<Kind> {
  return createEmptyState({
    ...state,
    kind,
  });
}

export function safeCreateEmptyState(
  input: unknown,
): MetadataUiEmptyStateSafeCreateResult {
  const result =
    METADATA_UI_EMPTY_STATE_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiEmptyState(result.data),
  };
}
