import { z } from "zod";

import {
  METADATA_UI_SURFACE_CHROME_SCHEMA,
  METADATA_UI_SURFACE_SECTION_REF_SCHEMA,
  parseMetadataUiSurfaceChrome,
  type MetadataUiSurfaceChrome,
  type MetadataUiSurfaceChromeForDensity,
  type MetadataUiSurfaceChromeForVariant,
  type MetadataUiSurfaceChromeInput,
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

export type MetadataUiSurfaceChromeSafeCreateResult<
  Data extends MetadataUiSurfaceChrome = MetadataUiSurfaceChrome,
> =
  | {
      success: true;
      data: Data;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

export function createSurfaceChrome<
  const Input extends SurfaceChromeBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResult<Input> {
  return parseMetadataUiSurfaceChrome(
    input,
  ) as MetadataUiSurfaceChromeBuilderResult<Input>;
}

export function createModuleSurface<
  const Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResultFor<"module"> {
  return createSurfaceChrome({
    key: input.key,
    title: input.title,
    description: input.description,
    variant: "module",
    density: "comfortable",
    sections: input.sections,
  });
}

export function createRecordSurface<
  const Input extends MetadataUiSurfaceBuilderInput,
>(input: Input): MetadataUiSurfaceChromeBuilderResultFor<"record"> {
  return createSurfaceChrome({
    key: input.key,
    title: input.title,
    description: input.description,
    variant: "record",
    density: "comfortable",
    sections: input.sections,
  });
}

export function createSurfaceSectionRef<
  const Input extends MetadataUiSurfaceSectionRefInput,
>(input: Input): MetadataUiSurfaceSectionRefBuilderResult<Input> {
  return METADATA_UI_SURFACE_SECTION_REF_SCHEMA.parse({
    sectionKey: input.sectionKey,
    region: input.region ?? "primary",
    order: input.order ?? 0,
    lazy: input.lazy ?? false,
    permission: input.permission,
  }) as MetadataUiSurfaceSectionRefBuilderResult<Input>;
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

export function safeCreateSurfaceChrome(
  input: unknown,
): MetadataUiSurfaceChromeSafeCreateResult {
  const result = METADATA_UI_SURFACE_CHROME_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiSurfaceChrome(result.data),
  };
}
