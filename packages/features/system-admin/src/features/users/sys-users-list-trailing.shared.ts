import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type { SystemAdminUserStatus } from "../contracts";

export const SYSTEM_ADMIN_USERS_MANAGE_DENIED =
  "Requires system-admin.users.manage.";

export function resolveSystemAdminUserRowTrailingAction(input: {
  status: SystemAdminUserStatus;
  canMutate: boolean;
  hasMembership: boolean;
}) {
  const visible =
    input.status === "invited" ||
    (input.hasMembership && input.status !== "removed");

  return resolveListSurfaceRowTrailingAction({
    visible,
    allowed: input.canMutate,
    disabledReason: SYSTEM_ADMIN_USERS_MANAGE_DENIED,
    descriptor: {
      id:
        input.status === "invited"
          ? "system-admin.user.invitation.manage"
          : "system-admin.user.manage",
      label: input.status === "invited" ? "Manage invitation" : "Manage",
      intent: "default",
    },
  });
}
