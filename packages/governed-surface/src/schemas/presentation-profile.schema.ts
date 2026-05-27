import { z } from "zod";

import type { SchemaStability } from "./_stability.shared";

export const SCHEMA_STABILITY: SchemaStability = "beta";

/** Governed profile budget. See `docs/architecture/007-governed-metadata-architecture.md` §4.2. */
export const GOVERNED_PRESENTATION_PROFILE_IDS = [
  "erp-operational-table",
  "erp-exception-table",
  "erp-analytical-table",
  "erp-audit-ledger",
  "erp-kpi-grid",
  "erp-executive-summary",
] as const;

export const presentationProfileIdSchema = z.enum(
  GOVERNED_PRESENTATION_PROFILE_IDS,
);

export type PresentationProfileId = z.infer<typeof presentationProfileIdSchema>;

export const listPresentationProfileIdSchema = z.enum([
  "erp-operational-table",
  "erp-exception-table",
  "erp-analytical-table",
  "erp-audit-ledger",
]);

export type ListPresentationProfileId = z.infer<
  typeof listPresentationProfileIdSchema
>;

export const statPresentationProfileIdSchema = z.enum([
  "erp-kpi-grid",
  "erp-executive-summary",
]);

export type StatPresentationProfileId = z.infer<
  typeof statPresentationProfileIdSchema
>;

export function isListPresentationProfileId(
  profile: PresentationProfileId,
): profile is ListPresentationProfileId {
  return listPresentationProfileIdSchema.safeParse(profile).success;
}

export function isStatPresentationProfileId(
  profile: PresentationProfileId,
): profile is StatPresentationProfileId {
  return statPresentationProfileIdSchema.safeParse(profile).success;
}
