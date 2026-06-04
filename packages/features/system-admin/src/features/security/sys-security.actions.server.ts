"use server";

import { updateTenantSecuritySettings } from "@afenda/db";
import {
  writeExecutionAuditEvent,
  type ExecutionActorType,
} from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../tenant-execution/sys-action-result.contract";
import { systemAdminRoutePaths } from "../overview/sys-route-paths.contract";
import { dispatchSystemAdminWebhook } from "../integrations/sys-webhook-dispatch.event";
import { requireSystemAdminSecurityManage } from "./sys-security.policy.server";
import {
  assertSecuritySettingsDowngradeGuard,
  updateSecuritySettingsInputSchema,
} from "./sys-security.schema";
import {
  diffSecurityDomainChanges,
  getSystemAdminOrganizationSecuritySettings,
  mapParsedSecurityInputToOrganizationSettings,
} from "./sys-security.query.server";
import { mapOrganizationSecurityToTenantPatch } from "./sys-security.mapper";
import { redactAuditMetadata } from "../audit-viewer/sys-audit-metadata.redact.shared";
import {
  systemAdminSecurityAuditActions,
  systemAdminSecurityWebhookEvents,
} from "./sys-security.event";

async function writeSecurityAudit(input: {
  organizationId: string;
  actorId: string;
  actorType: ExecutionActorType;
  action: string;
  metadata: Record<string, unknown>;
}) {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: input.action,
    targetType: "organization_security_settings",
    targetId: input.organizationId,
    metadata: input.metadata,
  });
}

export async function updateSystemAdminSecuritySettingsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminSecurityManage();

  const parsed = updateSecuritySettingsInputSchema.safeParse({
    requireMfaForAdmins: formData.get("requireMfaForAdmins"),
    allowedEmailDomains: formData.get("allowedEmailDomains"),
    sessionMaxAgeMinutes: formData.get("sessionMaxAgeMinutes"),
    idleTimeoutMinutes: formData.get("idleTimeoutMinutes"),
    requireSensitiveActionConfirmation: formData.get(
      "requireSensitiveActionConfirmation",
    ),
    restrictInvitesToAllowedDomains: formData.get(
      "restrictInvitesToAllowedDomains",
    ),
    adminLockoutProtectionEnabled: formData.get("adminLockoutProtectionEnabled"),
    confirmDisableLockoutProtection: formData.get(
      "confirmDisableLockoutProtection",
    ),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const previous = await getSystemAdminOrganizationSecuritySettings({
    organizationId: organization.id,
  });

  if (!previous) {
    return systemAdminActionFailure("Security settings are not initialized.");
  }

  const downgradeError = assertSecuritySettingsDowngradeGuard({
    parsed: parsed.data,
    previous,
  });

  if (downgradeError) {
    return systemAdminActionFailure(downgradeError);
  }

  const next = mapParsedSecurityInputToOrganizationSettings({
    organizationId: organization.id,
    actorUserId: session.id,
    parsed: parsed.data,
  });

  await updateTenantSecuritySettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    patch: mapOrganizationSecurityToTenantPatch(next),
    recordAuditLog: false,
  });

  await writeSecurityAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminSecurityAuditActions.update,
    metadata: {
      previous: redactAuditMetadata(previous),
      next: redactAuditMetadata(parsed.data),
    },
  });

  if (previous.requireMfaForAdmins !== next.requireMfaForAdmins) {
    await writeSecurityAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminSecurityAuditActions.mfaRequirementUpdate,
      metadata: {
        previous: previous.requireMfaForAdmins,
        next: next.requireMfaForAdmins,
      },
    });
  }

  if (
    previous.sessionMaxAgeMinutes !== next.sessionMaxAgeMinutes ||
    previous.idleTimeoutMinutes !== next.idleTimeoutMinutes
  ) {
    await writeSecurityAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminSecurityAuditActions.sessionPolicyUpdate,
      metadata: {
        previous: {
          sessionMaxAgeMinutes: previous.sessionMaxAgeMinutes,
          idleTimeoutMinutes: previous.idleTimeoutMinutes,
        },
        next: {
          sessionMaxAgeMinutes: next.sessionMaxAgeMinutes,
          idleTimeoutMinutes: next.idleTimeoutMinutes,
        },
      },
    });
  }

  const domainDiff = diffSecurityDomainChanges({ previous, next });
  for (const domain of domainDiff.added) {
    await writeSecurityAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminSecurityAuditActions.domainAdd,
      metadata: { domain },
    });
  }
  for (const domain of domainDiff.removed) {
    await writeSecurityAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminSecurityAuditActions.domainRemove,
      metadata: { domain },
    });
  }

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminSecurityWebhookEvents[0],
    payload: parsed.data,
  });

  revalidatePath(systemAdminRoutePaths.security);
  return systemAdminActionSuccess(undefined);
}
