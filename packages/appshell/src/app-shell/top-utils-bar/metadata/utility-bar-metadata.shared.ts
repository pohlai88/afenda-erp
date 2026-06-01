import { z } from "zod";

import {
  appShellIconKeySchema,
  type AppShellIconKey,
} from "../../iconography.shared";
import { APP_SHELL_UTILITY_ADAPTER_KEYS } from "./utility-bar-items.shared";

export const APP_SHELL_UTILITY_BAR_METADATA_VERSION = 1;

export const APP_SHELL_UTILITY_BAR_ZONES = [
  "left",
  "center",
  "right",
] as const;

export const APP_SHELL_UTILITY_INTENTS = [
  "navigate",
  "inspect",
  "capture",
  "configure",
  "account",
] as const;

export const APP_SHELL_UTILITY_KINDS = [
  "identity",
  "navigation-control",
  "command",
  "configuration",
  "utility-action",
  "account-anchor",
] as const;

export const appShellUtilityZoneIdSchema = z.enum(APP_SHELL_UTILITY_BAR_ZONES);
export const appShellUtilityIntentSchema = z.enum(APP_SHELL_UTILITY_INTENTS);
export const appShellUtilityKindSchema = z.enum(APP_SHELL_UTILITY_KINDS);
export const appShellUtilityAdapterKeySchema = z.enum(
  APP_SHELL_UTILITY_ADAPTER_KEYS,
);

export const appShellUtilityItemMetadataSchema = z
  .object({
    id: z.string().trim().min(1),
    zone: appShellUtilityZoneIdSchema,
    kind: appShellUtilityKindSchema,
    intent: appShellUtilityIntentSchema,
    adapterKey: appShellUtilityAdapterKeySchema,
    iconKey: appShellIconKeySchema.optional(),
    label: z.string().trim().min(1),
    description: z.string().trim().max(240).optional(),
    ariaLabel: z.string().trim().min(1),
    tooltip: z.string().trim().min(1).optional(),
    href: z.string().trim().min(1).optional(),
    shortcut: z.string().trim().min(1).optional(),
    priority: z.number().int(),
    visible: z.boolean().optional(),
    disabledReason: z.string().trim().min(1).optional(),
  })
  .strict();

export const appShellUtilityZoneMetadataSchema = z
  .object({
    id: appShellUtilityZoneIdSchema,
    label: z.string().trim().min(1).optional(),
    items: z.array(appShellUtilityItemMetadataSchema),
  })
  .strict();

export const appShellUtilityBarMetadataSchema = z
  .object({
    version: z.literal(APP_SHELL_UTILITY_BAR_METADATA_VERSION),
    zones: z.array(appShellUtilityZoneMetadataSchema).min(1),
  })
  .strict();

export type AppShellUtilityZoneId = z.infer<typeof appShellUtilityZoneIdSchema>;
export type AppShellUtilityIntent = z.infer<typeof appShellUtilityIntentSchema>;
export type AppShellUtilityKind = z.infer<typeof appShellUtilityKindSchema>;
export type AppShellUtilityAdapterKey = z.infer<
  typeof appShellUtilityAdapterKeySchema
>;
export type AppShellUtilityItemMetadata = z.infer<
  typeof appShellUtilityItemMetadataSchema
>;
export type AppShellUtilityZoneMetadata = z.infer<
  typeof appShellUtilityZoneMetadataSchema
>;
export type AppShellUtilityBarMetadata = z.infer<
  typeof appShellUtilityBarMetadataSchema
>;
export type AppShellUtilityIconKey = AppShellIconKey;

export function parseAppShellUtilityBarMetadata(data: unknown) {
  return appShellUtilityBarMetadataSchema.parse(data) as AppShellUtilityBarMetadata;
}

export function appShellUtilityZoneMetadata(
  metadata: AppShellUtilityBarMetadata | null | undefined,
  zoneId: AppShellUtilityZoneId,
) {
  return metadata?.zones.find((zone) => zone.id === zoneId) ?? null;
}
