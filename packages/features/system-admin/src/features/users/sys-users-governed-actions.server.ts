import { registerGovernedPolicyBulkServerAction } from "@afenda/governed-surface/schemas";

import { bulkSuspendSystemAdminUsers } from "./sys-users.actions.server";
import { SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID } from "./sys-users-actions.contract";
import { systemAdminUsersSurfaceKey } from "./sys-users-list.surface";

let systemAdminUsersGovernedActionsRegistered = false;

export function registerSystemAdminUsersGovernedActions(): void {
  if (systemAdminUsersGovernedActionsRegistered) {
    return;
  }

  registerGovernedPolicyBulkServerAction(
    {
      actionId: SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID,
      selectedRows: { min: 1 },
      confirmation: { required: true },
      audit: {
        surfaceKey: systemAdminUsersSurfaceKey,
        sectionKey: "system-admin.users",
        componentKey: "system-admin.users.bulk-toolbar",
        targetType: "membership",
      },
    },
    bulkSuspendSystemAdminUsers,
  );

  systemAdminUsersGovernedActionsRegistered = true;
}
