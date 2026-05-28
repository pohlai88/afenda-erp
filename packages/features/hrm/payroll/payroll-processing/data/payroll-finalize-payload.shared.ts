import { z } from "zod"

export const PAYROLL_FINALIZE_RUN_FAILED_AUDIT_ACTION =
  "erp.execution.payroll_finalize.run.failed" as const

export const payrollFinalizePayloadSchema = z.object({
  organizationId: z.string().min(1),
  periodId: z.string().min(1),
  actorUserId: z.string().min(1),
  actorSessionId: z.string().min(1),
})

export type PayrollFinalizePayload = z.infer<
  typeof payrollFinalizePayloadSchema
>
