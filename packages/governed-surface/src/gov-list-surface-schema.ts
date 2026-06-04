import { z } from "zod";

import type { SchemaStability } from "./gov-_stability-shared";

import { pageHeaderSchema } from "./gov-page-header-schema";

export const SCHEMA_STABILITY: SchemaStability = "beta";

/**
 * Tone enum shared between stat-card and list-surface badge cells. Mirrors
 * `statCardToneSchema` so a column's badge tone and a stat-card's tone use
 * the same vocabulary (no drift between numeric KPI tone and list badge
 * tone).
 */
export const listCellToneSchema = z.enum([
  "default",
  "positive",
  "attention",
  "critical",
]);

/**
 * Cell-kind discriminator (governed:list-surface cells).
 *
 * - `text`     — display the raw value as-is (fallback).
 * - `link`     — render as a `<Link>`; uses `href` when set, else `row.rowHref` when
 *                `linkColumnId` matches the column.
 * - `badge`    — render as a `<Badge>` using `tone` for design-token color.
 * - `currency` — format with `Intl.NumberFormat` (currency `currency`).
 * - `date`     — format as a localized date.
 * - `datetime` — format as a localized date + time.
 *
 * Discriminated by `kind` so renderers can narrow without inspecting other
 * fields. Single source of truth for cell rendering rules.
 */
export const listCellKindSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text") }).strict(),
  z
    .object({
      kind: z.literal("link"),
      href: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("badge"),
      tone: listCellToneSchema.optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("currency"),
      currency: z.string().trim().min(1).optional(),
    })
    .strict(),
  z.object({ kind: z.literal("date") }).strict(),
  z.object({ kind: z.literal("datetime") }).strict(),
  z
    .object({
      kind: z.literal("sparkline"),
      points: z.array(z.number().finite()).min(2).max(24),
    })
    .strict(),
  z
    .object({
      kind: z.literal("meter"),
      value: z.number().finite(),
      max: z.number().finite().positive(),
      label: z.string().trim().min(1).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("semantic-text"),
      tone: listCellToneSchema.optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("avatar-stack"),
      initials: z.array(z.string().trim().min(1)).min(1).max(4),
      overflow: z.number().int().nonnegative().optional(),
    })
    .strict(),
]);

export const listColumnSchema = z
  .object({
    id: z.string().min(1),
    header: z.string().min(1),
    headerAction: z
      .object({
        label: z.string().trim().min(1),
        href: z.string().trim().min(1).optional(),
        actionId: z.string().trim().min(1).optional(),
      })
      .strict()
      .optional(),
    align: z.enum(["start", "center", "end"]).optional(),
    width: z.enum(["auto", "sm", "md", "lg"]).optional(),
    priority: z.enum(["primary", "secondary", "tertiary"]).optional(),
    pin: z.enum(["start", "end"]).optional(),
    wrap: z.boolean().optional(),
    clip: z.boolean().optional(),
    minWidth: z.number().int().positive().optional(),
    maxWidth: z.number().int().positive().optional(),
    resizable: z.boolean().optional(),
    summary: z.enum(["sum", "count", "average", "custom"]).optional(),
    cellKind: listCellKindSchema.optional(),
    enableClientSort: z.boolean().optional(),
  })
  .strict();

export const emptyStateSchema = z
  .object({
    variant: z.enum(["muted", "cta", "forbidden", "error"]),
    title: z.string().min(1),
    description: z.string().optional(),
    cta: z
      .object({
        label: z.string().min(1),
        href: z.string().min(1),
      })
      .strict()
      .optional(),
  })
  .strict();

export const listSurfaceSchema = z
  .object({
    header: pageHeaderSchema,
    columnsId: z.string().min(1),
    rowKey: z.string().min(1),
    empty: emptyStateSchema,
    primaryAction: z
      .object({
        label: z.string().min(1),
        href: z.string().min(1).optional(),
        actionId: z.string().min(1).optional(),
        minRole: z.enum(["member", "admin", "owner"]).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type ListColumn = z.infer<typeof listColumnSchema>;
export type ListCellKind = z.infer<typeof listCellKindSchema>;
export type ListCellTone = z.infer<typeof listCellToneSchema>;
export type EmptyState = z.infer<typeof emptyStateSchema>;
export type ListSurface = z.infer<typeof listSurfaceSchema>;

export function parseEmptyStateData(raw: unknown) {
  return emptyStateSchema.safeParse(raw);
}

export function parseListSurfaceData(raw: unknown) {
  return listSurfaceSchema.safeParse(raw);
}
