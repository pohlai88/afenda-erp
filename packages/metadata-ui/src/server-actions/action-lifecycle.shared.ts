import type {
  MetadataUiActionContract,
  MetadataUiActionLifecycleState,
} from "../contracts/action.contract";

export type MetadataUiResolvedActionLifecycle = Readonly<{
  state: MetadataUiActionLifecycleState;
  label?: string;
  feedback?: string;
  reason?: string;
  liveRegion: "off" | "polite" | "assertive";
  disabled: boolean;
  disabledReason?: string;
}>;

const METADATA_UI_ACTION_STATE_LABEL = {
  idle: undefined,
  pending: "Pending",
  succeeded: "Succeeded",
  failed: "Failed",
  blocked: "Blocked",
} as const satisfies Record<MetadataUiActionLifecycleState, string | undefined>;

function getMetadataUiLifecycleFeedback(
  action: MetadataUiActionContract | undefined,
  state: MetadataUiActionLifecycleState,
) {
  if (state === "idle") {
    return undefined;
  }

  return action?.lifecycle?.feedback[state];
}

export function resolveMetadataUiActionLifecycle(
  action: MetadataUiActionContract | undefined,
  input: Readonly<{
    state?: MetadataUiActionLifecycleState;
    disabled?: boolean;
    disabledReason?: string;
  }> = {},
): MetadataUiResolvedActionLifecycle {
  const state = input.state ?? action?.lifecycle?.state ?? "idle";
  const feedback = getMetadataUiLifecycleFeedback(action, state);
  const reason =
    action?.lifecycle?.reason ??
    feedback?.description ??
    input.disabledReason ??
    action?.disabledReason;
  const disabledReason =
    state === "blocked"
      ? reason ?? "This action is blocked."
      : input.disabledReason ?? action?.disabledReason;

  return {
    state,
    label: feedback?.label ?? METADATA_UI_ACTION_STATE_LABEL[state],
    feedback:
      feedback?.placement === "silent"
        ? undefined
        : feedback?.description ?? (state === "blocked" ? disabledReason : reason),
    reason,
    liveRegion: action?.lifecycle?.liveRegion ?? "polite",
    disabled:
      Boolean(input.disabled) ||
      action?.visibility === "disabled" ||
      state === "pending" ||
      state === "blocked",
    disabledReason,
  };
}
