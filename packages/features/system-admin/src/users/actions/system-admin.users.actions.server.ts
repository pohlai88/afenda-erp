"use server";

import { updateMembershipStatus } from "../../memberships/data";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../contracts";
import {
  assertSystemAdminUserCanBeInvited,
  createSystemAdminUserInvitation,
} from "../data";
import {
  requireSystemAdminUsersManage,
} from "../policies";
import {
  systemAdminInviteUserInputSchema,
  systemAdminUserStatusInputSchema,
} from "../schemas";
import type { SystemAdminInviteUserResult } from "../contracts";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

function revalidateSystemAdminUsers() {
  revalidatePath("/system-admin");
  revalidatePath("/system-admin/users");
  revalidatePath("/system-admin/memberships");
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
      targetType: "membership",
      targetId: result.invitationId,
      metadata: {
        email: parsed.data.email,
        role: parsed.data.role,
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
  status: "active" | "suspended";
}) {
  const { context, organization } = await requireSystemAdminUsersManage();
  const parsed = systemAdminUserStatusInputSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await updateMembershipStatus({
      organizationId: organization.id,
      actorId: context.userId,
      membershipId: parsed.data.membershipId,
      status: parsed.data.status,
    });

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action:
        parsed.data.status === "suspended"
          ? "system-admin.user.suspend"
          : "system-admin.user.reactivate",
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

export async function suspendSystemAdminUserForm(formData: FormData) {
  return await suspendSystemAdminUser(String(formData.get("membershipId") ?? ""));
}

export async function reactivateSystemAdminUserForm(formData: FormData) {
  return await reactivateSystemAdminUser(String(formData.get("membershipId") ?? ""));
}
