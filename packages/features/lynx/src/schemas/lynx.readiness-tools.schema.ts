import { z } from "zod";

export const inspectLynxReadinessInputSchema = z.object({
  includeModules: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});
