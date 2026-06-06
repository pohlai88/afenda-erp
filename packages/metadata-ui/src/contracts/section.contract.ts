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

const METADATA_UI_SECTION_ID_BY_KIND = {
  list: "metadata-ui.section.list",
  stat: "metadata-ui.section.stat",
  chart: "metadata-ui.section.chart",
  "action-bar": "metadata-ui.section.action-bar",
  form: "metadata-ui.section.form",
  "multi-step-form": "metadata-ui.section.multi-step-form",
  "scorecard-form": "metadata-ui.section.scorecard-form",
  kanban: "metadata-ui.section.kanban",
  "audit-panel": "metadata-ui.section.audit-panel",
  "approval-timeline": "metadata-ui.section.approval-timeline",
  "detail-tabs": "metadata-ui.section.detail-tabs",
  "page-header": "metadata-ui.section.page-header",
  custom: "metadata-ui.section.custom",
} as const satisfies Record<MetadataUiSectionKind, string>;

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
  .trim()
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

    title: z.string().trim().min(1).max(120),

    description: z.string().trim().min(1).max(500).optional(),

    runtime: metadataUiRuntimeSchema.default("server"),

    lifecycle: metadataUiSectionLifecycleSchema.default("active"),

    composition: metadataUiSectionCompositionSchema.default("standalone"),

    schemaId: z.string().trim().min(1).max(160),

    rendererId: z.string().trim().min(1).max(160),

    presentation: metadataUiPresentationContractSchema.default(
      METADATA_UI_SECTION_DEFAULT_PRESENTATION,
    ),

    permission: metadataUiPermissionContractSchema.optional(),

    actions: z.array(metadataUiActionContractSchema).default([]),

    children: z.array(z.string()).default([]),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
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

    const expectedSchemaId = `metadata-ui.schema.${section.kind}`;
    if (section.schemaId !== expectedSchemaId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["schemaId"],
        message: `Section schemaId must be ${expectedSchemaId}.`,
      });
    }

    const expectedRendererId = `metadata-ui.renderer.${section.kind}`;
    if (section.rendererId !== expectedRendererId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rendererId"],
        message: `Section rendererId must be ${expectedRendererId}.`,
      });
    }

    if (
      section.presentation.visibility.showChrome === false &&
      section.presentation.visibility.showDivider === true
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["presentation", "visibility", "showDivider"],
        message: "Sections without chrome must not render a divider.",
      });
    }

    const expectedSectionId = METADATA_UI_SECTION_ID_BY_KIND[section.kind];
    if (section.id !== expectedSectionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id"],
        message: `Section id must be ${expectedSectionId}.`,
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

export type MetadataUiSectionIdForKind<
  Kind extends MetadataUiSectionKind,
> = (typeof METADATA_UI_SECTION_ID_BY_KIND)[Kind] & MetadataUiBrandedSectionId;

export type MetadataUiSectionSchemaIdFor<
  Kind extends MetadataUiSectionKind,
> = `metadata-ui.schema.${Kind}` & MetadataUiSectionSchemaId;

export type MetadataUiSectionRendererIdFor<
  Kind extends MetadataUiSectionKind,
> = `metadata-ui.renderer.${Kind}` & MetadataUiSectionRendererId;

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
    id: MetadataUiSectionIdForKind<Kind>;
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

  const expectedSchemaId = `metadata-ui.schema.${section.kind}`;
  if (section.schemaId !== expectedSchemaId) {
    throw new Error(`Section schemaId must be ${expectedSchemaId}.`);
  }

  const expectedRendererId = `metadata-ui.renderer.${section.kind}`;
  if (section.rendererId !== expectedRendererId) {
    throw new Error(`Section rendererId must be ${expectedRendererId}.`);
  }

  if (
    section.presentation.visibility.showChrome === false &&
    section.presentation.visibility.showDivider === true
  ) {
    throw new Error("Sections without chrome must not render a divider.");
  }

  const expectedSectionId = METADATA_UI_SECTION_ID_BY_KIND[section.kind];
  if (section.id !== expectedSectionId) {
    throw new Error(`Section id must be ${expectedSectionId}.`);
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

export function getMetadataUiSectionIdForKind(
  kind: MetadataUiSectionKind,
): MetadataUiSectionIdForKind<typeof kind> {
  return METADATA_UI_SECTION_ID_BY_KIND[kind] as MetadataUiSectionIdForKind<
    typeof kind
  >;
}

export function resolveMetadataUiSectionInstanceKey(
  section: Pick<MetadataUiSectionContractSchemaOutput, "id" | "metadata">,
): string {
  const metadata = section.metadata;

  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const diagnostics = (
      metadata as {
        diagnostics?: {
          sectionKey?: unknown;
        };
      }
    ).diagnostics;
    const diagnosticSectionKey = diagnostics?.sectionKey;

    if (typeof diagnosticSectionKey === "string" && diagnosticSectionKey.trim()) {
      return diagnosticSectionKey.trim();
    }

    const metadataKey = (metadata as { key?: unknown }).key;

    if (typeof metadataKey === "string" && metadataKey.trim()) {
      return metadataKey.trim();
    }
  }

  return section.id;
}
