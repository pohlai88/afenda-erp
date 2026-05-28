"use server";

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../contracts";
import { requireSystemAdminRolesManage } from "../policies";
import {
  systemAdminAssignRoleInputSchema,
  systemAdminRemoveRoleAssignmentInputSchema,
} from "../schemas";
import {
  assignRoleToMembership,
  removeRoleFromMembership,
} from "../data";

function revalidateRoleRoutes() {
  revalidatePath("/system-admin");
  revalidatePath("/system-admin/roles");
  revalidatePath("/system-admin/memberships");
  revalidatePath("/system-admin/users");
}

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

  try {
    await assignRoleToMembership({
      organizationId: organization.id,
      actorId: context.userId,
      membershipId: parsed.data.membershipId,
      role: parsed.data.role,
    });

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: "system-admin.role-assignment.create",
      targetType: "membership",
      targetId: parsed.data.membershipId,
      metadata: { role: parsed.data.role },
    });

    revalidateRoleRoutes();
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role assignment failed.",
    );
  }
}

export async function removeSystemAdminRoleAssignment(
  _previous: SystemAdminActionResult | undefined,
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

  try {
    await removeRoleFromMembership({
      organizationId: organization.id,
      actorId: context.userId,
      membershipId: parsed.data.membershipId,
      role: parsed.data.role,
    });

    await writeExecutionAuditEvent({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: "system-admin.role-assignment.remove",
      targetType: "membership",
      targetId: parsed.data.membershipId,
      metadata: { role: parsed.data.role, fallbackRole: "viewer" },
    });

    revalidateRoleRoutes();
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Role removal failed.",
    );
  }
}

export async function removeSystemAdminRoleAssignmentForm(formData: FormData) {
  return await removeSystemAdminRoleAssignment(undefined, formData);
}
