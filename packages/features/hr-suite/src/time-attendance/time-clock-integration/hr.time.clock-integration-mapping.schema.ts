import { z } from "zod";

export const hrTimeClockMappingStatusSchema = z.enum(["active", "inactive"]);

export const upsertHrTimeClockEmployeeMappingSchema = z
  .object({
    mappingId: z.string().trim().min(1).optional(),
    deviceId: z.string().trim().min(1),
    employeeId: z.string().trim().min(1),
    deviceUserId: z.string().trim().max(120).nullable().optional(),
    badgeId: z.string().trim().max(120).nullable().optional(),
    biometricId: z.string().trim().max(120).nullable().optional(),
    clockId: z.string().trim().max(120).nullable().optional(),
    status: hrTimeClockMappingStatusSchema.optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.deviceUserId?.trim() ||
          value.badgeId?.trim() ||
          value.biometricId?.trim() ||
          value.clockId?.trim(),
      ),
    { message: "hr_time_clock_mapping_identity_required" },
  );

export const archiveHrTimeClockEmployeeMappingSchema = z.object({
  mappingId: z.string().trim().min(1),
});

export type UpsertHrTimeClockEmployeeMappingInput = z.infer<
  typeof upsertHrTimeClockEmployeeMappingSchema
>;
export type ArchiveHrTimeClockEmployeeMappingInput = z.infer<
  typeof archiveHrTimeClockEmployeeMappingSchema
>;
