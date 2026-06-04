import { z } from "zod";

import { metadataUiRuntimeSchema } from "./runtime.contract";
import type { MetadataUiRuntime } from "./runtime.contract";
import { metadataUiSectionKindSchema } from "./section.contract";
import type { MetadataUiSectionKind } from "./section.contract";

/**
 * Runtime-neutral renderer contract.
 *
 * Describes registered renderers. It does not render UI,
 * import React, import server-only modules, or discover files.
 */

const METADATA_UI_RENDERER_LIFECYCLE_VALUES = [
  "active",
  "experimental",
  "deprecated",
] as const;

export const metadataUiRendererIdSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Renderer id must use lowercase kebab/dot notation.",
  );

export const metadataUiRendererLifecycleSchema = z.enum(
  METADATA_UI_RENDERER_LIFECYCLE_VALUES,
);

export const metadataUiRendererContractSchema = z
  .object({
    id: metadataUiRendererIdSchema,

    sectionKind: metadataUiSectionKindSchema,

    runtime: metadataUiRuntimeSchema.default("server"),

    schemaId: z.string().min(1).max(160),

    modulePath: z.string().min(1).max(240),

    exportName: z.string().min(1).max(120).default("default"),

    lifecycle: metadataUiRendererLifecycleSchema.default("active"),

    description: z.string().min(1).max(240).optional(),

    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((renderer, ctx) => {
    if (renderer.runtime !== "server") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runtime"],
        message: "Renderers must use server runtime.",
      });
    }

    if (!renderer.modulePath.endsWith(".server")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modulePath"],
        message:
          "Renderer modulePath must reference a server renderer without file extension, e.g. sections/list/list-renderer.server.",
      });
    }
  });

export type MetadataUiRendererId = z.infer<typeof metadataUiRendererIdSchema>;

export type MetadataUiRendererLifecycle = z.infer<
  typeof metadataUiRendererLifecycleSchema
>;

type MetadataUiRendererContractSchemaOutput = z.output<
  typeof metadataUiRendererContractSchema
>;

export type MetadataUiRendererContractInput = z.input<
  typeof metadataUiRendererContractSchema
>;

declare const metadataUiRendererIdBrand: unique symbol;
declare const metadataUiRendererSchemaIdBrand: unique symbol;
declare const metadataUiRendererModulePathBrand: unique symbol;
declare const metadataUiRendererExportNameBrand: unique symbol;

export type MetadataUiBrandedRendererId = MetadataUiRendererId & {
  readonly [metadataUiRendererIdBrand]: true;
};

export type MetadataUiRendererSchemaId = string & {
  readonly [metadataUiRendererSchemaIdBrand]: true;
};

export type MetadataUiRendererModulePath = `${string}.server` & {
  readonly [metadataUiRendererModulePathBrand]: true;
};

export type MetadataUiRendererExportName = string & {
  readonly [metadataUiRendererExportNameBrand]: true;
};

export type MetadataUiRendererIdFor<
  SectionKind extends MetadataUiSectionKind,
  Name extends string = "renderer",
> = `${SectionKind}.${Lowercase<Name>}` & MetadataUiBrandedRendererId;

export type MetadataUiRendererSchemaIdFor<
  SectionKind extends MetadataUiSectionKind,
> = `${SectionKind}.schema` & MetadataUiRendererSchemaId;

export type MetadataUiRendererModulePathFor<
  SectionKind extends MetadataUiSectionKind,
  Name extends string = "renderer",
> = `${string}/${SectionKind}-${Lowercase<Name>}.server` &
  MetadataUiRendererModulePath;

export type MetadataUiRendererRuntimeState<
  Runtime extends MetadataUiRuntime,
> = Runtime extends "server"
  ? {
      runtime: "server";
    }
  : never;

export type MetadataUiRendererLifecycleState =
  | {
      lifecycle: "active";
      description?: string;
    }
  | {
      lifecycle: "experimental";
      description?: string;
    }
  | {
      lifecycle: "deprecated";
      description?: string;
    };

type MetadataUiRendererContractBase = Omit<
  MetadataUiRendererContractSchemaOutput,
  | "description"
  | "exportName"
  | "id"
  | "lifecycle"
  | "modulePath"
  | "runtime"
  | "schemaId"
  | "sectionKind"
>;

export type MetadataUiRendererContractForSectionKind<
  SectionKind extends MetadataUiSectionKind,
> = MetadataUiRendererContractBase &
  MetadataUiRendererRuntimeState<"server"> &
  MetadataUiRendererLifecycleState & {
    id: MetadataUiBrandedRendererId;
    sectionKind: SectionKind;
    schemaId: MetadataUiRendererSchemaId;
    modulePath: MetadataUiRendererModulePath;
    exportName: MetadataUiRendererExportName;
  };

export type MetadataUiRendererContract = {
  [SectionKind in MetadataUiSectionKind]: MetadataUiRendererContractForSectionKind<SectionKind>;
}[MetadataUiSectionKind];

export type MetadataUiRendererContractParseResult =
  | {
      success: true;
      data: MetadataUiRendererContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiRendererContractInvariants(
  renderer: MetadataUiRendererContractSchemaOutput,
): asserts renderer is MetadataUiRendererContract {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(renderer.id)) {
    throw new Error("Renderer id must use lowercase kebab/dot notation.");
  }

  if (renderer.runtime !== "server") {
    throw new Error("Renderers must use server runtime.");
  }

  if (!renderer.modulePath.endsWith(".server")) {
    throw new Error(
      "Renderer modulePath must reference a server renderer without file extension, e.g. sections/list/list-renderer.server.",
    );
  }
}

export function parseMetadataUiRendererContract(
  input: unknown,
): MetadataUiRendererContract {
  const renderer = metadataUiRendererContractSchema.parse(input);
  assertMetadataUiRendererContractInvariants(renderer);
  return renderer;
}

export function safeParseMetadataUiRendererContract(
  input: unknown,
): MetadataUiRendererContractParseResult {
  const result = metadataUiRendererContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiRendererContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
