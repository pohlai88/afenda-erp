import { z } from "zod";

/**
 * Runtime-neutral presentation contract.
 *
 * Describes visual and layout intent for metadata-ui renderers.
 *
 * This contract does not contain Tailwind classes, React components,
 * design-system implementation details, or ERP business rules.
 */

const METADATA_UI_PRESENTATION_DENSITY_VALUES = [
  "compact",
  "comfortable",
  "spacious",
] as const;

const METADATA_UI_PRESENTATION_TONE_VALUES = [
  "neutral",
  "primary",
  "positive",
  "warning",
  "critical",
  "muted",
] as const;

const METADATA_UI_PRESENTATION_EMPHASIS_VALUES = [
  "low",
  "medium",
  "high",
] as const;

const METADATA_UI_PRESENTATION_SURFACE_VALUES = [
  "plain",
  "card",
  "panel",
  "section",
  "embedded",
] as const;

const METADATA_UI_PRESENTATION_LAYOUT_VALUES = [
  "stack",
  "grid",
  "table",
  "tabs",
  "split",
  "inline",
] as const;

const METADATA_UI_PRESENTATION_ALIGNMENT_VALUES = [
  "start",
  "center",
  "end",
  "between",
] as const;

const METADATA_UI_PRESENTATION_WIDTH_VALUES = [
  "content",
  "full",
  "narrow",
  "wide",
] as const;

const METADATA_UI_PRESENTATION_BREAKPOINT_VALUES = [
  "sm",
  "md",
  "lg",
  "xl",
] as const;

export const metadataUiPresentationDensitySchema = z.enum(
  METADATA_UI_PRESENTATION_DENSITY_VALUES,
);

export const metadataUiPresentationToneSchema = z.enum(
  METADATA_UI_PRESENTATION_TONE_VALUES,
);

export const metadataUiPresentationEmphasisSchema = z.enum(
  METADATA_UI_PRESENTATION_EMPHASIS_VALUES,
);

export const metadataUiPresentationSurfaceSchema = z.enum(
  METADATA_UI_PRESENTATION_SURFACE_VALUES,
);

export const metadataUiPresentationLayoutSchema = z.enum(
  METADATA_UI_PRESENTATION_LAYOUT_VALUES,
);

export const metadataUiPresentationAlignmentSchema = z.enum(
  METADATA_UI_PRESENTATION_ALIGNMENT_VALUES,
);

export const metadataUiPresentationWidthSchema = z.enum(
  METADATA_UI_PRESENTATION_WIDTH_VALUES,
);

export const metadataUiPresentationBreakpointSchema = z.enum(
  METADATA_UI_PRESENTATION_BREAKPOINT_VALUES,
);

export const metadataUiPresentationChromeSchema = z.object({
  surface: metadataUiPresentationSurfaceSchema.default("section"),
  density: metadataUiPresentationDensitySchema.default("comfortable"),
  emphasis: metadataUiPresentationEmphasisSchema.default("medium"),
  tone: metadataUiPresentationToneSchema.default("neutral"),
}).strict();

export const metadataUiPresentationLayoutContractSchema = z.object({
  layout: metadataUiPresentationLayoutSchema.default("stack"),
  alignment: metadataUiPresentationAlignmentSchema.default("start"),
  width: metadataUiPresentationWidthSchema.default("full"),
}).strict();

export const metadataUiPresentationVisibilitySchema = z.object({
  showHeader: z.boolean().default(true),
  showDescription: z.boolean().default(true),
  showChrome: z.boolean().default(true),
  showDivider: z.boolean().default(false),
}).strict();

export const metadataUiPresentationResponsiveSchema = z.object({
  collapseBelow: metadataUiPresentationBreakpointSchema.optional(),
  priority: z.number().int().min(0).max(100).default(50),
}).strict();

const METADATA_UI_PRESENTATION_DEFAULT_CHROME = {
  surface: "section",
  density: "comfortable",
  emphasis: "medium",
  tone: "neutral",
} as const;

const METADATA_UI_PRESENTATION_DEFAULT_LAYOUT = {
  layout: "stack",
  alignment: "start",
  width: "full",
} as const;

const METADATA_UI_PRESENTATION_DEFAULT_VISIBILITY = {
  showHeader: true,
  showDescription: true,
  showChrome: true,
  showDivider: false,
} as const;

const METADATA_UI_PRESENTATION_DEFAULT_RESPONSIVE = {
  priority: 50,
} as const;

export const metadataUiPresentationContractSchema = z.object({
  chrome: metadataUiPresentationChromeSchema.default(
    METADATA_UI_PRESENTATION_DEFAULT_CHROME,
  ),
  layout: metadataUiPresentationLayoutContractSchema.default(
    METADATA_UI_PRESENTATION_DEFAULT_LAYOUT,
  ),
  visibility: metadataUiPresentationVisibilitySchema.default(
    METADATA_UI_PRESENTATION_DEFAULT_VISIBILITY,
  ),
  responsive: metadataUiPresentationResponsiveSchema.default(
    METADATA_UI_PRESENTATION_DEFAULT_RESPONSIVE,
  ),

  profileId: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(
      /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
      "Presentation profile id must use lowercase kebab/dot notation.",
    )
    .optional(),

  metadata: z.record(z.string(), z.unknown()).default({}),
})
  .strict()
  .superRefine((presentation, ctx) => {
    if (
      presentation.visibility.showChrome === false &&
      presentation.visibility.showDivider === true
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility", "showDivider"],
        message: "Hidden chrome cannot request a divider.",
      });
    }
  });

export type MetadataUiPresentationDensity = z.infer<
  typeof metadataUiPresentationDensitySchema
>;

export type MetadataUiPresentationTone = z.infer<
  typeof metadataUiPresentationToneSchema
>;

export type MetadataUiPresentationEmphasis = z.infer<
  typeof metadataUiPresentationEmphasisSchema
>;

export type MetadataUiPresentationSurface = z.infer<
  typeof metadataUiPresentationSurfaceSchema
>;

export type MetadataUiPresentationLayout = z.infer<
  typeof metadataUiPresentationLayoutSchema
>;

export type MetadataUiPresentationAlignment = z.infer<
  typeof metadataUiPresentationAlignmentSchema
>;

export type MetadataUiPresentationWidth = z.infer<
  typeof metadataUiPresentationWidthSchema
>;

export type MetadataUiPresentationBreakpoint = z.infer<
  typeof metadataUiPresentationBreakpointSchema
>;

export type MetadataUiPresentationChrome = z.infer<
  typeof metadataUiPresentationChromeSchema
>;

export type MetadataUiPresentationLayoutContract = z.infer<
  typeof metadataUiPresentationLayoutContractSchema
>;

export type MetadataUiPresentationVisibility = z.infer<
  typeof metadataUiPresentationVisibilitySchema
>;

export type MetadataUiPresentationResponsive = z.infer<
  typeof metadataUiPresentationResponsiveSchema
>;

type MetadataUiPresentationContractSchemaOutput = z.output<
  typeof metadataUiPresentationContractSchema
>;

export type MetadataUiPresentationContractInput = z.input<
  typeof metadataUiPresentationContractSchema
>;

export declare const metadataUiPresentationProfileIdBrand: unique symbol;

export type MetadataUiPresentationProfileId = string & {
  readonly [metadataUiPresentationProfileIdBrand]: true;
};

export type MetadataUiPresentationProfileIdFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` &
  MetadataUiPresentationProfileId;

export type MetadataUiPresentationChromeForSurface<
  Surface extends MetadataUiPresentationSurface,
> = MetadataUiPresentationChrome & {
  surface: Surface;
};

export type MetadataUiPresentationChromeForTone<
  Tone extends MetadataUiPresentationTone,
> = MetadataUiPresentationChrome & {
  tone: Tone;
};

export type MetadataUiPresentationLayoutContractForLayout<
  Layout extends MetadataUiPresentationLayout,
> = MetadataUiPresentationLayoutContract & {
  layout: Layout;
};

export type MetadataUiPresentationLayoutContractForWidth<
  Width extends MetadataUiPresentationWidth,
> = MetadataUiPresentationLayoutContract & {
  width: Width;
};

export type MetadataUiPresentationResponsiveWithCollapse<
  Breakpoint extends MetadataUiPresentationBreakpoint,
> = MetadataUiPresentationResponsive & {
  collapseBelow: Breakpoint;
};

export type MetadataUiPresentationResponsiveWithoutCollapse =
  MetadataUiPresentationResponsive & {
    collapseBelow?: undefined;
  };

export type MetadataUiPresentationResponsiveState =
  | MetadataUiPresentationResponsiveWithoutCollapse
  | {
      [Breakpoint in MetadataUiPresentationBreakpoint]: MetadataUiPresentationResponsiveWithCollapse<Breakpoint>;
    }[MetadataUiPresentationBreakpoint];

export type MetadataUiPresentationVisibilityChromeState =
  | {
      showChrome: true;
      showDivider: boolean;
    }
  | {
      showChrome: false;
      showDivider: false;
    };

export type MetadataUiPresentationVisibilityDescriptionState =
  | {
      showDescription: true;
    }
  | {
      showDescription: false;
    };

export type MetadataUiPresentationVisibilityState =
  Omit<MetadataUiPresentationVisibility, "showChrome" | "showDescription"> &
    MetadataUiPresentationVisibilityChromeState &
    MetadataUiPresentationVisibilityDescriptionState;

export type MetadataUiPresentationContractForSurface<
  Surface extends MetadataUiPresentationSurface,
> = MetadataUiPresentationContract & {
  chrome: MetadataUiPresentationChromeForSurface<Surface>;
};

export type MetadataUiPresentationContractForLayout<
  Layout extends MetadataUiPresentationLayout,
> = MetadataUiPresentationContract & {
  layout: MetadataUiPresentationLayoutContractForLayout<Layout>;
};

export type MetadataUiPresentationContract = Omit<
  MetadataUiPresentationContractSchemaOutput,
  "profileId" | "responsive" | "visibility"
> & {
  profileId?: MetadataUiPresentationProfileId;
  responsive: MetadataUiPresentationResponsiveState;
  visibility: MetadataUiPresentationVisibilityState;
};

export type MetadataUiPresentationContractParseResult =
  | {
      success: true;
      data: MetadataUiPresentationContract;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiPresentationContractInvariants(
  presentation: MetadataUiPresentationContractSchemaOutput,
): asserts presentation is MetadataUiPresentationContract {
  if (
    presentation.profileId &&
    !/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(presentation.profileId)
  ) {
    throw new Error(
      "Presentation profile id must use lowercase kebab/dot notation.",
    );
  }

  if (
    presentation.visibility.showChrome === false &&
    presentation.visibility.showDivider === true
  ) {
    throw new Error("Hidden chrome cannot request a divider.");
  }
}

export function parseMetadataUiPresentationContract(
  input: unknown,
): MetadataUiPresentationContract {
  const presentation = metadataUiPresentationContractSchema.parse(input);
  assertMetadataUiPresentationContractInvariants(presentation);
  return presentation;
}

export function safeParseMetadataUiPresentationContract(
  input: unknown,
): MetadataUiPresentationContractParseResult {
  const result = metadataUiPresentationContractSchema.safeParse(input);
  if (result.success) {
    assertMetadataUiPresentationContractInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
