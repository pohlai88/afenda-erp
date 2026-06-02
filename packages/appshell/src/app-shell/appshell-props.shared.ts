import { uiDensitySchema, type UiDensity } from "@afenda/ui/design-system";
import type { ReactNode } from "react";
import { z } from "zod";

import { normalizeCommandRecentIds } from "./command/command-recents.shared";
import { appShellIconKeySchema } from "./iconography.shared";
import {
  appShellPrimaryLeftRailConfigSchema,
  type AppShellPrimaryLeftRailConfig,
} from "./left-rail-bar/appshell-primary-left-rail.schema";
import {
  appShellOperationalContextStackSchema,
  type AppShellOperationalContextStack,
} from "./operational-context-stack.shared";
import {
  type AppShellUtilityAdapterKey,
  appShellUtilityBarMetadataSchema,
  type AppShellUtilityBarMetadata,
} from "./top-utils-bar/metadata/utility-bar-metadata.shared";

export const appShellRailModes = ["expanded", "collapsed", "hover"] as const;
export const appShellCommandKinds = [
  "navigation",
  "create",
  "inspect",
  "workflow",
  "context",
] as const;

export const appShellRailModeSchema = z.enum(appShellRailModes);
export const appShellCommandKindSchema = z.enum(appShellCommandKinds);

export type AppShellRailMode = z.infer<typeof appShellRailModeSchema>;
export type AppShellCommandKind = z.infer<typeof appShellCommandKindSchema>;

export const appShellCommandItemSchema = z
  .object({
    id: z.string().trim().min(1).max(160),
    label: z.string().trim().min(1).max(160),
    description: z.string().trim().max(240).optional(),
    href: z.string().trim().min(1).optional(),
    icon: appShellIconKeySchema.optional(),
    kind: appShellCommandKindSchema,
    keywords: z.array(z.string().trim().min(1).max(64)).default([]),
    shortcut: z.string().trim().min(1).max(32).optional(),
    disabledReason: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

export const appShellCommandSectionSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    label: z.string().trim().min(1).max(120),
    items: z.array(appShellCommandItemSchema),
  })
  .strict();

const appShellPreferenceSnapshotBaseSchema = z
  .object({
    railMode: appShellRailModeSchema.default("expanded"),
    density: uiDensitySchema.default("comfortable"),
    utilityOrder: z.array(z.string().trim().min(1)).default([]),
    commandRecents: z.array(z.string().trim().min(1)).default([]),
  })
  .strict();

export const appShellPreferenceSnapshotSchema = appShellPreferenceSnapshotBaseSchema
  .transform((value) => ({
    ...value,
    utilityOrder: normalizeCommandRecentIds(value.utilityOrder, 64),
    commandRecents: normalizeCommandRecentIds(value.commandRecents),
  }));

export const appShellPreferenceUpdateSchema = appShellPreferenceSnapshotBaseSchema
  .partial()
  .strict()
  .transform((value) => ({
    ...value,
    ...(value.utilityOrder
      ? { utilityOrder: normalizeCommandRecentIds(value.utilityOrder, 64) }
      : {}),
    ...(value.commandRecents
      ? { commandRecents: normalizeCommandRecentIds(value.commandRecents) }
      : {}),
  }));

export const appShellOrganizationOptionSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1),
    role: z.string().trim().min(1),
    active: z.boolean(),
  })
  .strict();

export const appShellLauncherItemSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    description: z.string().trim().max(240).optional(),
    href: z.string().trim().min(1),
    icon: appShellIconKeySchema.optional(),
    group: z.string().trim().min(1).optional(),
  })
  .strict();

export const appShellAccountSummarySchema = z
  .object({
    initials: z.string().trim().min(1).max(4),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().max(160).optional(),
    email: z.string().trim().min(1).max(160),
    href: z.string().trim().min(1).optional(),
    avatarSrc: z.string().trim().min(1).optional(),
  })
  .strict();

export const appShellUtilityBarChromeSchema = z
  .object({
    brandHomeHref: z.string().trim().min(1),
    brandIconSrc: z.string().trim().min(1).optional(),
    commandPlaceholder: z.string().trim().min(1).default("search workspace"),
    metadata: appShellUtilityBarMetadataSchema,
    organizations: z.array(appShellOrganizationOptionSchema).default([]),
    launcherItems: z.array(appShellLauncherItemSchema).default([]),
    account: appShellAccountSummarySchema,
    hrefs: z
      .object({
        help: z.string().trim().min(1).optional(),
        settings: z.string().trim().min(1).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const appShellChromeSchema = z
  .object({
    rail: appShellPrimaryLeftRailConfigSchema.nullable(),
    utilityBar: appShellUtilityBarChromeSchema,
    commandSections: z.array(appShellCommandSectionSchema).default([]),
    contextStack: appShellOperationalContextStackSchema.nullable().default(null),
    preferences: appShellPreferenceSnapshotSchema,
  })
  .strict();

export type AppShellCommandItem = z.infer<typeof appShellCommandItemSchema>;
export type AppShellCommandSection = z.infer<typeof appShellCommandSectionSchema>;
export type AppShellPreferenceSnapshot = Omit<
  z.infer<typeof appShellPreferenceSnapshotSchema>,
  "density"
> & {
  density: UiDensity;
};
export type AppShellPreferenceUpdateInput = Omit<
  z.infer<typeof appShellPreferenceUpdateSchema>,
  "density"
> & {
  density?: UiDensity;
};
export type AppShellOrganizationOption = z.infer<
  typeof appShellOrganizationOptionSchema
>;
export type AppShellLauncherItem = z.infer<typeof appShellLauncherItemSchema>;
export type AppShellAccountSummary = z.infer<typeof appShellAccountSummarySchema>;
export type AppShellUtilityBarChrome = Omit<
  z.infer<typeof appShellUtilityBarChromeSchema>,
  "metadata"
> & {
  metadata: AppShellUtilityBarMetadata;
};
export type AppShellChrome = Omit<
  z.infer<typeof appShellChromeSchema>,
  "rail" | "contextStack" | "preferences" | "utilityBar"
> & {
  rail: AppShellPrimaryLeftRailConfig | null;
  utilityBar: AppShellUtilityBarChrome;
  contextStack: AppShellOperationalContextStack | null;
  preferences: AppShellPreferenceSnapshot;
};

export type AppShellActions = {
  persistPreferencesAction?: (
    input: AppShellPreferenceUpdateInput,
  ) => Promise<void>;
  switchOrganizationAction?: (formData: FormData) => Promise<void>;
  signOutAction?: () => Promise<void>;
};

export const appShellUtilityPanelKeys = [
  "upload",
  "screenshot",
  "lynx",
  "notifications",
  "messenger",
  "coordination",
  "feedback",
  "system-admin",
  "quick-create",
] as const satisfies readonly AppShellUtilityAdapterKey[];

export type AppShellUtilityPanelKey =
  (typeof appShellUtilityPanelKeys)[number];
export type AppShellUtilityPanelSlots = Partial<
  Record<AppShellUtilityPanelKey, ReactNode>
>;

export type AppShellOverlaySlots = {
  quickPush?: ReactNode;
};

export type AppShellChromeProps = {
  chrome: AppShellChrome;
  actions?: AppShellActions;
  utilityPanels?: AppShellUtilityPanelSlots;
  overlays?: AppShellOverlaySlots;
  children: ReactNode;
};

export function parseAppShellChrome(input: unknown) {
  return appShellChromeSchema.parse(input) as AppShellChrome;
}

export function parseAppShellPreferenceSnapshot(input: unknown) {
  return appShellPreferenceSnapshotSchema.parse(
    input,
  ) as AppShellPreferenceSnapshot;
}

export function parseAppShellPreferenceUpdate(input: unknown) {
  return appShellPreferenceUpdateSchema.parse(
    input,
  ) as AppShellPreferenceUpdateInput;
}

export function appShellCommandSearchText(item: AppShellCommandItem) {
  return [
    item.label,
    item.description,
    item.href,
    item.kind,
    ...(item.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
