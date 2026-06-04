import { z } from "zod";

import { metadataUiComponentContractSchema } from "./component.contract";
import type { MetadataUiComponentContract } from "./component.contract";
import { metadataUiRendererContractSchema } from "./renderer.contract";
import type { MetadataUiRendererContract } from "./renderer.contract";
import { metadataUiSectionKindSchema } from "./section.contract";
import type { MetadataUiSectionKind } from "./section.contract";

/**
 * Runtime-neutral registry contract.
 *
 * Registry modules are the only permitted render discovery mechanism.
 * Filesystem scanning, barrel guessing, and dynamic path discovery are prohibited.
 */

const METADATA_UI_REGISTRY_KIND_VALUES = [
  "component",
  "renderer",
] as const;

const METADATA_UI_REGISTRY_LIFECYCLE_VALUES = [
  "active",
  "experimental",
  "deprecated",
] as const;

export const metadataUiRegistryIdSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Registry id must use lowercase kebab/dot notation.",
  );

export const metadataUiRegistryKindSchema = z.enum(
  METADATA_UI_REGISTRY_KIND_VALUES,
);

export const metadataUiRegistryLifecycleSchema = z.enum(
  METADATA_UI_REGISTRY_LIFECYCLE_VALUES,
);

export const metadataUiComponentRegistryContractSchema = z
  .object({
    id: metadataUiRegistryIdSchema,

    kind: z.literal("component"),

    lifecycle: metadataUiRegistryLifecycleSchema.default("active"),

    components: z.array(metadataUiComponentContractSchema).default([]),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((registry, ctx) => {
    const ids = new Set<string>();

    for (const [index, component] of registry.components.entries()) {
      if (ids.has(component.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["components", index, "id"],
          message: `Duplicate component id: ${component.id}`,
        });
      }

      ids.add(component.id);
    }
  });

export const metadataUiRendererRegistryContractSchema = z
  .object({
    id: metadataUiRegistryIdSchema,

    kind: z.literal("renderer"),

    lifecycle: metadataUiRegistryLifecycleSchema.default("active"),

    renderers: z.array(metadataUiRendererContractSchema).default([]),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((registry, ctx) => {
    const rendererIds = new Set<string>();
    const sectionKinds = new Map<string, string>();

    for (const [index, renderer] of registry.renderers.entries()) {
      if (rendererIds.has(renderer.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["renderers", index, "id"],
          message: `Duplicate renderer id: ${renderer.id}`,
        });
      }

      rendererIds.add(renderer.id);

      const existingRendererId = sectionKinds.get(renderer.sectionKind);

      if (existingRendererId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["renderers", index, "sectionKind"],
          message: `Section kind "${renderer.sectionKind}" is already registered to renderer "${existingRendererId}".`,
        });
      }

      sectionKinds.set(renderer.sectionKind, renderer.id);
    }
  });

export const metadataUiRegistryContractSchema = z.discriminatedUnion("kind", [
  metadataUiComponentRegistryContractSchema,
  metadataUiRendererRegistryContractSchema,
]);

export const metadataUiRegisteredSectionKindsSchema = z.array(
  metadataUiSectionKindSchema,
);

export type MetadataUiRegistryId = z.infer<typeof metadataUiRegistryIdSchema>;

export type MetadataUiRegistryKind = z.infer<typeof metadataUiRegistryKindSchema>;

export type MetadataUiRegistryLifecycle = z.infer<
  typeof metadataUiRegistryLifecycleSchema
>;

type MetadataUiComponentRegistryContractSchemaOutput = z.output<
  typeof metadataUiComponentRegistryContractSchema
>;

type MetadataUiRendererRegistryContractSchemaOutput = z.output<
  typeof metadataUiRendererRegistryContractSchema
>;

type MetadataUiRegistryContractSchemaOutput = z.output<
  typeof metadataUiRegistryContractSchema
>;

export type MetadataUiRegistryContractInput = z.input<
  typeof metadataUiRegistryContractSchema
>;

export type MetadataUiRegisteredSectionKind = z.infer<
  typeof metadataUiSectionKindSchema
>;

declare const metadataUiRegistryIdBrand: unique symbol;
declare const metadataUiUniqueComponentRegistryEntriesBrand: unique symbol;
declare const metadataUiUniqueRendererRegistryEntriesBrand: unique symbol;

export type MetadataUiBrandedRegistryId = MetadataUiRegistryId & {
  readonly [metadataUiRegistryIdBrand]: true;
};

export type MetadataUiRegistryIdFor<
  Kind extends MetadataUiRegistryKind,
  Name extends string,
> = `metadata-ui.${Kind}.${Lowercase<Name>}` & MetadataUiBrandedRegistryId;

export type MetadataUiRegistryEntriesForKind<
  Kind extends MetadataUiRegistryKind,
> = Kind extends "component"
  ? MetadataUiComponentContract[]
  : Kind extends "renderer"
    ? MetadataUiRendererContract[]
    : never;

export type MetadataUiUniqueComponentRegistryEntries =
  MetadataUiComponentContract[] & {
    readonly [metadataUiUniqueComponentRegistryEntriesBrand]: true;
  };

export type MetadataUiUniqueRendererRegistryEntries =
  MetadataUiRendererContract[] & {
    readonly [metadataUiUniqueRendererRegistryEntriesBrand]: true;
  };

export type MetadataUiRendererRegistryBySectionKind<
  Renderers extends readonly MetadataUiRendererContract[],
> = {
  [SectionKind in MetadataUiSectionKind]: Extract<
    Renderers[number],
    { sectionKind: SectionKind }
  >;
};

export type MetadataUiRegisteredSectionKindsFor<
  Renderers extends readonly MetadataUiRendererContract[],
> = Extract<Renderers[number]["sectionKind"], MetadataUiSectionKind>;

export type MetadataUiComponentRegistryContract = Omit<
  MetadataUiComponentRegistryContractSchemaOutput,
  "components" | "id"
> & {
  id: MetadataUiBrandedRegistryId;
  components: MetadataUiUniqueComponentRegistryEntries;
};

export type MetadataUiRendererRegistryContract = Omit<
  MetadataUiRendererRegistryContractSchemaOutput,
  "id" | "renderers"
> & {
  id: MetadataUiBrandedRegistryId;
  renderers: MetadataUiUniqueRendererRegistryEntries;
};

export type MetadataUiRegistryContract =
  | MetadataUiComponentRegistryContract
  | MetadataUiRendererRegistryContract;

export type MetadataUiRegistryContractForKind<
  Kind extends MetadataUiRegistryKind,
> = Extract<MetadataUiRegistryContract, { kind: Kind }>;

export type MetadataUiRegistryContractParseResult =
  | {
      success: true;
      data: MetadataUiRegistryContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiRegistryContractInvariants(
  registry: MetadataUiRegistryContractSchemaOutput,
): asserts registry is MetadataUiRegistryContract {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(registry.id)) {
    throw new Error("Registry id must use lowercase kebab/dot notation.");
  }

  if (registry.kind === "component") {
    const componentIds = new Set<string>();

    for (const component of registry.components) {
      if (componentIds.has(component.id)) {
        throw new Error(`Duplicate component id: ${component.id}`);
      }

      componentIds.add(component.id);
    }
  }

  if (registry.kind === "renderer") {
    const rendererIds = new Set<string>();
    const sectionKinds = new Map<string, string>();

    for (const renderer of registry.renderers) {
      if (rendererIds.has(renderer.id)) {
        throw new Error(`Duplicate renderer id: ${renderer.id}`);
      }

      rendererIds.add(renderer.id);

      const existingRendererId = sectionKinds.get(renderer.sectionKind);
      if (existingRendererId) {
        throw new Error(
          `Section kind "${renderer.sectionKind}" is already registered to renderer "${existingRendererId}".`,
        );
      }

      sectionKinds.set(renderer.sectionKind, renderer.id);
    }
  }
}

export function parseMetadataUiRegistryContract(
  input: unknown,
): MetadataUiRegistryContract {
  const registry = metadataUiRegistryContractSchema.parse(input);
  assertMetadataUiRegistryContractInvariants(registry);
  return registry;
}

export function safeParseMetadataUiRegistryContract(
  input: unknown,
): MetadataUiRegistryContractParseResult {
  const result = metadataUiRegistryContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiRegistryContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
