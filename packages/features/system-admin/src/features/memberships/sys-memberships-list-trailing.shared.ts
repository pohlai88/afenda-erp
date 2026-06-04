import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type { SystemAdminMembershipStatus } from "./sys-memberships.contract";

export const SYSTEM_ADMIN_MEMBERSHIPS_MANAGE_DENIED =
  "Requires system-admin.memberships.manage.";

export const SYSTEM_ADMIN_MEMBERSHIPS_ROLES_MANAGE_DENIED =
  "Requires system-admin.roles.manage.";

export function resolveSystemAdminMembershipRowTrailingAction(input: {
  status: SystemAdminMembershipStatus;
  canMutate: boolean;
  canManageRoles: boolean;
}) {
  const canInteract = input.canMutate || input.canManageRoles;
  const visible = input.status !== "removed" && canInteract;
  const disabledReason = !input.canMutate
    ? SYSTEM_ADMIN_MEMBERSHIPS_MANAGE_DENIED
    : SYSTEM_ADMIN_MEMBERSHIPS_ROLES_MANAGE_DENIED;

  return resolveListSurfaceRowTrailingAction({
    visible,
    allowed: canInteract,
    disabledReason,
    descriptor: {
      id: "system-admin.membership.manage",
      label: "Manage membership",
      intent: "default",
    },
  });
}
