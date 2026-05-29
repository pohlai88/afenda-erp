"use server";

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import { dispatchSystemAdminWebhook } from "../../integrations";
import { systemAdminMembershipWebhookEvents } from "../../memberships/events/system-admin.memberships.event";
import {
  requireSystemAdminRolesManage,
} from "../../overview/policies/system-admin.capability.policy.server";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import {
  systemAdminAssignRoleInputSchema,
  systemAdminRemoveRoleAssignmentInputSchema,
} from "../schemas/system-admin.roles.schema";

export async function assignSystemAdminRole(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminRolesManage();
  const parsed = systemAdminAssignRoleInputSchema.safeParse({
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { assignRoleToMembership } = await import(
    "../data/system-admin.roles.query.server"
  );

  try {
    await assignRoleToMembership({
      organizationId: organization.id,
      actorId: context.userId,
      membershipId: parsed.data.membershipId,
      role: parsed.data.role,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role assignment failed.",
    );
  }

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.role_assignment.create",
    targetType: "membership",
    targetId: parsed.data.membershipId,
    metadata: { role: parsed.data.role },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: context.userId,
    eventType: systemAdminMembershipWebhookEvents[0],
    payload: {
      membershipId: parsed.data.membershipId,
      role: parsed.data.role,
    },
  });

  revalidatePath("/system-admin/roles");
  revalidatePath("/system-admin/memberships");
  revalidatePath("/system-admin/identity");
  return systemAdminActionSuccess(undefined);
}

export async function removeSystemAdminRoleAssignmentForm(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminRolesManage();
  const parsed = systemAdminRemoveRoleAssignmentInputSchema.safeParse({
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { removeRoleFromMembership } = await import(
    "../data/system-admin.roles.query.server"
  );

  try {
    await removeRoleFromMembership({
      organizationId: organization.id,
      actorId: context.userId,
      membershipId: parsed.data.membershipId,
      role: parsed.data.role,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role removal failed.",
    );
  }

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.role_assignment.remove",
    targetType: "membership",
    targetId: parsed.data.membershipId,
    metadata: { role: parsed.data.role },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: context.userId,
    eventType: systemAdminMembershipWebhookEvents[0],
    payload: {
      membershipId: parsed.data.membershipId,
      role: parsed.data.role,
    },
  });

  revalidatePath("/system-admin/memberships");
  revalidatePath("/system-admin/roles");
  return systemAdminActionSuccess(undefined);
}
