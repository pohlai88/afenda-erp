import { z } from "zod";

import type { SchemaStability } from "./gov-_stability-shared";

import { prepareGovernedConfigurationForParse } from "./migrate-governed-configuration.shared";
import { resolveGovernedStatPresentation } from "./gov-resolve-governed-presentation";
import { refineStatCardDisplayStrings } from "./gov-display-string-shared";
import { statPresentationProfileIdSchema } from "./gov-presentation-profile-schema";
import { governedMetadataSchemaVersionSchema } from "./gov-schema-version-shared";
import { governedSurfaceChromeSchema } from "./gov-surface-chrome-schema";

export const SCHEMA_STABILITY: SchemaStability = "beta";

export const statCardToneSchema = z.enum([
  "positive",
  "attention",
  "default",
  "critical",
]);

export const statCardIconSchema = z.enum([
  "clock",
  "alert",
  "users",
  "calendar",
  "activity",
  "shield",
]);

export const statCardSparkPointSchema = z
  .object({
    value: z.number().finite(),
  })
  .strict();

export const statCardProgressSchema = z
  .object({
    value: z.number().finite(),
    max: z.number().finite().positive(),
    label: z.string().trim().min(1).optional(),
  })
  .strict();

export const statCardComparisonSchema = z
  .object({
    priorValue: z.string().trim().min(1),
    label: z.string().trim().min(1),
    direction: z.enum(["up", "down", "flat"]),
  })
  .strict();

export const statCardItemSchema = z
  .object({
    label: z.string().min(1),
    value: z.string().min(1),
    delta: z.string().min(1).optional(),
    tone: statCardToneSchema.default("default"),
    href: z.string().min(1).optional(),
    icon: statCardIconSchema.optional(),
    sparkPoints: z.array(statCardSparkPointSchema).max(24).optional(),
    progress: statCardProgressSchema.optional(),
    comparison: statCardComparisonSchema.optional(),
    animateValue: z.boolean().optional(),
  })
  .strict();

export const statCardDataNatureSchema = z.enum(["kpi", "snapshot-summary"]);
export type StatCardDataNature = z.infer<typeof statCardDataNatureSchema>;

export const statCardDensitySchema = z.enum(["compact", "comfortable"]);
export type StatCardDensity = z.infer<typeof statCardDensitySchema>;

const statCardConfigurationCoreSchema =
  governedMetadataSchemaVersionSchema.extend({
    dataNature: statCardDataNatureSchema.default("kpi"),
    density: statCardDensitySchema.default("comfortable"),
    stats: z.array(statCardItemSchema).max(6),
    chrome: governedSurfaceChromeSchema.optional(),
  });

function refineStatCardConfiguration(
  config: z.infer<typeof statCardConfigurationCoreSchema>,
  ctx: z.RefinementCtx,
) {
  if (config.dataNature === "kpi" && config.stats.length > 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["stats"],
      message:
        'KPI stat-card supports at most 4 tiles. Use dataNature: "snapshot-summary" for 5–6 figures or split into multiple stat-cards.',
    });
  }
  refineStatCardDisplayStrings(config, ctx);
}

function applyStatPresentationProfile<
  T extends z.infer<typeof statCardConfigurationCoreSchema> & {
    presentationProfile?: z.infer<typeof statPresentationProfileIdSchema>;
  },
>(config: T) {
  const { presentationProfile, density, ...rest } = config;
  if (!presentationProfile) {
    return {
      ...rest,
      density,
    };
  }
  return {
    ...rest,
    density: resolveGovernedStatPresentation({
      profile: presentationProfile,
      density,
    }),
  };
}

export const statCardConfigurationSchema = statCardConfigurationCoreSchema
  .extend({
    presentationProfile: statPresentationProfileIdSchema.optional(),
  })
  .transform(applyStatPresentationProfile)
  .superRefine(refineStatCardConfiguration);

export type StatCardTone = z.infer<typeof statCardToneSchema>;
export type StatCardIcon = z.infer<typeof statCardIconSchema>;
export type StatCardSparkPoint = z.infer<typeof statCardSparkPointSchema>;
export type StatCardProgress = z.infer<typeof statCardProgressSchema>;
export type StatCardComparison = z.infer<typeof statCardComparisonSchema>;
export type StatCardItem = z.infer<typeof statCardItemSchema>;
export type StatCardConfiguration = z.output<
  typeof statCardConfigurationSchema
>;
export type StatCardConfigurationInput = z.input<
  typeof statCardConfigurationSchema
>;
/** Builder output: profile merged into `density`; no `presentationProfile` key. */
export type StatCardConfigurationResolvedInput = Omit<
  StatCardConfigurationInput,
  "presentationProfile"
>;

export function parseStatCardConfiguration(raw: unknown) {
  return statCardConfigurationSchema.safeParse(
    prepareGovernedConfigurationForParse(raw),
  );
}
