import {
  METADATA_UI_SURFACE_SECTION_REF_SCHEMA,
  parseMetadataUiSurfaceChrome,
  safeParseMetadataUiSurfaceChrome,
  type MetadataUiSurfaceChrome,
  type MetadataUiSurfaceChromeForDensity,
  type MetadataUiSurfaceChromeForVariant,
  type MetadataUiSurfaceChromeInput,
  type MetadataUiSurfaceChromeParseResult,
  type MetadataUiSurfaceDensity,
  type MetadataUiSurfaceRegion,
  type MetadataUiSurfaceSectionRef,
  type MetadataUiSurfaceSectionRefForRegion,
  type MetadataUiSurfaceSectionRefInput,
  type MetadataUiSurfaceVariant,
} from "../schemas/surface-chrome.schema";

type MetadataUiSurfaceChromeSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type SurfaceChromeBuilderInput = Omit<
  MetadataUiSurfaceChromeInput,
  MetadataUiSurfaceChromeSystemFields
>;

export type MetadataUiSurfaceChromeBuilderResult<
  Input extends SurfaceChromeBuilderInput,
> = MetadataUiSurfaceChrome &
  (Input extends {
    variant?: infer Variant extends MetadataUiSurfaceVariant;
  }
    ? {
        variant: Variant;
      }
    : object) &
  (Input extends {
    density?: infer Density extends MetadataUiSurfaceDensity;
  }
    ? {
        density: Density;
      }
    : object);

export type MetadataUiSurfaceSectionRefBuilderResult<
  Input extends MetadataUiSurfaceSectionRefInput,
> = Input extends {
  region?: infer Region extends MetadataUiSurfaceRegion;
}
  ? MetadataUiSurfaceSectionRefForRegion<Region>
  : MetadataUiSurfaceSectionRef;

export type MetadataUiSurfaceBuilderInput<
  Key extends string = string,
  Sections extends readonly MetadataUiSurfaceSectionRefInput[] = MetadataUiSurfaceSectionRefInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  sections: Sections;
};

export type MetadataUiSurfaceChromeBuilderInputFor<
  Variant extends MetadataUiSurfaceVariant,
  Density extends MetadataUiSurfaceDensity = "comfortable",
> = Omit<SurfaceChromeBuilderInput, "density" | "variant"> & {
  variant?: Variant;
  density?: Density;
};

export type MetadataUiSurfaceChromeBuilderResultFor<
  Variant extends MetadataUiSurfaceVariant,
  Density extends MetadataUiSurfaceDensity = "comfortable",
> = MetadataUiSurfaceChromeForVariant<Variant> &
  MetadataUiSurfaceChromeForDensity<Density>;

export type MetadataUiSurfaceChromeSafeCreateResult =
  MetadataUiSurfaceChromeParseResult;

function normalizeSurfaceChromeBasicInput<
  Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceBuilderInput {
  return {
    key: input.key.trim(),
    title: input.title?.trim(),
    description: input.description?.trim(),
    sections: input.sections.map((section) => normalizeSurfaceSectionRefInput(section)),
  };
}

function normalizeSurfaceChromeInput<
  Input extends SurfaceChromeBuilderInput,
>(input: Input): SurfaceChromeBuilderInput {
  return {
    ...normalizeSurfaceChromeBasicInput(input),
    variant: input.variant ?? "module",
    density: input.density ?? "comfortable",
  };
}

function normalizeSurfaceSectionRefInput<
  Input extends MetadataUiSurfaceSectionRefInput,
>(input: Input): MetadataUiSurfaceSectionRefInput {
  return {
    ...input,
    sectionKey: input.sectionKey.trim(),
    region: input.region ?? "primary",
    order: input.order ?? 0,
    lazy: input.lazy ?? false,
  };
}

function createSurfaceChromeForVariant<
  const Variant extends MetadataUiSurfaceVariant,
>(
  input: MetadataUiSurfaceBuilderInput,
  variant: Variant,
): MetadataUiSurfaceChromeBuilderResultFor<Variant> {
  return createSurfaceChrome({
    ...input,
    variant,
    density: "comfortable",
  });
}

export function createSurfaceChrome<const Input extends SurfaceChromeBuilderInput>(
  input: Input,
): MetadataUiSurfaceChromeBuilderResult<Input> {
  return parseMetadataUiSurfaceChrome(normalizeSurfaceChromeInput(input)) as MetadataUiSurfaceChromeBuilderResult<Input>;
}

export function createWorkspaceSurface<
  const Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResultFor<"workspace"> {
  return createSurfaceChromeForVariant(input, "workspace");
}

export function createModuleSurface<
  const Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResultFor<"module"> {
  return createSurfaceChromeForVariant(input, "module");
}

export function createRecordSurface<
  const Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResultFor<"record"> {
  return createSurfaceChromeForVariant(input, "record");
}

export function createDialogSurface<
  const Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResultFor<"dialog"> {
  return createSurfaceChromeForVariant(input, "dialog");
}

export function createEmbeddedSurface<
  const Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResultFor<"embedded"> {
  return createSurfaceChromeForVariant(input, "embedded");
}

export function createSurfaceSectionRef<
  const Input extends MetadataUiSurfaceSectionRefInput,
>(input: Input): MetadataUiSurfaceSectionRefBuilderResult<Input> {
  return METADATA_UI_SURFACE_SECTION_REF_SCHEMA.parse(
    normalizeSurfaceSectionRefInput(input),
  ) as MetadataUiSurfaceSectionRefBuilderResult<Input>;
}

export function withSurfaceSections(
  surface: MetadataUiSurfaceChromeInput,
  sections: MetadataUiSurfaceSectionRefInput[],
): MetadataUiSurfaceChrome {
  return createSurfaceChrome({
    ...surface,
    sections,
  });
}

export function appendSurfaceSection(
  surface: MetadataUiSurfaceChromeInput,
  section: MetadataUiSurfaceSectionRefInput,
): MetadataUiSurfaceChrome {
  return createSurfaceChrome({
    ...surface,
    sections: [...(surface.sections ?? []), section],
  });
}

export function withSurfaceDensity<const Density extends MetadataUiSurfaceDensity>(
  surface: MetadataUiSurfaceChromeInput,
  density: Density,
): MetadataUiSurfaceChromeForDensity<Density> {
  return createSurfaceChrome({
    ...surface,
    density,
  });
}

export function withSurfaceVariant<const Variant extends MetadataUiSurfaceVariant>(
  surface: MetadataUiSurfaceChromeInput,
  variant: Variant,
): MetadataUiSurfaceChromeForVariant<Variant> {
  return createSurfaceChrome({
    ...surface,
    variant,
  });
}

export function safeCreateSurfaceChrome(
  input: unknown,
): MetadataUiSurfaceChromeSafeCreateResult {
  return safeParseMetadataUiSurfaceChrome(input);
}
