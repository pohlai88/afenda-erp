import { z } from "zod";

export const hrGeoGeofenceKindSchema = z.enum([
  "office",
  "branch",
  "project",
  "client",
  "field",
  "home",
]);

export const hrGeoCheckinPolicyDetailsSchema = z.object({
  weakGpsAccuracyMeters: z.number().int().min(1).max(5000),
  allowedWindowStartMinutes: z.number().int().min(0).max(1440),
  allowedWindowEndMinutes: z.number().int().min(0).max(1440),
  requireRegisteredDevice: z.boolean(),
  detectSpoofing: z.boolean(),
  requireSelfie: z.boolean(),
  allowFieldMultiSite: z.boolean(),
  maskPrecisionForNonDetailReaders: z.boolean(),
});

export const upsertHrGeoGeofenceSchema = z.object({
  geofenceId: z.string().trim().optional(),
  policyGroupCode: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).max(120),
  geofenceKind: hrGeoGeofenceKindSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(1).max(50_000).optional(),
  projectSiteRef: z.string().trim().max(120).optional(),
  clientSiteRef: z.string().trim().max(120).optional(),
  employeeId: z.string().trim().optional(),
  active: z.boolean().optional(),
});

export const upsertHrGeoCheckinPolicySchema = z.object({
  policyGroupCode: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).max(120),
  policyDetails: hrGeoCheckinPolicyDetailsSchema.partial().optional(),
  active: z.boolean().optional(),
});

export const upsertHrGeoEligibilityRuleSchema = z.object({
  ruleId: z.string().trim().optional(),
  policyGroupCode: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().max(64).optional(),
  countryCode: z.string().trim().max(8).optional(),
  workLocationCode: z.string().trim().max(64).optional(),
  departmentId: z.string().trim().optional(),
  roleCode: z.string().trim().max(64).optional(),
  grade: z.string().trim().max(64).optional(),
  employmentType: z.string().trim().max(64).optional(),
  employeeCategory: z.string().trim().max(64).optional(),
  eligible: z.boolean().optional(),
  requiresExceptionApproval: z.boolean().optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().nullable().optional(),
});

export const registerHrGeoDeviceSchema = z.object({
  employeeId: z.string().trim().min(1),
  deviceFingerprint: z.string().trim().min(8).max(256),
  deviceLabel: z.string().trim().max(120).optional(),
  platform: z.string().trim().max(64).optional(),
});

export const updateHrGeoDeviceStatusSchema = z.object({
  deviceId: z.string().trim().min(1),
  status: z.enum(["registered", "suspended", "revoked"]),
});

export type UpsertHrGeoGeofenceInput = z.infer<typeof upsertHrGeoGeofenceSchema>;
export type UpsertHrGeoCheckinPolicyInput = z.infer<
  typeof upsertHrGeoCheckinPolicySchema
>;
export type UpsertHrGeoEligibilityRuleInput = z.infer<
  typeof upsertHrGeoEligibilityRuleSchema
>;
export type RegisterHrGeoDeviceInput = z.infer<typeof registerHrGeoDeviceSchema>;
export type UpdateHrGeoDeviceStatusInput = z.infer<
  typeof updateHrGeoDeviceStatusSchema
>;
