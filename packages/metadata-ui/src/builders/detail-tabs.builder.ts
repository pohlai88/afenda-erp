import { z } from "zod";

import {
  METADATA_UI_DETAIL_TAB_ACTION_SCHEMA,
  METADATA_UI_DETAIL_TAB_SCHEMA,
  METADATA_UI_DETAIL_TABS_SCHEMA,
  parseMetadataUiDetailTabs,
  type MetadataUiDetailTabAction,
  type MetadataUiDetailTabActionForPlacement,
  type MetadataUiDetailTabActionInput,
  type MetadataUiDetailTabActionPlacement,
  type MetadataUiDetailTab,
  type MetadataUiDetailTabForKind,
  type MetadataUiDetailTabInput,
  type MetadataUiDetailTabKind,
  type MetadataUiDetailTabs,
  type MetadataUiDetailTabsInput,
} from "../schemas/detail-tabs.schema";

type MetadataUiDetailTabsSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type DetailTabsBuilderInput = Omit<
  MetadataUiDetailTabsInput,
  MetadataUiDetailTabsSystemFields
>;

export type MetadataUiDetailTabBuilderResult<
  Input extends MetadataUiDetailTabInput,
> = Input extends {
  kind?: infer Kind extends MetadataUiDetailTabKind;
}
  ? MetadataUiDetailTabForKind<Kind>
  : MetadataUiDetailTab;

export type MetadataUiDetailTabActionBuilderResult<
  Input extends MetadataUiDetailTabActionInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiDetailTabActionPlacement;
}
  ? MetadataUiDetailTabActionForPlacement<Placement>
  : MetadataUiDetailTabAction;

export type MetadataUiDetailTabBasicInput<
  Key extends string = string,
  Label extends string = string,
  SectionKey extends string = string,
> = {
  key: Key;
  label: Label;
  sectionKey: SectionKey;
  description?: string;
  defaultSelected?: boolean;
};

export type MetadataUiAuditDetailTabInput<
  Key extends string = string,
  SectionKey extends string = string,
> = {
  key: Key;
  sectionKey: SectionKey;
  label?: string;
  description?: string;
};

export type MetadataUiDetailTabsSetInput<
  Key extends string = string,
  Tabs extends readonly MetadataUiDetailTabInput[] = MetadataUiDetailTabInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  tabs: Tabs;
};

export type MetadataUiDetailTabsBuilderResult<
  Input extends DetailTabsBuilderInput,
> = MetadataUiDetailTabs & {
  key: Input["key"];
};

export type MetadataUiDetailTabsSafeCreateResult<
  Data extends MetadataUiDetailTabs = MetadataUiDetailTabs,
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

export function createDetailTabs<const Input extends DetailTabsBuilderInput>(
  input: Input,
): MetadataUiDetailTabsBuilderResult<Input> {
  return parseMetadataUiDetailTabs(
    input,
  ) as MetadataUiDetailTabsBuilderResult<Input>;
}

export function createDetailTab<const Input extends MetadataUiDetailTabInput>(
  input: Input,
): MetadataUiDetailTabBuilderResult<Input> {
  return METADATA_UI_DETAIL_TAB_SCHEMA.parse(
    input,
  ) as MetadataUiDetailTabBuilderResult<Input>;
}

export function createDetailTabAction<
  const Input extends MetadataUiDetailTabActionInput,
>(input: Input): MetadataUiDetailTabActionBuilderResult<Input> {
  return METADATA_UI_DETAIL_TAB_ACTION_SCHEMA.parse(
    input,
  ) as MetadataUiDetailTabActionBuilderResult<Input>;
}

export function createContentTab<
  const Input extends MetadataUiDetailTabBasicInput,
>(input: Input): MetadataUiDetailTabForKind<"content"> {
  return createDetailTab({
    key: input.key,
    label: input.label,
    description: input.description,
    kind: "content",
    sectionKey: input.sectionKey,
    defaultSelected: input.defaultSelected ?? false,
    lazy: true,
  });
}

export function createAuditTab<
  const Input extends MetadataUiAuditDetailTabInput,
>(input: Input): MetadataUiDetailTabForKind<"audit"> {
  return createDetailTab({
    key: input.key,
    label: input.label ?? "Audit",
    description: input.description,
    kind: "audit",
    sectionKey: input.sectionKey,
    defaultSelected: false,
    lazy: true,
  });
}

export function createDetailTabsSet<
  const Input extends MetadataUiDetailTabsSetInput,
>(input: Input): MetadataUiDetailTabs {
  return createDetailTabs({
    key: input.key,
    title: input.title,
    description: input.description,
    tabs: input.tabs,
    actions: [],
  });
}

export function withDetailTabs(
  detailTabs: MetadataUiDetailTabsInput,
  tabs: MetadataUiDetailTabInput[],
): MetadataUiDetailTabs {
  return createDetailTabs({
    ...detailTabs,
    tabs,
  });
}

export function appendDetailTab(
  detailTabs: MetadataUiDetailTabsInput,
  tab: MetadataUiDetailTabInput,
): MetadataUiDetailTabs {
  return createDetailTabs({
    ...detailTabs,
    tabs: [...detailTabs.tabs, tab],
  });
}

export function withDetailTabActions(
  detailTabs: MetadataUiDetailTabsInput,
  actions: MetadataUiDetailTabActionInput[],
): MetadataUiDetailTabs {
  return createDetailTabs({
    ...detailTabs,
    actions,
  });
}

export function appendDetailTabAction(
  detailTabs: MetadataUiDetailTabsInput,
  action: MetadataUiDetailTabActionInput,
): MetadataUiDetailTabs {
  return createDetailTabs({
    ...detailTabs,
    actions: [...(detailTabs.actions ?? []), action],
  });
}

export function safeCreateDetailTabs(
  input: unknown,
): MetadataUiDetailTabsSafeCreateResult {
  const result = METADATA_UI_DETAIL_TABS_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiDetailTabs(result.data),
  };
}
