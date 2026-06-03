import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import {
  HRM_OTM_AUDIT,
  type hrTimeOtmAuditActions,
} from "./hr.time.otm.event";

type HrTimeOtmAuditAction =
  | (typeof hrTimeOtmAuditActions)["request"][keyof (typeof hrTimeOtmAuditActions)["request"]]
  | (typeof hrTimeOtmAuditActions)["eligibility"][keyof (typeof hrTimeOtmAuditActions)["eligibility"]]
  | (typeof hrTimeOtmAuditActions)["exception"][keyof (typeof hrTimeOtmAuditActions)["exception"]]
  | (typeof hrTimeOtmAuditActions)["calculation"][keyof (typeof hrTimeOtmAuditActions)["calculation"]]
  | (typeof hrTimeOtmAuditActions)["payroll"][keyof (typeof hrTimeOtmAuditActions)["payroll"]];

/** HRM-OTM-029 — persist IAM audit row for overtime mutations (AC 25). */
export async function emitHrTimeOtmAuditEvent(input: {
  organizationId: string;
  actorAuthUserId: string;
  action: HrTimeOtmAuditAction;
  targetId: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorAuthUserId,
    actorType: "user",
    action: input.action,
    targetType: "hr_overtime_request",
    targetId: input.targetId,
    ...(input.summary ? { summary: input.summary } : {}),
    metadata: input.metadata,
  });
}

export { HRM_OTM_AUDIT };
