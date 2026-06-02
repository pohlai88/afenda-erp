export const SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID =
  "system-admin.users.bulk-suspend";

export const systemAdminUsersBulkSuspendConfirm = {
  title: "Confirm bulk suspend",
  description:
    "Suspending selected active memberships immediately removes their organization access.",
  confirmLabel: "Confirm suspend",
} as const;
