import { z } from "zod";

import type { SchemaStability } from "./gov-_stability-shared";

export const SCHEMA_STABILITY: SchemaStability = "beta";

/**
 * Optional serializable context for Pattern C list trailing cells.
 * Extend here when cells need module/surface-scoped props beyond row data.
 */
export const governedListTrailingCellContextSchema = z
  .object({
    surfaceKey: z.string().min(1).optional(),
    sectionKey: z.string().min(1).optional(),
    componentKey: z.string().min(1).optional(),
    moduleId: z.string().min(1).optional(),
    organizationLegalHoldActive: z.boolean().optional(),
  })
  .strict();

export type GovernedListTrailingCellContext = z.infer<
  typeof governedListTrailingCellContextSchema
>;

export function parseGovernedListTrailingCellContext(raw: unknown) {
  return governedListTrailingCellContextSchema.safeParse(raw);
}
