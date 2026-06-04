import { z } from "zod";

import {
  METADATA_UI_PAGE_HEADER_BADGE_SCHEMA,
  METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA,
  METADATA_UI_PAGE_HEADER_SCHEMA,
  parseMetadataUiPageHeader,
  type MetadataUiPageHeader,
  type MetadataUiPageHeaderActionInput,
  type MetadataUiPageHeaderBadge,
  type MetadataUiPageHeaderBadgeForTone,
  type MetadataUiPageHeaderBadgeInput,
  type MetadataUiPageHeaderBadgeTone,
  type MetadataUiPageHeaderBreadcrumb,
  type MetadataUiPageHeaderBreadcrumbInput,
  type MetadataUiPageHeaderForLevel,
  type MetadataUiPageHeaderInput,
  type MetadataUiPageHeaderLevel,
} from "../schemas/page-header.schema";

type MetadataUiPageHeaderSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type PageHeaderBuilderInput = Omit<
  MetadataUiPageHeaderInput,
  MetadataUiPageHeaderSystemFields
>;

export type MetadataUiPageHeaderBuilderInputForLevel<
  Level extends MetadataUiPageHeaderLevel,
> = Omit<PageHeaderBuilderInput, "level"> & {
  level?: Level;
};

export type MetadataUiPageHeaderBuilderResult<
  Input extends PageHeaderBuilderInput,
> = Input extends {
  level?: infer Level extends MetadataUiPageHeaderLevel;
}
  ? MetadataUiPageHeaderForLevel<Level>
  : MetadataUiPageHeader;

export type MetadataUiPageHeaderBadgeBuilderResult<
  Input extends MetadataUiPageHeaderBadgeInput,
> = Input extends {
  tone?: infer Tone extends MetadataUiPageHeaderBadgeTone;
}
  ? MetadataUiPageHeaderBadgeForTone<Tone>
  : MetadataUiPageHeaderBadge;

export type MetadataUiPageHeaderBasicInput<
  Key extends string = string,
  Title extends string = string,
> = {
  key: Key;
  title: Title;
  description?: string;
  eyebrow?: string;
};

export type MetadataUiRecordPageHeaderInput<
  Key extends string = string,
  Title extends string = string,
> = MetadataUiPageHeaderBasicInput<Key, Title> & {
  breadcrumbs?: MetadataUiPageHeaderBreadcrumbInput[];
  badges?: MetadataUiPageHeaderBadgeInput[];
};

export type MetadataUiPageHeaderSafeCreateResult<
  Data extends MetadataUiPageHeader = MetadataUiPageHeader,
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

export function createPageHeader<const Input extends PageHeaderBuilderInput>(
  input: Input,
): MetadataUiPageHeaderBuilderResult<Input> {
  return parseMetadataUiPageHeader(
    input,
  ) as MetadataUiPageHeaderBuilderResult<Input>;
}

export function createModulePageHeader<
  const Input extends MetadataUiPageHeaderBasicInput,
>(input: Input): MetadataUiPageHeaderForLevel<"module"> {
  return createPageHeader({
    key: input.key,
    level: "module",
    title: input.title,
    description: input.description,
    eyebrow: input.eyebrow,
    breadcrumbs: [],
    badges: [],
    actions: [],
  });
}

export function createSurfacePageHeader<
  const Input extends MetadataUiPageHeaderBasicInput,
>(input: Input): MetadataUiPageHeaderForLevel<"surface"> {
  return createPageHeader({
    key: input.key,
    level: "surface",
    title: input.title,
    description: input.description,
    eyebrow: input.eyebrow,
    breadcrumbs: [],
    badges: [],
    actions: [],
  });
}

export function createRecordPageHeader<
  const Input extends MetadataUiRecordPageHeaderInput,
>(input: Input): MetadataUiPageHeaderForLevel<"record"> {
  return createPageHeader({
    key: input.key,
    level: "record",
    title: input.title,
    description: input.description,
    eyebrow: input.eyebrow,
    breadcrumbs: input.breadcrumbs ?? [],
    badges: input.badges ?? [],
    actions: [],
  });
}

export function createPageHeaderBreadcrumb<
  const Input extends MetadataUiPageHeaderBreadcrumbInput,
>(input: Input): MetadataUiPageHeaderBreadcrumb {
  return METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA.parse(
    input,
  ) as MetadataUiPageHeaderBreadcrumb;
}

export function createPageHeaderBadge<
  const Input extends MetadataUiPageHeaderBadgeInput,
>(input: Input): MetadataUiPageHeaderBadgeBuilderResult<Input> {
  return METADATA_UI_PAGE_HEADER_BADGE_SCHEMA.parse(
    input,
  ) as MetadataUiPageHeaderBadgeBuilderResult<Input>;
}

export function withPageHeaderLevel<const Level extends MetadataUiPageHeaderLevel>(
  header: MetadataUiPageHeaderInput,
  level: Level,
): MetadataUiPageHeaderForLevel<Level> {
  return createPageHeader({
    ...header,
    level,
  });
}

export function withPageHeaderBreadcrumbs(
  header: MetadataUiPageHeaderInput,
  breadcrumbs: MetadataUiPageHeaderBreadcrumbInput[],
): MetadataUiPageHeader {
  return createPageHeader({
    ...header,
    breadcrumbs,
  });
}

export function withPageHeaderBadges(
  header: MetadataUiPageHeaderInput,
  badges: MetadataUiPageHeaderBadgeInput[],
): MetadataUiPageHeader {
  return createPageHeader({
    ...header,
    badges,
  });
}

export function withPageHeaderActions(
  header: MetadataUiPageHeaderInput,
  actions: MetadataUiPageHeaderActionInput[],
): MetadataUiPageHeader {
  return createPageHeader({
    ...header,
    actions,
  });
}

export function safeCreatePageHeader(
  input: unknown,
): MetadataUiPageHeaderSafeCreateResult {
  const result = METADATA_UI_PAGE_HEADER_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiPageHeader(result.data),
  };
}
