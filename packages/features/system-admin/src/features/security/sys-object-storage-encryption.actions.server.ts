"use server";

import {
  getOrganizationEncryptionSettings,
  updateOrganizationEncryptionSettings,
} from "@afenda/db";
import { getAwsKmsEnv, getVaultEnv } from "@afenda/config/env";
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
import { requireSystemAdminSecurityManage } from "./sys-security.policy.server";
import {
  mapEncryptionSettingsToColumns,
  updateOrganizationEncryptionSettingsInputSchema,
} from "./sys-object-storage-encryption.schema";
import { systemAdminSecurityAuditActions } from "./sys-security.event";

export async function updateOrganizationEncryptionSettingsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminSecurityManage();

  const parsed = updateOrganizationEncryptionSettingsInputSchema.safeParse({
    encryptionMode: formData.get("encryptionMode"),
    kmsAdapter: formData.get("kmsAdapter"),
    kmsKeyRef: formData.get("kmsKeyRef"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const previous = await getOrganizationEncryptionSettings({
    organizationId: organization.id,
  });
  const next = mapEncryptionSettingsToColumns(parsed.data);

  if (
    previous.mode === next.encryptionMode &&
    previous.kmsAdapter === next.kmsAdapter &&
    (previous.kmsKeyRef ?? "") === (next.kmsKeyRef ?? "")
  ) {
    return systemAdminActionSuccess(undefined);
  }

  if (next.encryptionMode === "customer-managed") {
    if (next.kmsAdapter === "vault-transit" && !getVaultEnv().configured) {
      return systemAdminActionFailure(
        "Vault Transit is not configured for this deployment.",
      );
    }

    if (next.kmsAdapter === "aws-kms" && !getAwsKmsEnv().configured) {
      return systemAdminActionFailure(
        "AWS KMS is not configured for this deployment.",
      );
    }
  }

  await updateOrganizationEncryptionSettings({
    organizationId: organization.id,
    encryptionMode: next.encryptionMode,
    kmsAdapter: next.kmsAdapter,
    kmsKeyRef: next.kmsKeyRef,
  });

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType as ExecutionActorType,
    action: systemAdminSecurityAuditActions.encryptionSettingsUpdate,
    targetType: "organization",
    targetId: organization.id,
    metadata: {
      previous,
      next,
      actorUserId: session.id,
    },
  });

  revalidatePath(systemAdminRoutePaths.security);
  return systemAdminActionSuccess(undefined);
}
