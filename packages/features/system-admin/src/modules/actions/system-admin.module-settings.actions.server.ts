"use server";

import {
  listTenantModuleSettings,
  upsertTenantModuleSettings,
} from "@afenda/db";
import type { ModuleId } from "@afenda/config/module-ids";
import {
  writeExecutionAuditEvent,
  type ExecutionContext,
} from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { dispatchSystemAdminWebhook } from "../../integrations/events/system-admin.webhook-dispatch.event";
import {
  formatModuleDependencyIssue,
  listDisabledModuleDependencyKeys,
  SYSTEM_ADMIN_PROTECTED_MODULE_KEY,
} from "../contracts";
import { requireSystemAdminModulesManage } from "../policies/system-admin.modules.policy.server";
import {
  resolveSystemAdminModuleAuditAction,
  systemAdminModuleWebhookEvents,
} from "../events/system-admin.modules.event";
import { systemAdminModuleSettingsActionSchema } from "../schemas/system-admin.module-settings.schema";

const setModuleEnabledInputSchema = z.object({
  moduleKey: z.string().trim().min(1).max(80),
  enabled: z.boolean(),
});

function revalidateSystemAdminPaths(...paths: readonly string[]) {
  revalidatePath(systemAdminRoutePaths.hub);
  for (const path of paths) {
    revalidatePath(path);
  }
}

async function persistSystemAdminModuleSettings(input: {
  organizationId: string;
  actorAuthUserId: string;
  actorId: string;
  actorType: ExecutionContext["actorType"];
  moduleKey: string;
  enabled: boolean;
  visible: boolean;
  readiness: "preview" | "active" | "blocked" | "deprecated";
  existingSettings: Awaited<ReturnType<typeof listTenantModuleSettings>>;
}): Promise<SystemAdminActionResult> {
  if (
    input.moduleKey === SYSTEM_ADMIN_PROTECTED_MODULE_KEY &&
    (!input.enabled ||
      input.readiness === "blocked" ||
      input.readiness === "deprecated")
  ) {
    return systemAdminActionFailure(
      "System Admin cannot be disabled or blocked for this organization.",
    );
  }

  if (input.enabled) {
    const disabledDependencies = listDisabledModuleDependencyKeys({
      moduleKey: input.moduleKey as ModuleId,
      settings: input.existingSettings,
    });
    const dependencyIssue = formatModuleDependencyIssue(disabledDependencies);
    if (dependencyIssue) {
      return systemAdminActionFailure(dependencyIssue);
    }
  }

  const previous = input.existingSettings.find(
    (setting) => setting.moduleKey === input.moduleKey,
  );
  const next = {
    moduleKey: input.moduleKey,
    enabled: input.enabled,
    visible: input.visible,
    readiness: input.readiness,
  };

  await upsertTenantModuleSettings({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    ...next,
    configuration: previous?.configuration ?? {},
  });
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: resolveSystemAdminModuleAuditAction({
      previous: previous
        ? {
            enabled: previous.enabled,
            visible: previous.visible,
            readiness: previous.readiness,
          }
        : null,
      next,
    }),
    targetType: "module",
    targetId: input.moduleKey,
    metadata: {
      previous: previous
        ? {
            enabled: previous.enabled,
            visible: previous.visible,
            readiness: previous.readiness,
          }
        : null,
      next,
    },
  });
  await dispatchSystemAdminWebhook({
    organizationId: input.organizationId,
    userId: input.actorAuthUserId,
    eventType: systemAdminModuleWebhookEvents[0],
    payload: next,
  });
  logServerEvent("info", "System admin module settings updated.", {
    organizationId: input.organizationId,
    userId: input.actorAuthUserId,
    module: "system-admin",
    operation: "modules.update",
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.modules);
  revalidatePath("/");
  return systemAdminActionSuccess(undefined);
}

export async function setSystemAdminModuleEnabledAction(input: {
  moduleKey: string;
  enabled: boolean;
}): Promise<SystemAdminActionResult> {
  const parsed = setModuleEnabledInputSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { context, organization, session } =
    await requireSystemAdminModulesManage();
  const existingSettings = await listTenantModuleSettings({
    organizationId: organization.id,
    limit: 100,
  });
  const previous = existingSettings.find(
    (setting) => setting.moduleKey === parsed.data.moduleKey,
  );

  return persistSystemAdminModuleSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    actorId: context.userId,
    actorType: context.actorType,
    moduleKey: parsed.data.moduleKey,
    enabled: parsed.data.enabled,
    visible: previous?.visible ?? true,
    readiness: previous?.readiness ?? "active",
    existingSettings,
  });
}

export async function updateSystemAdminModuleSettingsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminModulesManage();
  const parsed = systemAdminModuleSettingsActionSchema.safeParse({
    moduleKey: formData.get("moduleKey"),
    enabled: formData.get("enabled"),
    visible: formData.get("visible"),
    readiness: formData.get("readiness"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const existingSettings = await listTenantModuleSettings({
    organizationId: organization.id,
    limit: 100,
  });

  return persistSystemAdminModuleSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    actorId: context.userId,
    actorType: context.actorType,
    existingSettings,
    ...parsed.data,
  });
}
