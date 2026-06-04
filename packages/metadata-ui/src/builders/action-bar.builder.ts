import { z } from "zod";

import {
  METADATA_UI_ACTION_BAR_SCHEMA,
  METADATA_UI_ACTION_BAR_ITEM_SCHEMA,
  parseMetadataUiActionBar,
  type MetadataUiActionBar,
  type MetadataUiActionBarAlignment,
  type MetadataUiActionBarForLayout,
  type MetadataUiActionBarInput,
  type MetadataUiActionBarItem,
  type MetadataUiActionBarItemForPlacement,
  type MetadataUiActionBarItemInput,
  type MetadataUiActionBarItemPlacement,
  type MetadataUiActionBarLayout,
} from "../schemas/action-bar.schema";

type MetadataUiActionBarSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type MetadataUiActionBarBuilderInput = Omit<
  MetadataUiActionBarInput,
  MetadataUiActionBarSystemFields
>;

export type MetadataUiActionBarBuilderInputForLayout<
  Layout extends MetadataUiActionBarLayout,
  Alignment extends MetadataUiActionBarAlignment,
> = Omit<MetadataUiActionBarBuilderInput, "alignment" | "layout"> & {
  alignment?: Alignment;
  layout?: Layout;
};

export type MetadataUiActionBarBuilderResult<
  Input extends MetadataUiActionBarBuilderInput,
> = Input extends {
  layout?: infer Layout extends MetadataUiActionBarLayout;
}
  ? MetadataUiActionBarForLayout<Layout>
  : MetadataUiActionBar;

export type MetadataUiActionBarItemBuilderResult<
  Input extends MetadataUiActionBarItemInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiActionBarItemPlacement;
}
  ? MetadataUiActionBarItemForPlacement<Placement>
  : MetadataUiActionBarItem;

export type MetadataUiActionBarSafeCreateResult<
  Data extends MetadataUiActionBar = MetadataUiActionBar,
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

type ActionBarInput = Omit<
  MetadataUiActionBarInput,
  "schemaId" | "schemaVersion" | "stability"
>;

export function createActionBar<
  const Input extends MetadataUiActionBarBuilderInput,
>(input: Input): MetadataUiActionBarBuilderResult<Input> {
  return parseMetadataUiActionBar(input) as MetadataUiActionBarBuilderResult<Input>;
}

export function createActionBarItem<
  const Input extends MetadataUiActionBarItemInput,
>(input: Input): MetadataUiActionBarItemBuilderResult<Input> {
  return METADATA_UI_ACTION_BAR_ITEM_SCHEMA.parse(
    input,
  ) as MetadataUiActionBarItemBuilderResult<Input>;
}

export function createToolbarActionBar(
  input: Omit<ActionBarInput, "layout" | "alignment">,
): MetadataUiActionBarForLayout<"toolbar"> {
  return createActionBar({
    ...input,
    layout: "toolbar",
    alignment: "end",
  });
}

export function createInlineActionBar(
  input: Omit<ActionBarInput, "layout" | "alignment">,
): MetadataUiActionBarForLayout<"inline"> {
  return createActionBar({
    ...input,
    layout: "inline",
    alignment: "start",
  });
}

export function createStickyFooterActionBar(
  input: Omit<ActionBarInput, "layout" | "alignment">,
): MetadataUiActionBarForLayout<"sticky-footer"> {
  return createActionBar({
    ...input,
    layout: "sticky-footer",
    alignment: "end",
  });
}

export function safeCreateActionBar(
  input: unknown,
): MetadataUiActionBarSafeCreateResult {
  const result = METADATA_UI_ACTION_BAR_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiActionBar(result.data),
  };
}
