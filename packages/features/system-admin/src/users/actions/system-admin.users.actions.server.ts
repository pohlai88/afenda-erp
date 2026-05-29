"use server";

import {
  getTenantMembershipById,
  resendOrganizationInvitation,
  revokeOrganizationInvitation,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import { updateMembershipStatus } from "../../memberships/data";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import {
  assertSystemAdminUserCanBeInvited,
  createSystemAdminUserInvitation,
  inspectSystemAdminUserAccess,
} from "../data";
import { requireSystemAdminUsersManage, requireSystemAdminUsersRead } from "../policies";
import {
  systemAdminCancelInvitationInputSchema,
  systemAdminInspectUserAccessInputSchema,
  systemAdminInviteUserInputSchema,
  systemAdminResendInvitationInputSchema,
  systemAdminUserStatusInputSchema,
} from "../schemas";
import type {
  SystemAdminInviteUserResult,
  SystemAdminResendInvitationResult,
  SystemAdminUserAccessInspection,
} from "../contracts";

function revalidateSystemAdminUsers() {
  revalidatePath("/system-admin");
  revalidatePath("/system-admin/users");
  revalidatePath("/system-admin/memberships");
  revalidatePath("/system-admin/identity");
}

export async function inviteSystemAdminUser(
  _previous: SystemAdminActionResult<SystemAdminInviteUserResult> | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult<SystemAdminInviteUserResult>> {
  const { context, organization, session } = await requireSystemAdminUsersManage();
  const parsed = systemAdminInviteUserInputSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "staff",
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await assertSystemAdminUserCanBeInvited({
      organizationId: organization.id,
      email: parsed.data.email,
    });

    const result = await createSystemAdminUserInvitation({
      organizationId: organization.id,
      email: parsed.data.email,
      role: parsed.data.role,
      actorAuthUserId: session.id,
    });

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: "system-admin.user.invite",
      targetType: "user_invitation",
      targetId: result.invitationId,
      metadata: {
        email: parsed.data.email,
        roleIds: [parsed.data.role],
      },
    });

    revalidateSystemAdminUsers();
    return systemAdminActionSuccess(result);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "User invitation failed.",
    );
  }
}

async function updateSystemAdminUserStatus(input: {
  membershipId: string;
  status: "active" | "suspended" | "removed";
}) {
  const { context, organization, session } = await requireSystemAdminUsersManage();
  const parsed = systemAdminUserStatusInputSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const membership = await getTenantMembershipById({
    organizationId: organization.id,
    membershipId: parsed.data.membershipId,
  });

  if (!membership) {
    return systemAdminActionFailure("Organization membership was not found.");
  }

  if (
    membership.authUserId === session.id &&
    parsed.data.status !== "active"
  ) {
    return systemAdminActionFailure(
      "You cannot suspend or remove your own membership from the Users surface.",
    );
  }

  if (parsed.data.status === "active") {
    if (membership.status === "removed") {
      return systemAdminActionFailure(
        "Removed users cannot be reactivated from the Users surface.",
      );
    }
  }

  try {
    await updateMembershipStatus({
      organizationId: organization.id,
      actorId: context.userId,
      membershipId: parsed.data.membershipId,
      status: parsed.data.status,
    });

    const auditAction =
      parsed.data.status === "suspended"
        ? "system-admin.user.suspend"
        : parsed.data.status === "removed"
          ? "system-admin.user.remove"
          : "system-admin.user.reactivate";

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: auditAction,
      targetType: "membership",
      targetId: parsed.data.membershipId,
      metadata: { status: parsed.data.status },
    });

    revalidateSystemAdminUsers();
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "User status update failed.",
    );
  }
}

export async function suspendSystemAdminUser(membershipId: string) {
  return updateSystemAdminUserStatus({ membershipId, status: "suspended" });
}

export async function reactivateSystemAdminUser(membershipId: string) {
  return updateSystemAdminUserStatus({ membershipId, status: "active" });
}

export async function removeSystemAdminUser(membershipId: string) {
  return updateSystemAdminUserStatus({ membershipId, status: "removed" });
}

export async function resendSystemAdminInvitation(
  invitationId: string,
): Promise<SystemAdminActionResult<SystemAdminResendInvitationResult>> {
  const { context, organization, session } = await requireSystemAdminUsersManage();
  const parsed = systemAdminResendInvitationInputSchema.safeParse({ invitationId });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await resendOrganizationInvitation({
      organizationId: organization.id,
      invitationId: parsed.data.invitationId,
      actorAuthUserId: session.id,
    });

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: "system-admin.user.invitation_resend",
      targetType: "user_invitation",
      targetId: result.invitationId,
      metadata: { invitationId: result.invitationId },
    });

    revalidateSystemAdminUsers();
    return systemAdminActionSuccess(result);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Invitation resend failed.",
    );
  }
}

export async function cancelSystemAdminInvitation(
  invitationId: string,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } = await requireSystemAdminUsersManage();
  const parsed = systemAdminCancelInvitationInputSchema.safeParse({ invitationId });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await revokeOrganizationInvitation({
      organizationId: organization.id,
      invitationId: parsed.data.invitationId,
      actorAuthUserId: session.id,
    });

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: "system-admin.user.invitation_cancel",
      targetType: "user_invitation",
      targetId: parsed.data.invitationId,
      metadata: { invitationId: parsed.data.invitationId },
    });

    revalidateSystemAdminUsers();
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Invitation cancel failed.",
    );
  }
}

export async function inspectSystemAdminUserAccessAction(
  membershipId: string,
): Promise<SystemAdminActionResult<SystemAdminUserAccessInspection>> {
  const { organization } = await requireSystemAdminUsersRead();
  const parsed = systemAdminInspectUserAccessInputSchema.safeParse({ membershipId });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const inspection = await inspectSystemAdminUserAccess({
      organizationId: organization.id,
      membershipId: parsed.data.membershipId,
    });

    return systemAdminActionSuccess(inspection);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Access inspection failed.",
    );
  }
}
