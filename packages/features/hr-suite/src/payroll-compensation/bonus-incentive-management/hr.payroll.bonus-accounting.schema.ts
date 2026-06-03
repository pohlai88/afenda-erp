import { z } from "zod";

export const hrBonusAccountingAllocationSchema = z.object({
  payoutId: z.string().trim().min(1),
  legalEntityCode: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  costCenterCode: z.string().trim().min(1).optional(),
  projectCode: z.string().trim().min(1).optional(),
  salesRegionCode: z.string().trim().min(1).optional(),
  glReference: z.string().trim().min(1).optional(),
});

export type HrBonusAccountingAllocationInput = z.infer<
  typeof hrBonusAccountingAllocationSchema
>;
