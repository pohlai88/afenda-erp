/**
 * Canonical ERP HTTP paths — ARCH-1004 §2 (internal scope).
 */
export { OBJECT_STORAGE_HTTP_ROUTES as ERP_UPLOAD_HTTP_ROUTES } from "@afenda/object-storage/client";

export const ERP_CRON_HTTP_ROUTES = {
  reminders: "/api/internal/v1/cron/reminders",
  syncs: "/api/internal/v1/cron/syncs",
  housekeeping: "/api/internal/v1/cron/housekeeping",
  lynxOutcomes: "/api/internal/v1/cron/lynx-outcomes",
  knowledgeSync: "/api/internal/v1/cron/knowledge-sync",
  hrTimeClockSync: "/api/internal/v1/cron/hr-time-clock-sync",
  documentRetentionSweep: "/api/internal/v1/cron/document-retention-sweep",
  documentScanSweep: "/api/internal/v1/cron/document-scan-sweep",
} as const;

export const ERP_WEBHOOK_HTTP_ROUTES = {
  documentScanResult: "/api/internal/v1/webhooks/document-scan-result",
} as const;
