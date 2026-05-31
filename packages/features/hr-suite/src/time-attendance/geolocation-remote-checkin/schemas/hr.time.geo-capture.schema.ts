import { z } from "zod";

export const captureHrGeoRemoteCheckinSchema = z.object({
  action: z.enum(["check_in", "check_out", "break_start", "break_end"]),
  capturedAt: z.string().datetime(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracyMeters: z.number().optional(),
  deviceFingerprint: z.string().optional(),
  deviceReference: z.string().optional(),
  projectSiteRef: z.string().optional(),
  clientSiteRef: z.string().optional(),
  selfieBlobUrl: z.string().optional(),
  mockProvider: z.boolean().optional(),
  idempotencyKey: z.string().optional(),
});

export const submitHrGeoExceptionSchema = z.object({
  rawCheckinId: z.string().min(1),
  submissionReason: z.string().trim().min(3),
});

export const decideHrGeoExceptionSchema = z.object({
  exceptionId: z.string().min(1),
  decision: z.enum(["approve", "reject", "return", "correct", "manual_approve"]),
  decisionReason: z.string().trim().optional(),
});

export type CaptureHrGeoRemoteCheckinInput = z.infer<
  typeof captureHrGeoRemoteCheckinSchema
>;
export type SubmitHrGeoExceptionInput = z.infer<
  typeof submitHrGeoExceptionSchema
>;
export type DecideHrGeoExceptionInput = z.infer<
  typeof decideHrGeoExceptionSchema
>;
