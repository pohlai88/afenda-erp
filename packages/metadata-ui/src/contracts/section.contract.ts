import { z } from "zod";

import { metadataUiActionContractSchema } from "./action.contract";
import type { MetadataUiActionContract } from "./action.contract";
import { metadataUiPermissionContractSchema } from "./permission.contract";
import type { MetadataUiPermissionContract } from "./permission.contract";
import { metadataUiPresentationContractSchema } from "./presentation.contract";
import type { MetadataUiPresentationContract } from "./presentation.contract";
import { metadataUiRuntimeSchema } from "./runtime.contract";

/**
 * Runtime-neutral section contract.
 *
 * A section is the fundamental renderable unit
 * within Metadata UI.
 *
 * Sections are composed by renderers and shells.
 * Sections do not execute ERP business logic.
 */

const METADATA_UI_SECTION_KIND_VALUES = [
  "list",
  "stat",
  "chart",
  "action-bar",
  "form",
  "multi-step-form",
  "scorecard-form",
  "kanban",
  "audit-panel",
  "approval-timeline",
  "detail-tabs",
  "page-header",
  "custom",
] as const;

const METADATA_UI_SECTION_LIFECYCLE_VALUES = [
  "active",
  "experimental",
  "deprecated",
] as const;

const METADATA_UI_SECTION_COMPOSITION_VALUES = [
  "standalone",
  "embedded",
  "nested",
] as const;

const METADATA_UI_SECTION_DEFAULT_PRESENTATION = {
  chrome: {
    surface: "section",
    density: "comfortable",
    emphasis: "medium",
    tone: "neutral",
  },
  layout: {
    layout: "stack",
    alignment: "start",
    width: "full",
  },
  visibility: {
    showHeader: true,
    showDescription: true,
    showChrome: true,
    showDivider: false,
  },
  responsive: {
    priority: 50,
  },
  metadata: {},
} as const;

export const metadataUiSectionKindSchema = z.enum(
  METADATA_UI_SECTION_KIND_VALUES,
);

export const metadataUiSectionLifecycleSchema = z.enum(
  METADATA_UI_SECTION_LIFECYCLE_VALUES,
);

export const metadataUiSectionCompositionSchema = z.enum(
  METADATA_UI_SECTION_COMPOSITION_VALUES,
);

export const metadataUiSectionIdSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Section id must use lowercase kebab/dot notation.",
  );

export const metadataUiSectionContractSchema = z
  .object({
    id: metadataUiSectionIdSchema,

    kind: metadataUiSectionKindSchema,

    title: z.string().min(1).max(120),

    description: z.string().max(500).optional(),

    runtime: metadataUiRuntimeSchema.default("server"),

    lifecycle: metadataUiSectionLifecycleSchema.default("active"),

    composition: metadataUiSectionCompositionSchema.default("standalone"),

    schemaId: z.string().min(1).max(160),

    rendererId: z.string().min(1).max(160),

    presentation: metadataUiPresentationContractSchema.default(
      METADATA_UI_SECTION_DEFAULT_PRESENTATION,
    ),

    permission: metadataUiPermissionContractSchema.optional(),

    actions: z.array(metadataUiActionContractSchema).default([]),

    children: z.array(z.string()).default([]),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((section, ctx) => {
    if (section.runtime !== "server") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runtime"],
        message:
          "Section entries must be server runtime. Client runtime belongs to client islands.",
      });
    }

    if (
      section.composition === "nested" &&
      section.children.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["children"],
        message:
          "Nested sections must declare child sections.",
      });
    }

    if (
      section.kind === "page-header" &&
      section.actions.length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["actions"],
        message:
          "Page-header sections should not directly own actions.",
      });
    }
  });

export type MetadataUiSectionKind = z.infer<
  typeof metadataUiSectionKindSchema
>;

export type MetadataUiSectionLifecycle = z.infer<
  typeof metadataUiSectionLifecycleSchema
>;

export type MetadataUiSectionComposition = z.infer<
  typeof metadataUiSectionCompositionSchema
>;

export type MetadataUiSectionId = z.output<typeof metadataUiSectionIdSchema>;

type MetadataUiSectionContractSchemaOutput = z.output<
  typeof metadataUiSectionContractSchema
>;

export type MetadataUiSectionContractInput = z.input<
  typeof metadataUiSectionContractSchema
>;

declare const metadataUiSectionIdBrand: unique symbol;
declare const metadataUiSectionSchemaIdBrand: unique symbol;
declare const metadataUiSectionRendererIdBrand: unique symbol;

export type MetadataUiBrandedSectionId = MetadataUiSectionId & {
  readonly [metadataUiSectionIdBrand]: true;
};

export type MetadataUiSectionSchemaId = string & {
  readonly [metadataUiSectionSchemaIdBrand]: true;
};

export type MetadataUiSectionRendererId = string & {
  readonly [metadataUiSectionRendererIdBrand]: true;
};

export type MetadataUiSectionIdFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` &
  MetadataUiBrandedSectionId;

export type MetadataUiSectionSchemaIdFor<
  Kind extends MetadataUiSectionKind,
> = `${Kind}.schema` & MetadataUiSectionSchemaId;

export type MetadataUiSectionRendererIdFor<
  Kind extends MetadataUiSectionKind,
> = `${Kind}.renderer` & MetadataUiSectionRendererId;

export type MetadataUiNonEmptySectionChildren = [
  MetadataUiBrandedSectionId,
  ...MetadataUiBrandedSectionId[],
];

export type MetadataUiSectionCompositionState =
  | {
      composition: "nested";
      children: MetadataUiNonEmptySectionChildren;
    }
  | {
      composition: Exclude<MetadataUiSectionComposition, "nested">;
      children: MetadataUiBrandedSectionId[];
    };

export type MetadataUiSectionActionsState<
  Kind extends MetadataUiSectionKind,
> = Kind extends "page-header"
  ? {
      actions: [];
    }
  : {
      actions: MetadataUiActionContract[];
    };

export type MetadataUiSectionLifecycleState =
  | {
      lifecycle: "active";
    }
  | {
      lifecycle: "experimental";
    }
  | {
      lifecycle: "deprecated";
    };

type MetadataUiSectionContractBase = Omit<
  MetadataUiSectionContractSchemaOutput,
  | "actions"
  | "children"
  | "composition"
  | "id"
  | "kind"
  | "lifecycle"
  | "permission"
  | "presentation"
  | "rendererId"
  | "runtime"
  | "schemaId"
>;

export type MetadataUiSectionContractForKind<
  Kind extends MetadataUiSectionKind,
> = MetadataUiSectionContractBase &
  MetadataUiSectionActionsState<Kind> &
  MetadataUiSectionCompositionState &
  MetadataUiSectionLifecycleState & {
    id: MetadataUiBrandedSectionId;
    kind: Kind;
    runtime: "server";
    schemaId: MetadataUiSectionSchemaId;
    rendererId: MetadataUiSectionRendererId;
    presentation: MetadataUiPresentationContract;
    permission?: MetadataUiPermissionContract;
  };

export type MetadataUiSectionContract = {
  [Kind in MetadataUiSectionKind]: MetadataUiSectionContractForKind<Kind>;
}[MetadataUiSectionKind];

export type MetadataUiSectionContractParseResult =
  | {
      success: true;
      data: MetadataUiSectionContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiSectionContractInvariants(
  section: MetadataUiSectionContractSchemaOutput,
): asserts section is MetadataUiSectionContract {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(section.id)) {
    throw new Error("Section id must use lowercase kebab/dot notation.");
  }

  if (section.runtime !== "server") {
    throw new Error(
      "Section entries must be server runtime. Client runtime belongs to client islands.",
    );
  }

  if (section.composition === "nested" && section.children.length === 0) {
    throw new Error("Nested sections must declare child sections.");
  }

  if (section.kind === "page-header" && section.actions.length > 0) {
    throw new Error("Page-header sections should not directly own actions.");
  }
}

export function parseMetadataUiSectionContract(
  input: unknown,
): MetadataUiSectionContract {
  const section = metadataUiSectionContractSchema.parse(input);
  assertMetadataUiSectionContractInvariants(section);
  return section;
}

export function safeParseMetadataUiSectionContract(
  input: unknown,
): MetadataUiSectionContractParseResult {
  const result = metadataUiSectionContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiSectionContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
