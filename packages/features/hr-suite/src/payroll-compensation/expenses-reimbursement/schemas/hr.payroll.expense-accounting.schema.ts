import { z } from "zod";

/** HRM-EXP-024 — accounting allocation on approved claims. */
export const hrExpenseAccountingAllocationSchema = z.object({
  claimId: z.string().trim().min(1),
  legalEntityCode: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  costCenterCode: z.string().trim().min(1).optional(),
  projectCode: z.string().trim().min(1).optional(),
  glReference: z.string().trim().min(1).optional(),
});

export type HrExpenseAccountingAllocationInput = z.infer<
  typeof hrExpenseAccountingAllocationSchema
>;
