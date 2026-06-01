import type { ExecutionCapability } from "@afenda/kernel/execution-capabilities";

const SENSITIVE_CAPABILITY_SUFFIXES = [
  ".manage",
  ".write",
  ".export",
  ".approve",
  ".run",
  ".cancel",
] as const;

export function isCriticalExecutionCapability(capability: ExecutionCapability) {
  return SENSITIVE_CAPABILITY_SUFFIXES.some((suffix) =>
    capability.requiredPermission.endsWith(suffix),
  );
}
