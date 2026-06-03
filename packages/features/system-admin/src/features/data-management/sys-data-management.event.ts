export const systemAdminDataManagementAuditActions = {
  importCreate: "system-admin.data-management.import.create",
  importValidate: "system-admin.data-management.import.validate",
  importRun: "system-admin.data-management.import.run",
  importCancel: "system-admin.data-management.import.cancel",
  importComplete: "system-admin.data-management.import.complete",
  importFail: "system-admin.data-management.import.fail",
  importRowReject: "system-admin.data-management.import.row.reject",
  export: "system-admin.data-management.export",
} as const;

export type SystemAdminDataManagementAuditAction =
  (typeof systemAdminDataManagementAuditActions)[keyof typeof systemAdminDataManagementAuditActions];
