import {
  METADATA_UI_PAGE_HEADER_ACTION_SCHEMA,
  METADATA_UI_PAGE_HEADER_BADGE_SCHEMA,
  METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA,
  parseMetadataUiPageHeader,
  safeParseMetadataUiPageHeader,
  type MetadataUiPageHeader,
  type MetadataUiPageHeaderAction,
  type MetadataUiPageHeaderActionForPlacement,
  type MetadataUiPageHeaderActionInput,
  type MetadataUiPageHeaderActionPlacement,
  type MetadataUiPageHeaderBadge,
  type MetadataUiPageHeaderBadgeForTone,
  type MetadataUiPageHeaderBadgeInput,
  type MetadataUiPageHeaderBadgeTone,
  type MetadataUiPageHeaderBreadcrumb,
  type MetadataUiPageHeaderBreadcrumbInput,
  type MetadataUiPageHeaderForLevel,
  type MetadataUiPageHeaderInput,
  type MetadataUiPageHeaderLevel,
  type MetadataUiPageHeaderParseResult,
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

export type MetadataUiPageHeaderActionBuilderResult<
  Input extends MetadataUiPageHeaderActionInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiPageHeaderActionPlacement;
}
  ? MetadataUiPageHeaderActionForPlacement<Placement>
  : MetadataUiPageHeaderAction;

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

export type MetadataUiPageHeaderSafeCreateResult =
  MetadataUiPageHeaderParseResult;

function normalizePageHeaderBasicInput<
  Input extends MetadataUiPageHeaderBasicInput,
>(input: Input): MetadataUiPageHeaderBasicInput {
  return {
    ...input,
    key: input.key.trim(),
    title: input.title.trim(),
    description: input.description?.trim(),
    eyebrow: input.eyebrow?.trim(),
  };
}

function normalizePageHeaderBreadcrumbInput<
  Input extends MetadataUiPageHeaderBreadcrumbInput,
>(input: Input): MetadataUiPageHeaderBreadcrumbInput {
  return {
    ...input,
    key: input.key.trim(),
    label: input.label.trim(),
    href: input.href?.trim(),
    current: input.current ?? false,
  };
}

function normalizePageHeaderBadgeInput<
  Input extends MetadataUiPageHeaderBadgeInput,
>(input: Input): MetadataUiPageHeaderBadgeInput {
  return {
    ...input,
    key: input.key.trim(),
    label: input.label.trim(),
    tone: input.tone ?? "neutral",
  };
}

function normalizePageHeaderActionInput<
  Input extends MetadataUiPageHeaderActionInput,
>(input: Input): MetadataUiPageHeaderActionInput {
  return {
    ...input,
    placement: input.placement ?? "secondary",
  };
}

function createPageHeaderForLevel<const Level extends MetadataUiPageHeaderLevel>(
  input: MetadataUiPageHeaderBasicInput,
  level: Level,
): MetadataUiPageHeaderForLevel<Level> {
  return createPageHeader({
    ...normalizePageHeaderBasicInput(input),
    level,
    breadcrumbs: [],
    badges: [],
    actions: [],
  });
}

export function createPageHeader<const Input extends PageHeaderBuilderInput>(
  input: Input,
): MetadataUiPageHeaderBuilderResult<Input> {
  return parseMetadataUiPageHeader({
    ...normalizePageHeaderBasicInput(input),
    breadcrumbs:
      input.breadcrumbs?.map((breadcrumb) =>
        normalizePageHeaderBreadcrumbInput(breadcrumb),
      ) ?? [],
    badges:
      input.badges?.map((badge) => normalizePageHeaderBadgeInput(badge)) ?? [],
    actions:
      input.actions?.map((action) => normalizePageHeaderActionInput(action)) ??
      [],
  }) as MetadataUiPageHeaderBuilderResult<Input>;
}

export function createWorkspacePageHeader<
  const Input extends MetadataUiPageHeaderBasicInput,
>(input: Input): MetadataUiPageHeaderForLevel<"workspace"> {
  return createPageHeaderForLevel(input, "workspace");
}

export function createModulePageHeader<
  const Input extends MetadataUiPageHeaderBasicInput,
>(input: Input): MetadataUiPageHeaderForLevel<"module"> {
  return createPageHeaderForLevel(input, "module");
}

export function createSurfacePageHeader<
  const Input extends MetadataUiPageHeaderBasicInput,
>(input: Input): MetadataUiPageHeaderForLevel<"surface"> {
  return createPageHeaderForLevel(input, "surface");
}

export function createRecordPageHeader<
  const Input extends MetadataUiRecordPageHeaderInput,
>(input: Input): MetadataUiPageHeaderForLevel<"record"> {
  return createPageHeader({
    ...normalizePageHeaderBasicInput(input),
    level: "record",
    breadcrumbs:
      input.breadcrumbs?.map((breadcrumb) =>
        normalizePageHeaderBreadcrumbInput(breadcrumb),
      ) ?? [],
    badges:
      input.badges?.map((badge) => normalizePageHeaderBadgeInput(badge)) ?? [],
    actions: [],
  });
}

export function createDialogPageHeader<
  const Input extends MetadataUiPageHeaderBasicInput,
>(input: Input): MetadataUiPageHeaderForLevel<"dialog"> {
  return createPageHeaderForLevel(input, "dialog");
}

export function createPageHeaderBreadcrumb<
  const Input extends MetadataUiPageHeaderBreadcrumbInput,
>(input: Input): MetadataUiPageHeaderBreadcrumb {
  return METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA.parse(
    normalizePageHeaderBreadcrumbInput(input),
  ) as MetadataUiPageHeaderBreadcrumb;
}

export function createPageHeaderBadge<
  const Input extends MetadataUiPageHeaderBadgeInput,
>(input: Input): MetadataUiPageHeaderBadgeBuilderResult<Input> {
  return METADATA_UI_PAGE_HEADER_BADGE_SCHEMA.parse(
    normalizePageHeaderBadgeInput(input),
  ) as MetadataUiPageHeaderBadgeBuilderResult<Input>;
}

export function createPageHeaderAction<
  const Input extends MetadataUiPageHeaderActionInput,
>(input: Input): MetadataUiPageHeaderActionBuilderResult<Input> {
  return METADATA_UI_PAGE_HEADER_ACTION_SCHEMA.parse(
    normalizePageHeaderActionInput(input),
  ) as MetadataUiPageHeaderActionBuilderResult<Input>;
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

export function appendPageHeaderBreadcrumb(
  header: MetadataUiPageHeaderInput,
  breadcrumb: MetadataUiPageHeaderBreadcrumbInput,
): MetadataUiPageHeader {
  return createPageHeader({
    ...header,
    breadcrumbs: [...(header.breadcrumbs ?? []), breadcrumb],
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

export function appendPageHeaderBadge(
  header: MetadataUiPageHeaderInput,
  badge: MetadataUiPageHeaderBadgeInput,
): MetadataUiPageHeader {
  return createPageHeader({
    ...header,
    badges: [...(header.badges ?? []), badge],
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

export function appendPageHeaderAction(
  header: MetadataUiPageHeaderInput,
  action: MetadataUiPageHeaderActionInput,
): MetadataUiPageHeader {
  return createPageHeader({
    ...header,
    actions: [...(header.actions ?? []), action],
  });
}

export function safeCreatePageHeader(
  input: unknown,
): MetadataUiPageHeaderSafeCreateResult {
  return safeParseMetadataUiPageHeader(input);
}
