import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";

export const METADATA_UI_KANBAN_SCHEMA_ID =
  "metadata-ui.schema.kanban" as const;

export const METADATA_UI_KANBAN_SCHEMA_VERSION = 1 as const;

export type MetadataUiKanbanSchemaStability = "beta";

export const METADATA_UI_KANBAN_SCHEMA_STABILITY: MetadataUiKanbanSchemaStability =
  "beta";

export const METADATA_UI_KANBAN_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Kanban keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_KANBAN_BOARD_MODE_SCHEMA = z.enum([
  "read-only",
  "draggable",
]);

export const METADATA_UI_KANBAN_REDUCED_MOTION_SCHEMA = z.enum([
  "respect-user",
  "always-static",
  "allow-motion",
]);

export const METADATA_UI_KANBAN_SWIMLANE_SCHEMA = z.object({
  key: METADATA_UI_KANBAN_KEY_SCHEMA,
  label: z.string().min(1).max(120),
  description: z.string().min(1).max(240).optional(),
  order: z.number().int().min(0).max(999),
  collapsible: z.boolean().default(false),
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_KANBAN_COLUMN_SCHEMA = z.object({
  key: METADATA_UI_KANBAN_KEY_SCHEMA,

  label: z.string().min(1).max(120),

  description: z.string().min(1).max(240).optional(),

  order: z.number().int().min(0).max(999),

  limit: z.number().int().min(1).max(10000).optional(),

  collapsible: z.boolean().default(false),

  drop: z
    .object({
      enabled: z.boolean().default(true),
      disabledReason: z.string().min(1).max(240).optional(),
    })
    .strict()
    .default({
      enabled: true,
    }),

  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_KANBAN_CARD_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,
  placement: z.enum(["inline", "overflow"]).default("overflow"),
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_KANBAN_MOVEMENT_SCHEMA = z.object({
  enabled: z.boolean().default(true),

  /**
   * Metadata declaration only.
   * Runtime enforcement belongs to feature modules.
   */
  allowColumnMove: z.boolean().default(true),

  allowSwimlaneMove: z.boolean().default(true),

  requireConfirmation: z.boolean().default(false),
});

const METADATA_UI_KANBAN_DEFAULT_TRANSITION_INTENT = {
  payload: {},
} as const;

export const METADATA_UI_KANBAN_TRANSITION_SCHEMA = z
  .object({
    key: METADATA_UI_KANBAN_KEY_SCHEMA,
    fromColumnKey: METADATA_UI_KANBAN_KEY_SCHEMA,
    toColumnKey: METADATA_UI_KANBAN_KEY_SCHEMA,
    label: z.string().min(1).max(120),
    available: z.boolean().default(true),
    disabledReason: z.string().min(1).max(240).optional(),
    hint: z.string().min(1).max(240).optional(),
    intent: z
      .object({
        actionKey: z.string().min(1).max(160).optional(),
        payload: z.record(z.string(), z.unknown()).default({}),
      })
      .strict()
      .default(METADATA_UI_KANBAN_DEFAULT_TRANSITION_INTENT),
  })
  .strict()
  .superRefine((transition, ctx) => {
    if (!transition.available && !transition.disabledReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disabledReason"],
        message: "Unavailable kanban transitions must provide disabledReason.",
      });
    }
  });

export const METADATA_UI_KANBAN_FOOTER_SCHEMA = z
  .object({
    enabled: z.boolean().default(false),
    summaryLabel: z.string().min(1).max(160).optional(),
    showColumnCounts: z.boolean().default(true),
    actions: z
      .array(
        z
          .object({
            action: metadataUiActionContractSchema,
            permission: metadataUiPermissionContractSchema.optional(),
          })
          .strict(),
      )
      .max(6)
      .default([]),
  })
  .strict();

export const METADATA_UI_KANBAN_CARD_TEMPLATE_SCHEMA = z.object({
  titleField: z.string().min(1).max(160),

  descriptionField: z.string().min(1).max(160).optional(),

  badgeFields: z.array(z.string().min(1).max(160)).max(12).default([]),

  metadataFields: z.array(z.string().min(1).max(160)).max(20).default([]),
});

export const METADATA_UI_KANBAN_CARD_SCHEMA = z
  .object({
    key: METADATA_UI_KANBAN_KEY_SCHEMA,
    record: z.record(
      z.string().min(1).max(160),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    ),
    disabledReason: z.string().min(1).max(240).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const METADATA_UI_KANBAN_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_KANBAN_SCHEMA_ID)
    .default(METADATA_UI_KANBAN_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_KANBAN_SCHEMA_VERSION)
    .default(METADATA_UI_KANBAN_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_KANBAN_SCHEMA_STABILITY)
    .default(METADATA_UI_KANBAN_SCHEMA_STABILITY),

  key: METADATA_UI_KANBAN_KEY_SCHEMA,

  title: z.string().min(1).max(120).optional(),

  description: z.string().min(1).max(320).optional(),

  cardKeyField: z.string().min(1).max(160).default("id"),

  columnField: z.string().min(1).max(160),

  swimlaneField: z.string().min(1).max(160).optional(),

  mode: METADATA_UI_KANBAN_BOARD_MODE_SCHEMA.default("read-only"),

  reducedMotion: METADATA_UI_KANBAN_REDUCED_MOTION_SCHEMA.default(
    "respect-user",
  ),

  columns: z.array(METADATA_UI_KANBAN_COLUMN_SCHEMA).min(1).max(64),

  swimlanes: z
    .array(METADATA_UI_KANBAN_SWIMLANE_SCHEMA)
    .max(32)
    .default([]),

  movement: METADATA_UI_KANBAN_MOVEMENT_SCHEMA.default({
    enabled: true,
    allowColumnMove: true,
    allowSwimlaneMove: true,
    requireConfirmation: false,
  }),

  transitions: z
    .array(METADATA_UI_KANBAN_TRANSITION_SCHEMA)
    .max(256)
    .default([]),

  cardTemplate: METADATA_UI_KANBAN_CARD_TEMPLATE_SCHEMA,

  cards: z.array(METADATA_UI_KANBAN_CARD_SCHEMA).max(1000).default([]),

  cardActions: z
    .array(METADATA_UI_KANBAN_CARD_ACTION_SCHEMA)
    .max(12)
    .default([]),

  footer: METADATA_UI_KANBAN_FOOTER_SCHEMA.default({
    enabled: false,
    showColumnCounts: true,
    actions: [],
  }),

  emptyStateKey: METADATA_UI_KANBAN_KEY_SCHEMA.optional(),

  presentation: metadataUiPresentationContractSchema.optional(),

  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      componentKey: z.string().min(1).max(160).optional(),
      sectionKey: z.string().min(1).max(160).optional(),
      rendererKey: z.string().min(1).max(160).optional(),
      testId: z.string().min(1).max(160).optional(),
    })
    .optional(),
})
  .strict()
  .superRefine((kanban, ctx) => {
    const columnKeys = new Set(kanban.columns.map((column) => column.key));
    const swimlaneKeys = new Set(
      kanban.swimlanes.map((swimlane) => swimlane.key),
    );

    for (const [columnIndex, column] of kanban.columns.entries()) {
      if (
        kanban.columns.findIndex((candidate) => candidate.key === column.key) !==
        columnIndex
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["columns", columnIndex, "key"],
          message: "Kanban column keys must be unique.",
        });
      }
    }

    for (const [swimlaneIndex, swimlane] of kanban.swimlanes.entries()) {
      if (
        kanban.swimlanes.findIndex(
          (candidate) => candidate.key === swimlane.key,
        ) !== swimlaneIndex
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["swimlanes", swimlaneIndex, "key"],
          message: "Kanban swimlane keys must be unique.",
        });
      }
    }

    for (const [columnIndex, column] of kanban.columns.entries()) {
      if (!column.drop.enabled && !column.drop.disabledReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["columns", columnIndex, "drop", "disabledReason"],
          message: "Disabled kanban drops must provide disabledReason.",
        });
      }
    }

    for (const [transitionIndex, transition] of kanban.transitions.entries()) {
      if (
        !columnKeys.has(transition.fromColumnKey) ||
        !columnKeys.has(transition.toColumnKey)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transitions", transitionIndex],
          message: "Kanban transitions must reference declared columns.",
        });
      }
    }

    for (const [cardIndex, card] of kanban.cards.entries()) {
      const columnValue = card.record[kanban.columnField];
      if (typeof columnValue !== "string" || !columnKeys.has(columnValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cards", cardIndex, "record", kanban.columnField],
          message: "Kanban card column field must reference a declared column.",
        });
      }

      if (!(kanban.cardTemplate.titleField in card.record)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cards", cardIndex, "record", kanban.cardTemplate.titleField],
          message: "Kanban card must contain the template title field.",
        });
      }

      if (kanban.swimlaneField) {
        const swimlaneValue = card.record[kanban.swimlaneField];
        if (
          typeof swimlaneValue === "string" &&
          kanban.swimlanes.length > 0 &&
          !swimlaneKeys.has(swimlaneValue)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["cards", cardIndex, "record", kanban.swimlaneField],
            message:
              "Kanban card swimlane field must reference a declared swimlane.",
          });
        }
      }
    }
  });

export type MetadataUiKanban = z.infer<
  typeof METADATA_UI_KANBAN_SCHEMA
>;

export type MetadataUiKanbanColumn = z.infer<
  typeof METADATA_UI_KANBAN_COLUMN_SCHEMA
>;

export type MetadataUiKanbanSwimlane = z.infer<
  typeof METADATA_UI_KANBAN_SWIMLANE_SCHEMA
>;

export type MetadataUiKanbanCardTemplate = z.infer<
  typeof METADATA_UI_KANBAN_CARD_TEMPLATE_SCHEMA
>;

export type MetadataUiKanbanBoardMode = z.infer<
  typeof METADATA_UI_KANBAN_BOARD_MODE_SCHEMA
>;

export type MetadataUiKanbanReducedMotion = z.infer<
  typeof METADATA_UI_KANBAN_REDUCED_MOTION_SCHEMA
>;

export type MetadataUiKanbanCard = z.infer<
  typeof METADATA_UI_KANBAN_CARD_SCHEMA
>;

export type MetadataUiKanbanTransition = z.infer<
  typeof METADATA_UI_KANBAN_TRANSITION_SCHEMA
>;
