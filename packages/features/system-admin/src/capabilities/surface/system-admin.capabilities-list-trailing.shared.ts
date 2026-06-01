import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import { getExecutionCapability } from "@afenda/kernel/execution-capabilities";
import type { SystemAdminCapabilityAvailability } from "../contracts";
import {
  isCriticalExecutionCapability,
  SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION,
} from "../contracts/system-admin.capability-safety.contract";

export const SYSTEM_ADMIN_CAPABILITIES_MANAGE_DENIED =
  "Requires system-admin.capabilities.manage.";

export function resolveSystemAdminCapabilityRowTrailingAction(input: {
  capabilityKey: string;
  availability: SystemAdminCapabilityAvailability;
  canMutate: boolean;
}) {
  const capability = getExecutionCapability(input.capabilityKey);
  const nextAvailability: SystemAdminCapabilityAvailability =
    input.availability === "disabled" ? "enabled" : "disabled";
  const isProtected =
    capability?.requiredPermission === SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION;
  const isCritical = capability
    ? isCriticalExecutionCapability(capability)
    : false;
  const isDeprecated = capability?.status === "deprecated";

  if (isProtected && nextAvailability === "disabled") {
    return resolveListSurfaceRowTrailingAction({
      visible: true,
      allowed: false,
      disabledReason:
        "System Admin settings read cannot be disabled for this organization.",
      descriptor: {
        id: "system-admin.capability.protected",
        label: "Protected",
        intent: "default",
      },
    });
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canMutate,
    disabledReason: SYSTEM_ADMIN_CAPABILITIES_MANAGE_DENIED,
    descriptor: {
      id:
        nextAvailability === "enabled"
          ? "system-admin.capability.enable"
          : "system-admin.capability.disable",
      label: nextAvailability === "enabled" ? "Enable" : "Disable",
      intent: nextAvailability === "enabled" ? "default" : "destructive",
      confirm:
        nextAvailability === "disabled" && isCritical
          ? {
              title: "Disable critical capability",
              description:
                "Disabling this capability removes it from normal navigation. Execution Kernel enforcement still applies.",
              confirmLabel: "Disable capability",
            }
          : nextAvailability === "enabled" && isDeprecated
            ? {
                title: "Enable deprecated capability",
                description:
                  "This capability is deprecated in the execution kernel. Use the settings form for preview mode.",
                confirmLabel: "Enable capability",
              }
            : undefined,
    },
  });
}
