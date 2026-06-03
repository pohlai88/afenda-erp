import { z } from "zod";

/** HRM-SFT-004 — roster period and org-unit filters (organizationId server-only). */
export const hrSftRosterQuerySchema = z
  .object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    search: z.string().trim().max(120).optional(),
    departmentId: z.string().trim().min(1).optional(),
    teamId: z.string().trim().min(1).optional(),
    locationCode: z.string().trim().min(1).optional(),
    positionId: z.string().trim().min(1).optional(),
    legalEntityCode: z.string().trim().min(1).optional(),
    employeeId: z.string().trim().min(1).optional(),
    templateId: z.string().trim().min(1).optional(),
    status: z.enum(["scheduled", "published", "cancelled"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.periodStart.getTime() > value.periodEnd.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "periodStart must be on or before periodEnd",
        path: ["periodStart"],
      });
    }
  });

export type HrSftRosterQuery = z.infer<typeof hrSftRosterQuerySchema>;
