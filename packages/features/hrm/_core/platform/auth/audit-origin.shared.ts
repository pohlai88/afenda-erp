/**
 * Audit origin descriptors — identifies the source component that generated
 * an audit event (e.g. "server-action", "route-handler", "cron-job").
 */

export const AUDIT_ORIGINS = [
  "server-action",
  "route-handler",
  "cron-job",
  "background-job",
  "system",
] as const

export type AuditOrigin = (typeof AUDIT_ORIGINS)[number]
