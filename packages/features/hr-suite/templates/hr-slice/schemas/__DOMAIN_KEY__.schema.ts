import { z } from "zod";

import { __CONSTANT_PREFIX___RECORD_STATUSES } from "./__DOMAIN_KEY__-constants.shared";

export const __IDENTIFIER_CAMEL__RecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  name: z.string().min(1),
  owner: z.string().min(1),
  status: z.enum(__CONSTANT_PREFIX___RECORD_STATUSES),
  updatedAt: z.string().datetime(),
});

export const __IDENTIFIER_CAMEL__ListRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type __IDENTIFIER__RecordInput = z.infer<
  typeof __IDENTIFIER_CAMEL__RecordSchema
>;
export type __IDENTIFIER__ListRowInput = z.infer<
  typeof __IDENTIFIER_CAMEL__ListRowSchema
>;
