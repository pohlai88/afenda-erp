import { z } from "zod";

export const hrCareerPathAspirationUpsertSchema = z.object({
  employeeId: z.string().trim().min(1),
  preferredRoleTitle: z.string().trim().max(160).optional(),
  preferredDepartmentId: z.string().trim().min(1).optional(),
  preferredLocationCode: z.string().trim().max(64).optional(),
  mobilityPreference: z.string().trim().max(160).optional(),
  careerInterestNotes: z.string().trim().max(4000).optional(),
});

export type HrCareerPathAspirationUpsertInput = z.infer<
  typeof hrCareerPathAspirationUpsertSchema
>;
