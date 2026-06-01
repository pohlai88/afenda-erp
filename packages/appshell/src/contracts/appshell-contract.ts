import { z } from "zod";

const appShellIdSchema = z.string().trim().min(1);
const appShellLabelSchema = z.string().trim().min(1);
const appShellDescriptionSchema = z.string().trim().min(1).optional();
const appShellHrefSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("/"), {
    message: "AppShell hrefs must be app-relative.",
  });

export const appShellToneSchema = z.enum([
  "neutral",
  "info",
  "positive",
  "warning",
  "critical",
]);

export const appShellContextLevelSchema = z.enum([
  "organization",
  "workspace",
  "surface",
  "workflow",
  "focus",
]);

export const appShellBadgeSchema = z
  .object({
    label: appShellLabelSchema,
    tone: appShellToneSchema.default("neutral"),
  })
  .strict();

export const appShellUtilityItemSchema = z
  .object({
    id: appShellIdSchema,
    label: appShellLabelSchema,
    description: appShellDescriptionSchema,
    href: appShellHrefSchema.optional(),
    iconKey: appShellIdSchema.optional(),
    badge: appShellBadgeSchema.optional(),
  })
  .strict();

export const appShellUtilityBarModelSchema = z
  .object({
    left: z.array(appShellUtilityItemSchema).default([]),
    center: z.array(appShellUtilityItemSchema).default([]),
    right: z.array(appShellUtilityItemSchema).default([]),
    commandTriggerLabel: appShellLabelSchema.default("Command"),
  })
  .strict();

export const appShellNavItemSchema = z
  .object({
    id: appShellIdSchema,
    label: appShellLabelSchema,
    description: appShellDescriptionSchema,
    href: appShellHrefSchema,
    iconKey: appShellIdSchema.optional(),
    badge: appShellBadgeSchema.optional(),
    keywords: z.array(appShellLabelSchema).default([]),
  })
  .strict();

export const appShellNavSectionSchema = z
  .object({
    id: appShellIdSchema,
    label: appShellLabelSchema,
    items: z.array(appShellNavItemSchema).default([]),
  })
  .strict();

export const appShellActionQueueItemSchema = z
  .object({
    id: appShellIdSchema,
    label: appShellLabelSchema,
    description: appShellDescriptionSchema,
    href: appShellHrefSchema.optional(),
    tone: appShellToneSchema.default("neutral"),
    count: z.number().int().nonnegative().optional(),
  })
  .strict();

export const appShellPrimaryRailModelSchema = z
  .object({
    workspaceLabel: appShellLabelSchema,
    sections: z.array(appShellNavSectionSchema).default([]),
    pinned: z.array(appShellNavItemSchema).default([]),
    recents: z.array(appShellNavItemSchema).default([]),
    actionQueue: z.array(appShellActionQueueItemSchema).default([]),
    collapsedLabel: appShellLabelSchema.default("Expand AppShell rail"),
    expandedLabel: appShellLabelSchema.default("Collapse AppShell rail"),
  })
  .strict();

export const appShellCommandItemSchema = z
  .object({
    id: appShellIdSchema,
    label: appShellLabelSchema,
    description: appShellDescriptionSchema,
    href: appShellHrefSchema.optional(),
    iconKey: appShellIdSchema.optional(),
    group: appShellLabelSchema.default("Navigation"),
    shortcut: appShellLabelSchema.optional(),
    keywords: z.array(appShellLabelSchema).default([]),
  })
  .strict();

export const appShellCommandModelSchema = z
  .object({
    placeholder: appShellLabelSchema.default("Search actions and records"),
    emptyLabel: appShellLabelSchema.default("No matching AppShell actions"),
    items: z.array(appShellCommandItemSchema).default([]),
  })
  .strict();

export const appShellContextStackEntrySchema = z
  .object({
    id: appShellIdSchema,
    label: appShellLabelSchema,
    description: appShellDescriptionSchema,
    href: appShellHrefSchema.optional(),
    level: appShellContextLevelSchema,
  })
  .strict();

export const appShellChromeSchema = z
  .object({
    version: z.literal(1),
    appName: appShellLabelSchema.default("Afenda ERP"),
    title: appShellLabelSchema,
    utilityBar: appShellUtilityBarModelSchema,
    primaryRail: appShellPrimaryRailModelSchema,
    command: appShellCommandModelSchema,
    contextStack: z.array(appShellContextStackEntrySchema).default([]),
    overlays: z
      .object({
        commandCenter: z.boolean().default(true),
      })
      .strict()
      .default({ commandCenter: true }),
  })
  .strict();

export type AppShellTone = z.infer<typeof appShellToneSchema>;
export type AppShellContextLevel = z.infer<typeof appShellContextLevelSchema>;
export type AppShellBadge = z.infer<typeof appShellBadgeSchema>;
export type AppShellUtilityItem = z.infer<typeof appShellUtilityItemSchema>;
export type AppShellUtilityBarModel = z.infer<typeof appShellUtilityBarModelSchema>;
export type AppShellNavItem = z.infer<typeof appShellNavItemSchema>;
export type AppShellNavSection = z.infer<typeof appShellNavSectionSchema>;
export type AppShellActionQueueItem = z.infer<typeof appShellActionQueueItemSchema>;
export type AppShellPrimaryRailModel = z.infer<typeof appShellPrimaryRailModelSchema>;
export type AppShellCommandItem = z.infer<typeof appShellCommandItemSchema>;
export type AppShellCommandModel = z.infer<typeof appShellCommandModelSchema>;
export type AppShellContextStackEntry = z.infer<typeof appShellContextStackEntrySchema>;
export type AppShellChrome = z.infer<typeof appShellChromeSchema>;

export function parseAppShellChrome(value: unknown): AppShellChrome {
  return appShellChromeSchema.parse(value);
}

export function createEmptyAppShellChrome(overrides: {
  title?: string;
  workspaceLabel?: string;
} = {}): AppShellChrome {
  return parseAppShellChrome({
    version: 1,
    title: overrides.title ?? "Workspace",
    utilityBar: {},
    primaryRail: {
      workspaceLabel: overrides.workspaceLabel ?? "Workspace",
    },
    command: {},
  });
}
