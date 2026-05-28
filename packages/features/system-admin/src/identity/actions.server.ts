"use server";

import { requireCapability } from "@afenda/auth/server";
import {
  organizationRoles,
  type OrganizationRole,
} from "@afenda/auth";
import {
  createOrganizationInvitation,
  revokeOrganizationInvitation,
  updateMembershipRole,
  upsertRoleOverride,
} from "@afenda/db";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  assertSystemAdminFormActionResult,
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../action-results";
import { isSystemAdminPermissionKey } from "../catalogs";
import type { InviteMemberActionData } from "../dtos";
import { dispatchSystemAdminWebhook } from "../webhooks.server";

const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(organizationRoles),
});

const roleChangeSchema = z.object({
  authUserId: z.string().min(1),
  role: z.enum(organizationRoles),
});

const overrideSchema = z.object({
  role: z.enum(organizationRoles),
  permissionKey: z
    .string()
    .min(1)
    .refine(isSystemAdminPermissionKey, "Select a catalog capability."),
  enabled: z.boolean(),
});

function logIdentityMutation(input: {
  operation: string;
  organizationId: string;
  userId: string;
  result: "success" | "failure";
  metadata?: Record<string, unknown>;
}) {
  logServerEvent(
    input.result === "success" ? "info" : "warn",
    `System admin identity mutation ${input.result}.`,
    {
      organizationId: input.organizationId,
      userId: input.userId,
      module: "system-admin",
      operation: input.operation,
    },
    input.metadata ?? {},
  );
}

export async function inviteMember(
  formData: FormData,
): Promise<SystemAdminActionResult<InviteMemberActionData>> {
  const { session, organization } = await requireCapability(
    "system-admin.identity.write",
  );

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    logIdentityMutation({
      operation: "identity.invite",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: { reason: "validation" },
    });
    return zodActionFailure(parsed.error);
  }

  const result = await createOrganizationInvitation({
    organizationId: organization.id,
    email: parsed.data.email,
    role: parsed.data.role,
    invitedByAuthUserId: session.id,
  });

  logIdentityMutation({
    operation: "identity.invite",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: { invitationId: result.invitationId, role: parsed.data.role },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "tenant.member.invited",
    payload: {
      invitationId: result.invitationId,
      email: parsed.data.email,
      role: parsed.data.role,
    },
  });

  revalidatePath("/system-admin/identity");
  return systemAdminActionSuccess(result);
}

export async function inviteMemberAction(
  _previous: SystemAdminActionResult<InviteMemberActionData> | undefined,
  formData: FormData,
) {
  return inviteMember(formData);
}

export async function inviteMemberForm(formData: FormData): Promise<void> {
  assertSystemAdminFormActionResult(await inviteMember(formData));
}

export async function revokeInvitation(
  invitationId: string,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireCapability(
    "system-admin.identity.write",
  );

  if (!invitationId.trim()) {
    return systemAdminActionFailure("Invitation id is required.", {
      invitationId: "Invitation id is required.",
    });
  }

  try {
    await revokeOrganizationInvitation({
      organizationId: organization.id,
      invitationId,
      actorAuthUserId: session.id,
    });
  } catch (error) {
    logIdentityMutation({
      operation: "identity.invitation.revoke",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: {
        invitationId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Invitation revoke failed.",
    );
  }

  logIdentityMutation({
    operation: "identity.invitation.revoke",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: { invitationId },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "tenant.invitation.revoked",
    payload: { invitationId },
  });

  revalidatePath("/system-admin/identity");
  return systemAdminActionSuccess(undefined);
}

export async function revokeInvitationForm(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "").trim();

  return revokeInvitation(invitationId);
}

export async function revokeInvitationFormAction(
  formData: FormData,
): Promise<void> {
  assertSystemAdminFormActionResult(await revokeInvitationForm(formData));
}

export async function changeMemberRoleByInput(input: {
  authUserId: string;
  role: OrganizationRole;
}): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireCapability(
    "system-admin.identity.write",
  );

  const parsed = roleChangeSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await updateMembershipRole({
      organizationId: organization.id,
      authUserId: parsed.data.authUserId,
      role: parsed.data.role as OrganizationRole,
      actorAuthUserId: session.id,
    });
  } catch (error) {
    logIdentityMutation({
      operation: "identity.member.role.update",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: {
        authUserId: parsed.data.authUserId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role update failed.",
    );
  }

  logIdentityMutation({
    operation: "identity.member.role.update",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: { authUserId: parsed.data.authUserId, role: parsed.data.role },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "tenant.role.changed",
    payload: {
      authUserId: parsed.data.authUserId,
      role: parsed.data.role,
    },
  });

  revalidatePath("/system-admin/identity");
  return systemAdminActionSuccess(undefined);
}

export async function changeMemberRole(formData: FormData) {
  const parsed = roleChangeSchema.safeParse({
    authUserId: formData.get("authUserId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return changeMemberRoleByInput(parsed.data);
}

export async function changeMemberRoleForm(formData: FormData): Promise<void> {
  assertSystemAdminFormActionResult(await changeMemberRole(formData));
}

export async function setRoleOverride(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireCapability(
    "system-admin.identity.write",
  );

  const parsed = overrideSchema.safeParse({
    role: formData.get("role"),
    permissionKey: formData.get("permissionKey"),
    enabled: formData.get("enabled") === "true",
  });
  if (!parsed.success) {
    logIdentityMutation({
      operation: "identity.role-override.update",
      organizationId: organization.id,
      userId: session.id,
      result: "failure",
      metadata: { reason: "validation" },
    });
    return zodActionFailure(parsed.error);
  }

  await upsertRoleOverride({
    organizationId: organization.id,
    role: parsed.data.role as OrganizationRole,
    permissionKey: parsed.data.permissionKey,
    enabled: parsed.data.enabled,
    actorAuthUserId: session.id,
  });

  logIdentityMutation({
    operation: "identity.role-override.update",
    organizationId: organization.id,
    userId: session.id,
    result: "success",
    metadata: {
      role: parsed.data.role,
      permissionKey: parsed.data.permissionKey,
      enabled: parsed.data.enabled,
    },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "tenant.role-override.changed",
    payload: {
      role: parsed.data.role,
      permissionKey: parsed.data.permissionKey,
      enabled: parsed.data.enabled,
    },
  });

  revalidatePath("/system-admin/identity");
  return systemAdminActionSuccess(undefined);
}

export async function setRoleOverrideAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
) {
  return setRoleOverride(formData);
}

export async function setRoleOverrideForm(formData: FormData): Promise<void> {
  assertSystemAdminFormActionResult(await setRoleOverride(formData));
}
