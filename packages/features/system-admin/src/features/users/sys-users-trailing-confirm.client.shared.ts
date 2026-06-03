import type { ActionDescriptor } from "@afenda/governed-surface/schemas";

export const systemAdminUserTrailingConfirms = {
  cancelInvitation: {
    title: "Cancel invitation",
    description:
      "This pending invitation will be revoked for the organization.",
    confirmLabel: "Cancel invitation",
  },
  suspend: {
    title: "Suspend user",
    description:
      "Suspend this user membership for the active organization?",
    confirmLabel: "Suspend",
  },
  remove: {
    title: "Remove user",
    description:
      "Remove this user from the organization? Active role access will end.",
    confirmLabel: "Remove",
  },
} as const satisfies Record<
  string,
  NonNullable<ActionDescriptor["confirm"]>
>;
