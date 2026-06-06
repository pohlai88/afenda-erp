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
  type MetadataUiActionBarOverflow,
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

type MetadataUiActionBarLayoutDefaults = Readonly<
  Pick<ActionBarInput, "alignment" | "layout"> & {
    overflow: MetadataUiActionBarOverflow;
  }
>;

const METADATA_UI_ACTION_BAR_LAYOUT_DEFAULTS = {
  inline: {
    layout: "inline",
    alignment: "start",
    overflow: {
      enabled: false,
      triggerLabel: "More actions",
    },
  },
  toolbar: {
    layout: "toolbar",
    alignment: "end",
    overflow: {
      enabled: true,
      triggerLabel: "More actions",
      collapseAfter: 3,
    },
  },
  split: {
    layout: "split",
    alignment: "between",
    overflow: {
      enabled: true,
      triggerLabel: "More actions",
      collapseAfter: 2,
    },
  },
  overflow: {
    layout: "overflow",
    alignment: "end",
    overflow: {
      enabled: true,
      triggerLabel: "More actions",
      collapseAfter: 1,
    },
  },
  "sticky-footer": {
    layout: "sticky-footer",
    alignment: "end",
    overflow: {
      enabled: true,
      triggerLabel: "More actions",
      collapseAfter: 2,
    },
  },
} as const satisfies Record<
  MetadataUiActionBarLayout,
  MetadataUiActionBarLayoutDefaults
>;

function normalizeActionBarOverflowForLayout(
  layout: MetadataUiActionBarLayout,
  overflow: ActionBarInput["overflow"],
): MetadataUiActionBarOverflow {
  const defaults = METADATA_UI_ACTION_BAR_LAYOUT_DEFAULTS[layout].overflow;

  return {
    ...defaults,
    ...overflow,
  };
}

export function createActionBar<
  const Input extends MetadataUiActionBarBuilderInput,
>(input: Input): MetadataUiActionBarBuilderResult<Input> {
  return parseMetadataUiActionBar(input) as MetadataUiActionBarBuilderResult<Input>;
}

export function createActionBarForLayout<
  const Layout extends MetadataUiActionBarLayout,
>(
  input: Omit<ActionBarInput, "alignment" | "layout" | "overflow"> & {
    alignment?: MetadataUiActionBarAlignment;
    layout?: Layout;
    overflow?: ActionBarInput["overflow"];
  },
  layout: Layout,
): MetadataUiActionBarForLayout<Layout> {
  const defaults = METADATA_UI_ACTION_BAR_LAYOUT_DEFAULTS[layout];

  return createActionBar({
    ...input,
    layout,
    alignment: input.alignment ?? defaults.alignment,
    overflow: normalizeActionBarOverflowForLayout(layout, input.overflow),
  });
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
  return createActionBarForLayout(input, "toolbar");
}

export function createInlineActionBar(
  input: Omit<ActionBarInput, "layout" | "alignment">,
): MetadataUiActionBarForLayout<"inline"> {
  return createActionBarForLayout(input, "inline");
}

export function createSplitActionBar(
  input: Omit<ActionBarInput, "layout" | "alignment">,
): MetadataUiActionBarForLayout<"split"> {
  return createActionBarForLayout(input, "split");
}

export function createOverflowActionBar(
  input: Omit<ActionBarInput, "layout" | "alignment" | "actions"> & {
    actions: MetadataUiActionBarItemInput[];
  },
): MetadataUiActionBarForLayout<"overflow"> {
  return createActionBarForLayout(
    {
      ...input,
      actions: input.actions.map((action) => ({
        ...action,
        placement: "overflow",
      })),
    },
    "overflow",
  );
}

export function createStickyFooterActionBar(
  input: Omit<ActionBarInput, "layout" | "alignment">,
): MetadataUiActionBarForLayout<"sticky-footer"> {
  return createActionBar({
    ...input,
    layout: "sticky-footer",
    alignment: "end",
    overflow: normalizeActionBarOverflowForLayout(
      "sticky-footer",
      input.overflow,
    ),
  });
}

export function withActionBarActions(
  actionBar: MetadataUiActionBarInput,
  actions: MetadataUiActionBarItemInput[],
): MetadataUiActionBar {
  return createActionBar({
    ...actionBar,
    actions,
  });
}

export function appendActionBarAction(
  actionBar: MetadataUiActionBarInput,
  action: MetadataUiActionBarItemInput,
): MetadataUiActionBar {
  return withActionBarActions(actionBar, [...actionBar.actions, action]);
}

export function withActionBarOverflow(
  actionBar: MetadataUiActionBarInput,
  overflow: NonNullable<MetadataUiActionBarInput["overflow"]>,
): MetadataUiActionBar {
  return createActionBar({
    ...actionBar,
    overflow,
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
