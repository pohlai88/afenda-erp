export const hrTimeClockAuditActions = {
  device: {
    registered: "hr.time.clock-integration.device.registered",
    updated: "hr.time.clock-integration.device.updated",
  },
  mapping: {
    created: "hr.time.clock-integration.mapping.created",
    updated: "hr.time.clock-integration.mapping.updated",
    archived: "hr.time.clock-integration.mapping.archived",
  },
  sync: {
    started: "hr.time.clock-integration.sync.started",
    completed: "hr.time.clock-integration.sync.completed",
    failed: "hr.time.clock-integration.sync.failed",
  },
  punch: {
    captured: "hr.time.clock-integration.punch.captured",
    exceptionRecorded: "hr.time.clock-integration.punch.exception_recorded",
  },
} as const;

export type HrTimeClockAuditAction =
  | (typeof hrTimeClockAuditActions.device)[keyof typeof hrTimeClockAuditActions.device]
  | (typeof hrTimeClockAuditActions.mapping)[keyof typeof hrTimeClockAuditActions.mapping]
  | (typeof hrTimeClockAuditActions.sync)[keyof typeof hrTimeClockAuditActions.sync]
  | (typeof hrTimeClockAuditActions.punch)[keyof typeof hrTimeClockAuditActions.punch];
