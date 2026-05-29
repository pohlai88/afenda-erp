"use server";

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import { dispatchSystemAdminWebhook } from "../../integrations/server";
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
  systemAdminDeprecateRoleInputSchema,
  systemAdminReactivateRoleInputSchema,
  systemAdminRemoveRoleAssignmentInputSchema,
  systemAdminUpdateRoleInputSchema,
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

export async function updateSystemAdminRoleForm(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminRolesManage();
  const parsed = systemAdminUpdateRoleInputSchema.safeParse({
    role: formData.get("role"),
    displayName: formData.get("displayName"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  if (parsed.data.role === "owner") {
    return systemAdminActionFailure(
      "Owner role metadata cannot be edited from System Admin.",
    );
  }

  const { upsertTenantRoleCatalogEntry } = await import("@afenda/db");

  try {
    await upsertTenantRoleCatalogEntry({
      organizationId: organization.id,
      role: parsed.data.role,
      displayName: parsed.data.displayName,
      description: parsed.data.description ?? null,
      actorAuthUserId: context.userId,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role update failed.",
    );
  }

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.role.update",
    targetType: "role",
    targetId: parsed.data.role,
    metadata: {
      displayName: parsed.data.displayName,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath("/system-admin/roles");
  revalidatePath("/system-admin/identity");
  return systemAdminActionSuccess(undefined);
}

export async function deprecateSystemAdminRoleForm(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminRolesManage();
  const parsed = systemAdminDeprecateRoleInputSchema.safeParse({
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  if (parsed.data.role === "owner" || parsed.data.role === "admin") {
    return systemAdminActionFailure(
      "Owner and admin roles cannot be deprecated.",
    );
  }

  const { upsertTenantRoleCatalogEntry } = await import("@afenda/db");

  try {
    await upsertTenantRoleCatalogEntry({
      organizationId: organization.id,
      role: parsed.data.role,
      deprecated: true,
      actorAuthUserId: context.userId,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role deprecation failed.",
    );
  }

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.role.deprecate",
    targetType: "role",
    targetId: parsed.data.role,
  });

  revalidatePath("/system-admin/roles");
  return systemAdminActionSuccess(undefined);
}

export async function reactivateSystemAdminRoleForm(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminRolesManage();
  const parsed = systemAdminReactivateRoleInputSchema.safeParse({
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { upsertTenantRoleCatalogEntry } = await import("@afenda/db");

  try {
    await upsertTenantRoleCatalogEntry({
      organizationId: organization.id,
      role: parsed.data.role,
      deprecated: false,
      actorAuthUserId: context.userId,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role reactivation failed.",
    );
  }

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.role.reactivate",
    targetType: "role",
    targetId: parsed.data.role,
  });

  revalidatePath("/system-admin/roles");
  return systemAdminActionSuccess(undefined);
}
