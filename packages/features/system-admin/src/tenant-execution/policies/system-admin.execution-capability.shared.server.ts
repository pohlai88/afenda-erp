import {
  getExecutionCapability,
  listExecutionCapabilities,
} from "@afenda/kernel/execution-capabilities";

export function resolveExecutionCapabilityForAction(action: string) {
  const direct = getExecutionCapability(action);
  if (direct) {
    return direct;
  }

  return (
    listExecutionCapabilities().find(
      (capability) => capability.requiredPermission === action,
    ) ?? null
  );
}
