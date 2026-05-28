"use server";

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../contracts";
import { requireSystemAdminMembershipsManage } from "../policies";
import { systemAdminMembershipStatusInputSchema } from "../schemas";
import { updateMembershipStatus } from "../data";

function revalidateMembershipRoutes() {
  revalidatePath("/system-admin");
  revalidatePath("/system-admin/memberships");
  revalidatePath("/system-admin/users");
}

export async function updateSystemAdminMembershipStatus(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminMembershipsManage();
  const parsed = systemAdminMembershipStatusInputSchema.safeParse({
    membershipId: formData.get("membershipId"),
    status: formData.get("status"),
  });

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
        parsed.data.status === "removed"
          ? "system-admin.membership.remove"
          : "system-admin.membership.update",
      targetType: "membership",
      targetId: parsed.data.membershipId,
      metadata: { status: parsed.data.status },
    });

    revalidateMembershipRoutes();
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Membership update failed.",
    );
  }
}

export async function updateSystemAdminMembershipStatusForm(formData: FormData) {
  return await updateSystemAdminMembershipStatus(undefined, formData);
}
