import { moduleIds } from "@afenda/config/module-ids";
import { z } from "zod";

export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(40),
  contextModuleId: z.enum(moduleIds).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
