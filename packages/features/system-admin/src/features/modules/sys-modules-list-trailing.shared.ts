import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type { ModuleId } from "@afenda/config/module-ids";
import { SYSTEM_ADMIN_PROTECTED_MODULE_KEY, type SystemAdminModuleAvailability } from "./sys-modules.contract";
import { systemAdminCriticalModuleKeys } from "./sys-module-dependencies.contract";

export const SYSTEM_ADMIN_MODULES_MANAGE_DENIED =
  "Requires system-admin.modules.manage.";

export function resolveSystemAdminModuleRowTrailingAction(input: {
  moduleKey: ModuleId;
  availability: SystemAdminModuleAvailability;
  canMutate: boolean;
  lifecycleStatus?: string;
}) {
  const nextEnabled = input.availability === "disabled";
  const isProtected = input.moduleKey === SYSTEM_ADMIN_PROTECTED_MODULE_KEY;
  const isCritical = (
    systemAdminCriticalModuleKeys as readonly ModuleId[]
  ).includes(input.moduleKey);
  const isDeprecated = input.lifecycleStatus === "deprecated";

  if (isProtected) {
    return resolveListSurfaceRowTrailingAction({
      visible: true,
      allowed: false,
      disabledReason: "System Admin cannot be disabled for this organization.",
      descriptor: {
        id: "system-admin.module.protected",
        label: "Protected",
        intent: "default",
      },
    });
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canMutate,
    disabledReason: SYSTEM_ADMIN_MODULES_MANAGE_DENIED,
    descriptor: {
      id: nextEnabled
        ? "system-admin.module.enable"
        : "system-admin.module.disable",
      label: nextEnabled ? "Enable" : "Disable",
      intent: nextEnabled ? "default" : "destructive",
      confirm:
        !nextEnabled && isCritical
          ? {
              title: "Disable critical module",
              description:
                "Disabling this module removes normal navigation entry points. Execution Kernel access rules still apply.",
              confirmLabel: "Disable module",
            }
          : nextEnabled && isDeprecated
            ? {
                title: "Enable deprecated module",
                description:
                  "This module is marked deprecated. New rollout is discouraged; confirm before enabling.",
                confirmLabel: "Enable module",
              }
            : undefined,
    },
  });
}
