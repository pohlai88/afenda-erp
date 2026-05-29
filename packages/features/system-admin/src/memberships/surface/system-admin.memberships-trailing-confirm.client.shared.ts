import type { ActionDescriptor } from "@afenda/governed-surface/schemas";

export const systemAdminMembershipTrailingConfirms = {
  suspend: {
    title: "Suspend membership",
    description:
      "The member cannot access organization surfaces while suspended.",
    confirmLabel: "Suspend",
  },
  remove: {
    title: "Remove membership",
    description:
      "The member loses organization access and cannot receive new assignments.",
    confirmLabel: "Remove",
  },
  removeRole: {
    title: "Remove role assignment",
    description: "Remove this role assignment and demote the member to viewer?",
    confirmLabel: "Remove role",
  },
} as const satisfies Record<
  string,
  NonNullable<ActionDescriptor["confirm"]>
>;
