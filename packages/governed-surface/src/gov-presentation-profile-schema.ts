import { z } from "zod";

import type { SchemaStability } from "./gov-_stability-shared";

export const SCHEMA_STABILITY: SchemaStability = "beta";

/** Governed profile budget. See `docs/architecture/1003-frontend.md` §4.2. */
export const GOVERNED_PRESENTATION_PROFILE_IDS = [
  "erp-operational-table",
  "erp-exception-table",
  "erp-analytical-table",
  "erp-audit-ledger",
  "erp-kpi-grid",
  "erp-executive-summary",
  "erp-trend-chart",
  "erp-status-chart",
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

export const chartPresentationProfileIdSchema = z.enum([
  "erp-trend-chart",
  "erp-status-chart",
]);

export type ChartPresentationProfileId = z.infer<
  typeof chartPresentationProfileIdSchema
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

export function isChartPresentationProfileId(
  profile: PresentationProfileId,
): profile is ChartPresentationProfileId {
  return chartPresentationProfileIdSchema.safeParse(profile).success;
}
