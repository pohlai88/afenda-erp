import { z } from "zod";

export const hrSbsCreateMappingSchema = z.object({
  benchmarkVersionId: z.string().trim().min(1),
  benchmarkEntryId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().max(64).optional(),
  country: z.string().trim().max(64).optional(),
  locationCode: z.string().trim().max(128).optional(),
  jobFamily: z.string().trim().max(128).optional(),
  jobTitle: z.string().trim().max(128).optional(),
  grade: z.string().trim().max(64).optional(),
  employmentCategory: z.string().trim().max(64).optional(),
  submitForApproval: z.boolean().optional(),
});

export const hrSbsSubmitMappingSchema = z.object({
  mappingId: z.string().trim().min(1),
});

export const hrSbsReviewMappingSchema = z.object({
  mappingId: z.string().trim().min(1),
  decision: z.enum(["approved", "rejected"]),
  decisionNote: z.string().trim().max(512).optional(),
});

export const hrSbsListMappingsQuerySchema = z.object({
  benchmarkVersionId: z.string().trim().min(1).optional(),
  mappingStatus: z
    .enum(["draft", "pending_approval", "approved", "rejected", "superseded"])
    .optional(),
  search: z.string().trim().max(256).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type HrSbsCreateMappingInput = z.infer<typeof hrSbsCreateMappingSchema>;
