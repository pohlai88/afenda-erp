export const ERP_CRON_HTTP_ROUTES = {
  reminders: "/api/internal/v1/cron/reminders",
  syncs: "/api/internal/v1/cron/syncs",
  housekeeping: "/api/internal/v1/cron/housekeeping",
  knowledgeSync: "/api/internal/v1/cron/knowledge-sync",
  lynxOutcomes: "/api/internal/v1/cron/lynx-outcomes",
  hrTimeClockSync: "/api/internal/v1/cron/hr-time-clock-sync",
  documentRetentionSweep: "/api/internal/v1/cron/document-retention-sweep",
  documentScanSweep: "/api/internal/v1/cron/document-scan-sweep",
} as const;

export type ErpCronHttpRoute =
  (typeof ERP_CRON_HTTP_ROUTES)[keyof typeof ERP_CRON_HTTP_ROUTES];

export const ERP_WEBHOOK_HTTP_ROUTES = {
  documentScanResult: "/api/internal/v1/webhooks/document-scan-result",
} as const;

export type ErpWebhookHttpRoute =
  (typeof ERP_WEBHOOK_HTTP_ROUTES)[keyof typeof ERP_WEBHOOK_HTTP_ROUTES];
