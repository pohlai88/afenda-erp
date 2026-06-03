import { z } from "zod";

export const lynxReadinessStatusSchema = z.enum([
  "available",
  "partial",
  "unavailable",
]);
export type LynxReadinessStatus = z.infer<typeof lynxReadinessStatusSchema>;

export const lynxReadinessSignalSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: lynxReadinessStatusSchema,
  detail: z.string(),
  value: z.string().optional(),
});
export type LynxReadinessSignal = z.infer<typeof lynxReadinessSignalSchema>;

export const lynxToolAvailabilitySchema = z.object({
  toolName: z.string(),
  status: lynxReadinessStatusSchema,
  reason: z.string(),
});
export type LynxToolAvailability = z.infer<typeof lynxToolAvailabilitySchema>;

export const lynxModuleReadinessSchema = z.object({
  moduleId: z.string(),
  moduleLabel: z.string(),
  status: lynxReadinessStatusSchema,
  safeNextAction: z.string(),
  signals: z.array(lynxReadinessSignalSchema),
  tools: z.array(lynxToolAvailabilitySchema),
});
export type LynxModuleReadiness = z.infer<typeof lynxModuleReadinessSchema>;

export const lynxReadinessSnapshotSchema = z.object({
  organizationId: z.string(),
  generatedAt: z.string().datetime(),
  status: lynxReadinessStatusSchema,
  summary: z.string(),
  knowledge: z.object({
    status: lynxReadinessStatusSchema,
    sourceCount: z.number().int().nonnegative(),
    documentCount: z.number().int().nonnegative(),
    chunkCount: z.number().int().nonnegative(),
    latestEvalAt: z.string().datetime().nullable(),
    evalGate: z.object({
      status: lynxReadinessStatusSchema,
      reasons: z.array(z.string()),
    }),
  }),
  modules: z.array(lynxModuleReadinessSchema),
  tools: z.array(lynxToolAvailabilitySchema),
  enterpriseControls: z.array(lynxReadinessSignalSchema),
});
export type LynxReadinessSnapshot = z.infer<typeof lynxReadinessSnapshotSchema>;
