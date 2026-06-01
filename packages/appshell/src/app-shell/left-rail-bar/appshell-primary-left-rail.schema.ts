import { z } from "zod";

import {
  appShellIconKeySchema,
  type AppShellIconKey,
} from "../iconography.shared";

export const appShellPrimaryLeftRailBadgeTones = [
  "default",
  "positive",
  "attention",
  "critical",
] as const;

export const appShellPrimaryLeftRailActiveMatchModes = [
  "exact",
  "prefix",
] as const;

export const appShellPrimaryLeftRailBadgeToneSchema = z.enum(
  appShellPrimaryLeftRailBadgeTones,
);
export const appShellPrimaryLeftRailActiveMatchSchema = z.enum(
  appShellPrimaryLeftRailActiveMatchModes,
);

const navLinkTargetSchema = {
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().max(240).optional(),
  href: z.string().trim().min(1),
  match: appShellPrimaryLeftRailActiveMatchSchema.optional(),
  activePatterns: z.array(z.string().trim().min(1)).optional(),
};

export const appShellPrimaryLeftRailNavBadgeSchema = z
  .object({
    label: z.string().trim().min(1).max(32),
    tone: appShellPrimaryLeftRailBadgeToneSchema,
  })
  .strict();

export const appShellPrimaryLeftRailNavChildItemSchema = z
  .object(navLinkTargetSchema)
  .strict();

export const appShellPrimaryLeftRailNavItemSchema = z
  .object({
    ...navLinkTargetSchema,
    icon: appShellIconKeySchema,
    badge: appShellPrimaryLeftRailNavBadgeSchema.optional(),
    items: z.array(appShellPrimaryLeftRailNavChildItemSchema).min(1).optional(),
  })
  .strict();

export const appShellPrimaryLeftRailNavSectionSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
    items: z.array(appShellPrimaryLeftRailNavItemSchema),
  })
  .strict();

export const appShellPrimaryLeftRailIdentitySchema = z
  .object({
    initials: z.string().trim().min(1).max(4),
    primary: z.string().trim().min(1).max(120),
    secondary: z.string().trim().max(160).optional(),
    href: z.string().trim().min(1).optional(),
  })
  .strict();

export const appShellPrimaryLeftRailLabelsSchema = z
  .object({
    ariaLabel: z.string().trim().min(1),
    searchPlaceholder: z.string().trim().min(1),
    searchAriaLabel: z.string().trim().min(1),
    emptyState: z.string().trim().min(1),
    collapseLabel: z.string().trim().min(1).optional(),
    expandLabel: z.string().trim().min(1).optional(),
  })
  .strict();

export const appShellPrimaryLeftRailConfigSchema = z
  .object({
    storageKey: z.string().trim().min(1),
    identity: appShellPrimaryLeftRailIdentitySchema,
    labels: appShellPrimaryLeftRailLabelsSchema,
    sections: z.array(appShellPrimaryLeftRailNavSectionSchema),
  })
  .strict();

export type AppShellPrimaryLeftRailBadgeTone = z.infer<
  typeof appShellPrimaryLeftRailBadgeToneSchema
>;
export type AppShellPrimaryLeftRailNavBadge = z.infer<
  typeof appShellPrimaryLeftRailNavBadgeSchema
>;
export type AppShellPrimaryLeftRailNavChildItem = z.infer<
  typeof appShellPrimaryLeftRailNavChildItemSchema
>;
export type AppShellPrimaryLeftRailNavItem = z.infer<
  typeof appShellPrimaryLeftRailNavItemSchema
>;
export type AppShellPrimaryLeftRailNavSection = z.infer<
  typeof appShellPrimaryLeftRailNavSectionSchema
>;
export type AppShellPrimaryLeftRailIdentity = z.infer<
  typeof appShellPrimaryLeftRailIdentitySchema
>;
export type AppShellPrimaryLeftRailLabels = z.infer<
  typeof appShellPrimaryLeftRailLabelsSchema
>;
export type AppShellPrimaryLeftRailConfig = z.infer<
  typeof appShellPrimaryLeftRailConfigSchema
>;
export type AppShellPrimaryLeftRailNavItemActiveInput = Pick<
  AppShellPrimaryLeftRailNavItem | AppShellPrimaryLeftRailNavChildItem,
  "href" | "match" | "activePatterns"
>;

export type AppShellPrimaryLeftRailNavIconId = AppShellIconKey;
