export const systemAdminAuditViewerWebhookEvents = [
  "tenant.retention.updated",
] as const;

export const systemAdminAuditViewerAuditActions = {
  view: "system-admin.audit.view",
  review: "system-admin.audit.review",
  export: "system-admin.audit.export",
} as const;

export type SystemAdminAuditViewerWebhookEvent =
  (typeof systemAdminAuditViewerWebhookEvents)[number];

export type SystemAdminAuditViewerAuditAction =
  (typeof systemAdminAuditViewerAuditActions)[keyof typeof systemAdminAuditViewerAuditActions];
