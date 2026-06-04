"use server";

import {
  getOrganizationObjectStorageProvider,
  updateOrganizationObjectStorageProvider,
} from "@afenda/db";
import { assertObjectStorageConfigured } from "@afenda/object-storage/server";
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
  mapObjectStorageProviderPreferenceToColumn,
  updateOrganizationObjectStorageProviderInputSchema,
} from "./sys-object-storage-provider.schema";
import { systemAdminSecurityAuditActions } from "./sys-security.event";

export async function updateOrganizationObjectStorageProviderAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminSecurityManage();

  const parsed = updateOrganizationObjectStorageProviderInputSchema.safeParse({
    objectStorageProvider: formData.get("objectStorageProvider"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const previous = await getOrganizationObjectStorageProvider({
    organizationId: organization.id,
  });
  const next = mapObjectStorageProviderPreferenceToColumn(
    parsed.data.objectStorageProvider,
  );

  if (previous === next) {
    return systemAdminActionSuccess(undefined);
  }

  const objectStorageEnv = assertObjectStorageConfigured();

  if (next === "r2" && (!objectStorageEnv.configured || !objectStorageEnv.r2)) {
    return systemAdminActionFailure(
      "Cloudflare R2 is not configured for this deployment.",
    );
  }

  if (
    next === "vercel-blob" &&
    (!objectStorageEnv.configured || !objectStorageEnv.vercelBlob?.BLOB_READ_WRITE_TOKEN)
  ) {
    return systemAdminActionFailure(
      "Vercel Blob is not configured for this deployment.",
    );
  }

  if (next === "s3" && (!objectStorageEnv.configured || !objectStorageEnv.s3)) {
    return systemAdminActionFailure(
      "Amazon S3 is not configured for this deployment.",
    );
  }

  await updateOrganizationObjectStorageProvider({
    organizationId: organization.id,
    objectStorageProvider: next,
  });

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType as ExecutionActorType,
    action: systemAdminSecurityAuditActions.objectStorageProviderUpdate,
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
