import { z } from "zod";

export const hrTimeClockDeviceTypeSchema = z.enum([
  "biometric",
  "card_reader",
  "rfid",
  "kiosk",
  "web",
  "mobile",
  "desktop",
]);

export const hrTimeClockDeviceStatusSchema = z.enum([
  "active",
  "inactive",
  "offline",
  "error",
]);

export const hrTimeClockSyncConfigSchema = z.object({
  enabled: z.boolean().optional(),
  scheduleCron: z.string().trim().max(120).nullable().optional(),
  pollIntervalMinutes: z.number().int().min(1).max(24 * 60).nullable().optional(),
  apiEndpoint: z.string().trim().max(512).nullable().optional(),
  importFormat: z.string().trim().max(64).nullable().optional(),
  timezone: z.string().trim().max(64).nullable().optional(),
  retryLimit: z.number().int().min(0).max(20).nullable().optional(),
});

export const registerHrTimeClockDeviceSchema = z.object({
  externalDeviceId: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  deviceType: hrTimeClockDeviceTypeSchema,
  locationCode: z.string().trim().max(64).optional(),
  status: hrTimeClockDeviceStatusSchema.optional(),
  syncConfig: hrTimeClockSyncConfigSchema.optional(),
  apiCredentialRef: z.string().trim().max(256).optional(),
  breaksEnabled: z.boolean().optional(),
});

export const updateHrTimeClockDeviceSchema = z
  .object({
    deviceId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(120).optional(),
    deviceType: hrTimeClockDeviceTypeSchema.optional(),
    locationCode: z.string().trim().max(64).nullable().optional(),
    status: hrTimeClockDeviceStatusSchema.optional(),
    syncConfig: hrTimeClockSyncConfigSchema.optional(),
    apiCredentialRef: z.string().trim().max(256).nullable().optional(),
    breaksEnabled: z.boolean().optional(),
    lastSyncAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.deviceType !== undefined ||
      value.locationCode !== undefined ||
      value.status !== undefined ||
      value.syncConfig !== undefined ||
      value.apiCredentialRef !== undefined ||
      value.breaksEnabled !== undefined ||
      value.lastSyncAt !== undefined,
    { message: "hr_time_clock_device_update_empty" },
  );

export type HrTimeClockDeviceType = z.infer<typeof hrTimeClockDeviceTypeSchema>;
export type HrTimeClockDeviceStatus = z.infer<
  typeof hrTimeClockDeviceStatusSchema
>;
export type HrTimeClockSyncConfigInput = z.infer<
  typeof hrTimeClockSyncConfigSchema
>;
export type RegisterHrTimeClockDeviceInput = z.infer<
  typeof registerHrTimeClockDeviceSchema
>;
export type UpdateHrTimeClockDeviceInput = z.infer<
  typeof updateHrTimeClockDeviceSchema
>;
