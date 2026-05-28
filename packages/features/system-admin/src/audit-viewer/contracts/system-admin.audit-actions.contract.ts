export const systemAdminAuditActions = {
  view: "system-admin.audit.view",
  export: "system-admin.audit.export",
} as const;

export type SystemAdminAuditAction =
  (typeof systemAdminAuditActions)[keyof typeof systemAdminAuditActions];
