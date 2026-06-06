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
  neonBan: {
    title: "Ban Neon Auth user",
    description:
      "Ban this identity in Neon Auth. ERP tenant membership is unchanged.",
    confirmLabel: "Ban identity",
  },
  neonRevokeSessions: {
    title: "Revoke Neon Auth sessions",
    description:
      "Revoke active Neon Auth sessions for this identity. ERP tenant membership is unchanged.",
    confirmLabel: "Revoke sessions",
  },
  neonImpersonate: {
    title: "Impersonate Neon Auth user",
    description:
      "Start a Neon Auth impersonation session for this identity. Use only for audited support work.",
    confirmLabel: "Impersonate",
  },
} as const satisfies Record<
  string,
  NonNullable<ActionDescriptor["confirm"]>
>;
