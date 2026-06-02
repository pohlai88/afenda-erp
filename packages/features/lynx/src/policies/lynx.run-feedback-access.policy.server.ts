import { assertCapabilityAllowed } from "@afenda/ai/server";

const LYNX_RUN_FEEDBACK_CAPABILITY = "system-admin.lynx.read" as const;

export function assertLynxRunFeedbackAccess(input: {
  capabilities: readonly string[];
}) {
  assertCapabilityAllowed({
    capability: LYNX_RUN_FEEDBACK_CAPABILITY,
    capabilities: input.capabilities,
  });
}
