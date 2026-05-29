"use server";

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { updateMembershipStatus } from "../data/system-admin.memberships.query.server";
import {
  assertSystemAdminMembershipStatusChangeAllowed,
  requireSystemAdminMembershipsManage,
} from "../policies/system-admin.memberships.policy.server";
import { systemAdminMembershipStatusInputSchema } from "../schemas/system-admin.memberships.schema";

function revalidateSystemAdminMemberships() {
  revalidatePath("/system-admin/memberships");
  revalidatePath("/system-admin/identity");
  revalidatePath("/system-admin/users");
  revalidatePath("/system-admin/roles");
}

async function updateSystemAdminMembershipStatus(input: {
  membershipId: string;
  status: "active" | "suspended" | "removed";
}): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminMembershipsManage();
  const parsed = systemAdminMembershipStatusInputSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await assertSystemAdminMembershipStatusChangeAllowed({
      organizationId: organization.id,
      membershipId: parsed.data.membershipId,
      nextStatus: parsed.data.status,
      actorAuthUserId: session.id,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Membership status change rejected.",
    );
  }

  try {
    await updateMembershipStatus({
      organizationId: organization.id,
      actorId: session.id,
      membershipId: parsed.data.membershipId,
      status: parsed.data.status,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Membership status update failed.",
    );
  }

  const auditAction =
    parsed.data.status === "suspended"
      ? "system-admin.membership.suspend"
      : parsed.data.status === "removed"
        ? "system-admin.membership.remove"
        : "system-admin.membership.activate";

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: auditAction,
    targetType: "membership",
    targetId: parsed.data.membershipId,
    metadata: { status: parsed.data.status },
  });

  revalidateSystemAdminMemberships();
  return systemAdminActionSuccess(undefined);
}

export async function suspendSystemAdminMembership(membershipId: string) {
  return updateSystemAdminMembershipStatus({ membershipId, status: "suspended" });
}

export async function reactivateSystemAdminMembership(membershipId: string) {
  return updateSystemAdminMembershipStatus({ membershipId, status: "active" });
}

export async function removeSystemAdminMembership(membershipId: string) {
  return updateSystemAdminMembershipStatus({ membershipId, status: "removed" });
}

export async function updateSystemAdminMembershipStatusForm(
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const parsed = systemAdminMembershipStatusInputSchema.safeParse({
    membershipId: formData.get("membershipId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return updateSystemAdminMembershipStatus(parsed.data);
}
