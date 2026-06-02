import { z } from "zod";

import type { SchemaStability } from "./_stability.shared";

import { prepareGovernedConfigurationForParse } from "../migrate-governed-configuration.shared";
import { resolveGovernedListPresentation } from "../resolvers/resolve-governed-presentation";
import { erpPermissionRequirementSchema } from "./erp-permission-requirement.schema";
import { listPresentationProfileIdSchema } from "./presentation-profile.schema";
import {
  listCellKindSchema,
  listColumnSchema,
  listSurfaceSchema,
} from "./list-surface.schema";
import { listSurfaceRowTrailingActionSchema } from "./list-surface-row-trailing-action.schema";
import { listSurfaceToolbarSchema } from "./list-surface-toolbar.schema";
import { governedMetadataSchemaVersionSchema } from "./schema-version.shared";

export const SCHEMA_STABILITY: SchemaStability = "beta";

export const listSurfaceRowToneSchema = z.enum([
  "default",
  "attention",
  "critical",
]);

export const listSurfaceRowCellSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

export const listSurfaceDecisionLedgerRiskToneSchema = z.enum([
  "default",
  "positive",
  "attention",
  "critical",
]);

export const listSurfaceRowDecisionLedgerSchema = z
  .object({
    reason: z.string().trim().min(1).optional(),
    evidenceHref: z.string().trim().min(1).optional(),
    policyLabel: z.string().trim().min(1).optional(),
    policyHref: z.string().trim().min(1).optional(),
    actorLabel: z.string().trim().min(1).optional(),
    occurredAt: z.string().trim().min(1).optional(),
    riskTone: listSurfaceDecisionLedgerRiskToneSchema.optional(),
    nextActionLabel: z.string().trim().min(1).optional(),
  })
  .strict();

export const listSurfaceRowSchema = z
  .object({
    id: z.string().min(1),
    cells: z.record(z.string(), listSurfaceRowCellSchema),
    rowHref: z.string().min(1).optional(),
    linkColumnId: z.string().min(1).optional(),
    rowTone: listSurfaceRowToneSchema.optional(),
    selectionDisabledReason: z.string().trim().min(1).optional(),
    /** Per-row cell renderer overrides (row wins over column `cellKind`). */
    cellKinds: z.record(z.string(), listCellKindSchema).optional(),
    trailingAction: listSurfaceRowTrailingActionSchema.optional(),
    decisionLedger: listSurfaceRowDecisionLedgerSchema.optional(),
  })
  .strict();

export const listSurfaceRendererDataNatureSchema = z.enum([
  "table",
  "document-lines",
]);
export type ListSurfaceRendererDataNature = z.infer<
  typeof listSurfaceRendererDataNatureSchema
>;

export const listSurfacePaginationSchema = z
  .object({
    pageSize: z.number().int().positive(),
    hasNextPage: z.boolean().optional(),
    nextCursor: z.string().trim().min(1).optional(),
    nextHref: z.string().trim().min(1).optional(),
    prevCursor: z.string().trim().min(1).optional(),
    prevHref: z.string().trim().min(1).optional(),
    totalCount: z.number().int().nonnegative().optional(),
  })
  .strict();

export const listSurfaceSelectionSchema = z
  .object({
    mode: z.enum(["none", "single", "multiple"]).default("multiple"),
    label: z.string().trim().min(1).optional(),
    bulkScopeLabel: z.string().trim().min(1).optional(),
  })
  .strict();

export const listSurfaceGroupingSchema = z
  .object({
    groups: z
      .array(
        z
          .object({
            id: z.string().trim().min(1),
            label: z.string().trim().min(1),
            rowIds: z.array(z.string().trim().min(1)).min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const listSurfaceSummarySchema = z
  .object({
    rows: z
      .array(
        z
          .object({
            id: z.string().trim().min(1),
            label: z.string().trim().min(1),
            cells: z.record(z.string(), listSurfaceRowCellSchema),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const listSurfaceColumnStateSchema = z
  .object({
    resetHref: z.string().trim().min(1).optional(),
  })
  .strict();

export const listSurfaceDecisionLedgerSchema = z
  .object({
    enabled: z.boolean().default(true),
    label: z.string().trim().min(1).optional(),
  })
  .strict();

export const listSurfacePresentationSchema = z
  .object({
    variant: z.enum(["full", "table-only"]).default("full"),
    tableDensity: z.enum(["compact", "comfortable"]).default("compact"),
    narrowMode: z.enum(["table", "cards", "auto"]).optional(),
    primaryColumnId: z.string().trim().min(1).optional(),
    stickyHeader: z.boolean().optional(),
    virtualizeRowThreshold: z.number().int().positive().optional(),
    toolbar: listSurfaceToolbarSchema.optional(),
    selection: listSurfaceSelectionSchema.optional(),
    grouping: listSurfaceGroupingSchema.optional(),
    summary: listSurfaceSummarySchema.optional(),
    columnState: listSurfaceColumnStateSchema.optional(),
    decisionLedger: listSurfaceDecisionLedgerSchema.optional(),
  })
  .strict();

export type ListSurfacePresentation = z.infer<
  typeof listSurfacePresentationSchema
>;

const listSurfaceRendererConfigurationCoreSchema =
  governedMetadataSchemaVersionSchema.extend({
    dataNature: listSurfaceRendererDataNatureSchema.default("table"),
    requiresErpPermission: erpPermissionRequirementSchema.optional(),
    presentation: listSurfacePresentationSchema.optional(),
    pagination: listSurfacePaginationSchema.optional(),
    surface: listSurfaceSchema,
    columns: z.array(listColumnSchema).min(1),
    rows: z.array(listSurfaceRowSchema),
  });

const listSurfaceRendererConfigurationWithProfileSchema =
  listSurfaceRendererConfigurationCoreSchema.extend({
    presentationProfile: listPresentationProfileIdSchema.optional(),
  });

const listSurfaceRendererConfigurationValidatedSchema =
  listSurfaceRendererConfigurationWithProfileSchema.superRefine(
    (config, context) => {
      const columnIds = new Set(config.columns.map((column) => column.id));
      const rowIds = new Set(config.rows.map((row) => row.id));
      const groupIds = new Set<string>();

      for (const group of config.presentation?.grouping?.groups ?? []) {
        if (groupIds.has(group.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate list group id '${group.id}'`,
            path: ["presentation", "grouping", "groups"],
          });
        }
        groupIds.add(group.id);

        for (const rowId of group.rowIds) {
          if (!rowIds.has(rowId)) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Unknown grouped row id '${rowId}'`,
              path: ["presentation", "grouping", "groups", group.id, "rowIds"],
            });
          }
        }
      }

      for (const summaryRow of config.presentation?.summary?.rows ?? []) {
        for (const columnId of Object.keys(summaryRow.cells)) {
          if (!columnIds.has(columnId)) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Unknown summary column id '${columnId}'`,
              path: ["presentation", "summary", "rows", summaryRow.id, "cells"],
            });
          }
        }
      }

      for (const [rowIndex, row] of config.rows.entries()) {
        const trailingId = row.trailingAction?.descriptor?.id;
        const trailingState = row.trailingAction?.state;
        if (
          trailingId !== "document-lifecycle" ||
          trailingState === "hidden" ||
          trailingState === undefined
        ) {
          continue;
        }

        if (row.cells.scanStatusValue === undefined) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "scanStatusValue is required in cells when trailing action id is document-lifecycle",
            path: ["rows", rowIndex, "cells", "scanStatusValue"],
          });
        }

        if (row.cells.retentionClassValue === undefined) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "retentionClassValue is required in cells when trailing action id is document-lifecycle",
            path: ["rows", rowIndex, "cells", "retentionClassValue"],
          });
        }
      }
    },
  );

type ListSurfaceRendererConfigurationCore = z.infer<
  typeof listSurfaceRendererConfigurationCoreSchema
>;

function applyListPresentationProfile(
  config: ListSurfaceRendererConfigurationCore & {
    presentationProfile?: z.infer<typeof listPresentationProfileIdSchema>;
  },
): ListSurfaceRendererConfigurationCore {
  const { presentationProfile, presentation, ...rest } = config;
  if (!presentationProfile) {
    return presentation !== undefined ? { ...rest, presentation } : rest;
  }
  return {
    ...rest,
    presentation: resolveGovernedListPresentation({
      profile: presentationProfile,
      presentation,
    }),
  };
}

export const listSurfaceRendererConfigurationSchema =
  listSurfaceRendererConfigurationValidatedSchema.transform(
    applyListPresentationProfile,
  );

export type ListSurfaceRowTone = z.infer<typeof listSurfaceRowToneSchema>;
export type ListSurfaceRowDecisionLedger = z.infer<
  typeof listSurfaceRowDecisionLedgerSchema
>;
export type ListSurfaceRow = z.infer<typeof listSurfaceRowSchema>;
/** Parsed list config after profile transform — `presentationProfile` is stripped. */
export type ListSurfaceRendererConfiguration = z.output<
  typeof listSurfaceRendererConfigurationSchema
>;
export type ListSurfaceRendererConfigurationInput = z.input<
  typeof listSurfaceRendererConfigurationSchema
>;
/** Builder output: profile merged into `presentation`; no `presentationProfile` key. */
export type ListSurfaceRendererConfigurationResolvedInput = Omit<
  ListSurfaceRendererConfigurationInput,
  "presentationProfile"
>;

export type ParseListSurfaceRendererConfigurationResult =
  | { success: true; data: ListSurfaceRendererConfiguration }
  | { success: false; error: z.ZodError };

export function parseListSurfaceRendererConfiguration(
  raw: unknown,
): ParseListSurfaceRendererConfigurationResult {
  const result = listSurfaceRendererConfigurationSchema.safeParse(
    prepareGovernedConfigurationForParse(raw),
  );
  if (!result.success) {
    return result;
  }
  return {
    success: true,
    data: result.data as ListSurfaceRendererConfiguration,
  };
}
