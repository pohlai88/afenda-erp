import { getTenantMembershipById } from "@afenda/db";
import {
  requireSystemAdminMembershipsManage,
  requireSystemAdminMembershipsRead,
  requireSystemAdminRolesManage,
} from "../overview/sys-capability.policy.server";
import type { SystemAdminMembershipStatus } from "./sys-memberships.contract";

export {
  requireSystemAdminMembershipsManage,
  requireSystemAdminMembershipsRead,
  requireSystemAdminRolesManage,
};

export async function assertSystemAdminMembershipStatusChangeAllowed(input: {
  organizationId: string;
  membershipId: string;
  nextStatus: SystemAdminMembershipStatus;
  actorAuthUserId: string;
}) {
  const membership = await getTenantMembershipById({
    organizationId: input.organizationId,
    membershipId: input.membershipId,
  });

  if (!membership) {
    throw new Error("Organization membership was not found.");
  }

  if (
    membership.authUserId === input.actorAuthUserId &&
    input.nextStatus !== "active"
  ) {
    throw new Error(
      "You cannot suspend or remove your own membership from the Memberships surface.",
    );
  }

  if (input.nextStatus === "active" && membership.status === "removed") {
    throw new Error(
      "Removed memberships cannot be reactivated from the Memberships surface.",
    );
  }

  return membership;
}
