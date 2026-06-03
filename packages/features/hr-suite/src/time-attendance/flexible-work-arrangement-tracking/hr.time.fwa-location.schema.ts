import { z } from "zod";

export const hrFwaRemoteLocationKindSchema = z.enum([
  "home_office",
  "client_site",
  "branch",
  "project_site",
  "other",
]);

export const hrFwaLocationRestrictionSchema = z.object({
  allowedCountryCodes: z.array(z.string().trim().min(2)).optional(),
  allowedRegionCodes: z.array(z.string().trim().min(1)).optional(),
  allowedLocationKinds: z.array(hrFwaRemoteLocationKindSchema).optional(),
  blockedCountryCodes: z.array(z.string().trim().min(2)).optional(),
  blockedRegionCodes: z.array(z.string().trim().min(1)).optional(),
});

export const upsertHrFwaRemoteLocationFormSchema = z.object({
  employeeId: z.string().min(1),
  remoteLocationId: z.string().optional(),
  label: z.string().trim().min(1, "Location label is required."),
  locationKind: hrFwaRemoteLocationKindSchema.default("home_office"),
  countryCode: z.string().trim().min(2).optional(),
  regionCode: z.string().trim().min(1).optional(),
  addressLine: z.string().optional(),
  isApproved: z.coerce.boolean().optional(),
  restrictionNotes: z.string().optional(),
  restrictions: hrFwaLocationRestrictionSchema.optional(),
});

export type HrFwaLocationRestrictionInput = z.infer<
  typeof hrFwaLocationRestrictionSchema
>;
