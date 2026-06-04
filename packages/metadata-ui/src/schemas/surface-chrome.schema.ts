import { z } from "zod";

import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_SURFACE_CHROME_SCHEMA_ID =
  "metadata-ui.schema.surface-chrome" as const;

export const METADATA_UI_SURFACE_CHROME_SCHEMA_VERSION = 1 as const;

export type MetadataUiSurfaceChromeSchemaStability = "beta";

export const METADATA_UI_SURFACE_CHROME_SCHEMA_STABILITY: MetadataUiSurfaceChromeSchemaStability =
  "beta";

const METADATA_UI_SURFACE_REGION_VALUES = [
  "header",
  "toolbar",
  "summary",
  "primary",
  "secondary",
  "aside",
  "footer",
] as const;

const METADATA_UI_SURFACE_VARIANT_VALUES = [
  "workspace",
  "module",
  "record",
  "dialog",
  "embedded",
] as const;

const METADATA_UI_SURFACE_DENSITY_VALUES = [
  "comfortable",
  "compact",
  "dense",
] as const;

export const METADATA_UI_SURFACE_CHROME_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Surface chrome keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_SURFACE_REGION_SCHEMA = z.enum(
  METADATA_UI_SURFACE_REGION_VALUES,
);

export const METADATA_UI_SURFACE_SECTION_REF_SCHEMA = z.object({
  sectionKey: METADATA_UI_SURFACE_CHROME_KEY_SCHEMA,
  region: METADATA_UI_SURFACE_REGION_SCHEMA.default("primary"),
  order: z.number().int().min(0).max(999).default(0),
  lazy: z.boolean().default(false),
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_SURFACE_CHROME_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_SURFACE_CHROME_SCHEMA_ID)
    .default(METADATA_UI_SURFACE_CHROME_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_SURFACE_CHROME_SCHEMA_VERSION)
    .default(METADATA_UI_SURFACE_CHROME_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_SURFACE_CHROME_SCHEMA_STABILITY)
    .default(METADATA_UI_SURFACE_CHROME_SCHEMA_STABILITY),

  key: METADATA_UI_SURFACE_CHROME_KEY_SCHEMA,

  title: z.string().min(1).max(160).optional(),
  description: z.string().min(1).max(360).optional(),

  variant: z
    .enum(METADATA_UI_SURFACE_VARIANT_VALUES)
    .default("module"),

  density: z.enum(METADATA_UI_SURFACE_DENSITY_VALUES).default("comfortable"),

  sections: z
    .array(METADATA_UI_SURFACE_SECTION_REF_SCHEMA)
    .min(1)
    .max(48),

  presentation: metadataUiPresentationContractSchema.optional(),
  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      surfaceKey: z.string().min(1).max(160).optional(),
      rendererKey: z.string().min(1).max(160).optional(),
      testId: z.string().min(1).max(160).optional(),
    })
    .optional(),
});

type MetadataUiSurfaceChromeSchemaOutput = z.output<
  typeof METADATA_UI_SURFACE_CHROME_SCHEMA
>;

type MetadataUiSurfaceSectionRefSchemaOutput = z.output<
  typeof METADATA_UI_SURFACE_SECTION_REF_SCHEMA
>;

type MetadataUiSurfaceChromeDiagnosticsSchemaOutput = NonNullable<
  MetadataUiSurfaceChromeSchemaOutput["diagnostics"]
>;

export type MetadataUiSurfaceChromeInput = z.input<
  typeof METADATA_UI_SURFACE_CHROME_SCHEMA
>;

export type MetadataUiSurfaceSectionRefInput = z.input<
  typeof METADATA_UI_SURFACE_SECTION_REF_SCHEMA
>;

export type MetadataUiSurfaceRegion = z.infer<
  typeof METADATA_UI_SURFACE_REGION_SCHEMA
>;

export type MetadataUiSurfaceVariant =
  (typeof METADATA_UI_SURFACE_VARIANT_VALUES)[number];

export type MetadataUiSurfaceDensity =
  (typeof METADATA_UI_SURFACE_DENSITY_VALUES)[number];

declare const metadataUiSurfaceChromeKeyBrand: unique symbol;
declare const metadataUiSurfaceSectionKeyBrand: unique symbol;
declare const metadataUiSurfaceDiagnosticKeyBrand: unique symbol;
declare const metadataUiSurfaceBoundedSectionsBrand: unique symbol;

type MetadataUiSurfaceTupleBetween<
  Value,
  Min extends number,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator["length"] extends Min
    ? Accumulator | MetadataUiSurfaceTupleBetween<Value, Min, Max, [...Accumulator, Value]>
    : MetadataUiSurfaceTupleBetween<Value, Min, Max, [...Accumulator, Value]>;

export type MetadataUiSurfaceChromeKey = string & {
  readonly [metadataUiSurfaceChromeKeyBrand]: true;
};

export type MetadataUiSurfaceChromeKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiSurfaceChromeKey;

export type MetadataUiSurfaceSectionKey = string & {
  readonly [metadataUiSurfaceSectionKeyBrand]: true;
};

export type MetadataUiSurfaceDiagnosticKey = string & {
  readonly [metadataUiSurfaceDiagnosticKeyBrand]: true;
};

export type MetadataUiSurfaceSectionRefForRegion<
  Region extends MetadataUiSurfaceRegion,
> = Omit<
  MetadataUiSurfaceSectionRefSchemaOutput,
  "permission" | "region" | "sectionKey"
> & {
  sectionKey: MetadataUiSurfaceSectionKey;
  region: Region;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiSurfaceSectionRef = {
  [Region in MetadataUiSurfaceRegion]: MetadataUiSurfaceSectionRefForRegion<Region>;
}[MetadataUiSurfaceRegion];

export type MetadataUiSurfaceSectionsByRegion<
  Sections extends readonly MetadataUiSurfaceSectionRef[],
> = {
  [Region in MetadataUiSurfaceRegion]: Extract<
    Sections[number],
    { region: Region }
  >[];
};

export type MetadataUiSurfaceOrderedSectionKeys<
  Sections extends readonly MetadataUiSurfaceSectionRef[],
> = Sections[number]["sectionKey"];

export type MetadataUiSurfaceBoundedSections =
  MetadataUiSurfaceTupleBetween<MetadataUiSurfaceSectionRef, 1, 48> & {
    readonly [metadataUiSurfaceBoundedSectionsBrand]: true;
  };

export type MetadataUiSurfaceChromeDiagnostics = Omit<
  MetadataUiSurfaceChromeDiagnosticsSchemaOutput,
  "rendererKey" | "surfaceKey" | "testId"
> & {
  surfaceKey?: MetadataUiSurfaceDiagnosticKey;
  rendererKey?: MetadataUiSurfaceDiagnosticKey;
  testId?: MetadataUiSurfaceDiagnosticKey;
};

export type MetadataUiSurfaceChrome = Omit<
  MetadataUiSurfaceChromeSchemaOutput,
  "diagnostics" | "key" | "permission" | "presentation" | "sections"
> & {
  key: MetadataUiSurfaceChromeKey;
  sections: MetadataUiSurfaceBoundedSections;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiSurfaceChromeDiagnostics;
};

export type MetadataUiSurfaceChromeForVariant<
  Variant extends MetadataUiSurfaceVariant,
> = MetadataUiSurfaceChrome & {
  variant: Variant;
};

export type MetadataUiSurfaceChromeForDensity<
  Density extends MetadataUiSurfaceDensity,
> = MetadataUiSurfaceChrome & {
  density: Density;
};

export type MetadataUiSurfaceChromeParseResult =
  | {
      success: true;
      data: MetadataUiSurfaceChrome;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiSurfaceChromeInvariants(
  surfaceChrome: MetadataUiSurfaceChromeSchemaOutput,
): asserts surfaceChrome is MetadataUiSurfaceChromeSchemaOutput & MetadataUiSurfaceChrome {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(surfaceChrome.key)) {
    throw new Error(
      "Surface chrome keys must use lowercase kebab/dot notation.",
    );
  }

  if (surfaceChrome.sections.length < 1 || surfaceChrome.sections.length > 48) {
    throw new Error("Surface chrome must declare between one and forty-eight sections.");
  }
}

export function parseMetadataUiSurfaceChrome(
  input: unknown,
): MetadataUiSurfaceChrome {
  const surfaceChrome = METADATA_UI_SURFACE_CHROME_SCHEMA.parse(input);
  assertMetadataUiSurfaceChromeInvariants(surfaceChrome);
  return surfaceChrome;
}

export function safeParseMetadataUiSurfaceChrome(
  input: unknown,
): MetadataUiSurfaceChromeParseResult {
  const result = METADATA_UI_SURFACE_CHROME_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiSurfaceChromeInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
