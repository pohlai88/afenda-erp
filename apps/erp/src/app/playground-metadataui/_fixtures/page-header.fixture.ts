import "server-only";

import {
  createPageHeaderAction,
  createPageHeaderBadge,
  createPageHeaderBreadcrumb,
  createRecordPageHeader,
  createWorkspacePageHeader,
  withPageHeaderActions,
  withPageHeaderBadges,
  withPageHeaderBreadcrumbs,
  type MetadataUiActionContractInput,
} from "@afenda/metadata-ui";

import { METADATA_UI_ADVANCED_PATTERN_SCENARIOS } from "./advanced-seed.fixture";
import type { MetadataUiAdvancedPatternKind } from "./advanced-seed-types.fixture";
import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_ROUTE,
} from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_COPY } from "./sample-vocabulary.fixture";

export type MetadataUiPlaygroundHeaderView =
  | Readonly<{ mode: "atlas" }>
  | Readonly<{
      mode: "pattern";
      pattern: Exclude<MetadataUiAdvancedPatternKind, "overview">;
    }>;

const openStateMatrixAction = {
  id: "metadata-ui.playground.header.action.open-state-matrix",
  label: "Open state matrix",
  description: "Navigate to the renderer state matrix pattern route.",
  intent: "open",
  tone: "primary",
  risk: "low",
  visibility: "visible",
  execution: {
    kind: "navigation",
    href: `${METADATA_UI_PLAYGROUND_ROUTE}/state-matrix`,
    target: "self",
  },
} as const satisfies MetadataUiActionContractInput;

const openOperationsAction = {
  id: "metadata-ui.playground.header.action.open-operations",
  label: "Open operations",
  description: "Navigate to the operations command surface pattern route.",
  intent: "navigate",
  tone: "neutral",
  risk: "low",
  visibility: "visible",
  execution: {
    kind: "navigation",
    href: `${METADATA_UI_PLAYGROUND_ROUTE}/operations-list`,
    target: "self",
  },
} as const satisfies MetadataUiActionContractInput;

function findAdvancedScenarioForKind(kind: MetadataUiAdvancedPatternKind) {
  const scenario = METADATA_UI_ADVANCED_PATTERN_SCENARIOS.find(
    (candidate) => candidate.kind === kind,
  );

  if (!scenario) {
    throw new Error(
      `Metadata UI playground page header references unknown pattern kind ${kind}`,
    );
  }

  return scenario;
}

const METADATA_UI_PAGE_HEADER_MAX_ACTIONS = 8 as const;

const METADATA_UI_PLAYGROUND_WORKSPACE_HEADER_FIXED_ACTIONS = 2 as const;

function createPatternNavigationOverflowActions(
  activePattern?: Exclude<MetadataUiAdvancedPatternKind, "overview">,
) {
  const overflowBudget =
    METADATA_UI_PAGE_HEADER_MAX_ACTIONS -
    METADATA_UI_PLAYGROUND_WORKSPACE_HEADER_FIXED_ACTIONS;

  return METADATA_UI_ADVANCED_PATTERN_SCENARIOS.filter(
    (scenario) =>
      scenario.kind !== "overview" && scenario.kind !== activePattern,
  )
    .slice(0, overflowBudget)
    .map((scenario) =>
      createPageHeaderAction({
        action: {
          id: `metadata-ui.playground.header.action.pattern.${scenario.kind}`,
          label: scenario.navigationLabel,
          description: scenario.description,
          intent: "navigate",
          tone: "neutral",
          risk: "low",
          visibility: "visible",
          execution: {
            kind: "navigation",
            href: `${METADATA_UI_PLAYGROUND_ROUTE}/${scenario.kind}`,
            target: "self",
          },
        },
        placement: "overflow",
      }),
    );
}

function createMetadataUiPlaygroundAtlasBreadcrumbs() {
  return [
    createPageHeaderBreadcrumb({
      key: "metadata-ui.playground.breadcrumb.developer-tools",
      label: "Developer tools",
      href: METADATA_UI_PLAYGROUND_ROUTE,
    }),
    createPageHeaderBreadcrumb({
      key: "metadata-ui.playground.breadcrumb.atlas",
      label: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
      href: METADATA_UI_PLAYGROUND_ROUTE,
      current: true,
    }),
  ];
}

function createMetadataUiPlaygroundPatternBreadcrumbs(
  pattern: Exclude<MetadataUiAdvancedPatternKind, "overview">,
) {
  const scenario = findAdvancedScenarioForKind(pattern);

  return [
    createPageHeaderBreadcrumb({
      key: "metadata-ui.playground.breadcrumb.developer-tools",
      label: "Developer tools",
      href: METADATA_UI_PLAYGROUND_ROUTE,
    }),
    createPageHeaderBreadcrumb({
      key: "metadata-ui.playground.breadcrumb.atlas",
      label: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
      href: METADATA_UI_PLAYGROUND_ROUTE,
    }),
    createPageHeaderBreadcrumb({
      key: `metadata-ui.playground.breadcrumb.pattern.${pattern}`,
      label: scenario.navigationLabel,
      href: `${METADATA_UI_PLAYGROUND_ROUTE}/${pattern}`,
      current: true,
    }),
  ];
}

export function createMetadataUiPlaygroundWorkspaceHeader(
  view: MetadataUiPlaygroundHeaderView = { mode: "atlas" },
) {
  const baseHeader = createWorkspacePageHeader({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.pageHeaderMetadata,
    eyebrow: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appEyebrow,
    title: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
    description: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appDescription,
  });

  const breadcrumbs =
    view.mode === "pattern"
      ? createMetadataUiPlaygroundPatternBreadcrumbs(view.pattern)
      : createMetadataUiPlaygroundAtlasBreadcrumbs();

  const badges = [
    createPageHeaderBadge({
      key: "metadata-ui.playground.badge.developer-only",
      label: "Developer only",
      tone: "info",
    }),
    createPageHeaderBadge({
      key: "metadata-ui.playground.badge.metadata-ui",
      label: "Metadata UI only",
      tone: "positive",
    }),
    createPageHeaderBadge({
      key:
        view.mode === "pattern"
          ? `metadata-ui.playground.badge.pattern.${view.pattern}`
          : "metadata-ui.playground.badge.full-atlas",
      label:
        view.mode === "pattern"
          ? findAdvancedScenarioForKind(view.pattern).navigationLabel
          : "Full atlas",
      tone: "neutral",
    }),
  ];

  const actions = [
    createPageHeaderAction({
      action: openStateMatrixAction,
      placement: "primary",
    }),
    createPageHeaderAction({
      action: openOperationsAction,
      placement: "secondary",
    }),
    ...createPatternNavigationOverflowActions(
      view.mode === "pattern" ? view.pattern : undefined,
    ),
  ];

  return withPageHeaderActions(
    withPageHeaderBadges(withPageHeaderBreadcrumbs(baseHeader, breadcrumbs), badges),
    actions,
  );
}

export function createMetadataUiPlaygroundPageHeaderShowcase() {
  const header = createRecordPageHeader({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.pageHeaderShowcaseMetadata,
    eyebrow: "Renderer family",
    title: "Page header anatomy",
    description:
      "Record-level header metadata exercising shadcn Breadcrumb, Badge, Button, and DropdownMenu through metadata-ui primitives only.",
    breadcrumbs: [
      createPageHeaderBreadcrumb({
        key: "metadata-ui.playground.page-header.showcase.breadcrumb.root",
        label: "Developer tools",
        href: METADATA_UI_PLAYGROUND_ROUTE,
      }),
      createPageHeaderBreadcrumb({
        key: "metadata-ui.playground.page-header.showcase.breadcrumb.atlas",
        label: "Metadata UI Playground",
        href: METADATA_UI_PLAYGROUND_ROUTE,
      }),
      createPageHeaderBreadcrumb({
        key: "metadata-ui.playground.page-header.showcase.breadcrumb.gallery",
        label: "Renderer gallery",
        href: METADATA_UI_PLAYGROUND_ROUTE,
      }),
      createPageHeaderBreadcrumb({
        key: "metadata-ui.playground.page-header.showcase.breadcrumb.family",
        label: "Page header",
        href: METADATA_UI_PLAYGROUND_ROUTE,
      }),
      createPageHeaderBreadcrumb({
        key: "metadata-ui.playground.page-header.showcase.breadcrumb.anatomy",
        label: "Anatomy preview",
        href: METADATA_UI_PLAYGROUND_ROUTE,
        current: true,
      }),
    ],
    badges: [
      createPageHeaderBadge({
        key: "metadata-ui.playground.page-header.showcase.badge.breadcrumb",
        label: "Breadcrumb overflow",
        tone: "info",
      }),
      createPageHeaderBadge({
        key: "metadata-ui.playground.page-header.showcase.badge.actions",
        label: "Action placements",
        tone: "positive",
      }),
      createPageHeaderBadge({
        key: "metadata-ui.playground.page-header.showcase.badge.shadcn",
        label: "shadcn via metadata-ui",
        tone: "neutral",
      }),
    ],
  });

  return withPageHeaderActions(header, [
    createPageHeaderAction({
      action: {
        id: "metadata-ui.playground.page-header.showcase.action.primary",
        label: "Primary action",
        description: "Primary placement maps to shadcn Button default variant.",
        intent: "open",
        tone: "primary",
        risk: "low",
        visibility: "visible",
        execution: {
          kind: "navigation",
          href: `${METADATA_UI_PLAYGROUND_ROUTE}/workflow-form`,
          target: "self",
        },
      },
      placement: "primary",
    }),
    createPageHeaderAction({
      action: {
        id: "metadata-ui.playground.page-header.showcase.action.secondary",
        label: "Secondary action",
        description: "Secondary placement maps to shadcn Button secondary variant.",
        intent: "navigate",
        tone: "neutral",
        risk: "low",
        visibility: "visible",
        execution: {
          kind: "navigation",
          href: `${METADATA_UI_PLAYGROUND_ROUTE}/analytics`,
          target: "self",
        },
      },
      placement: "secondary",
    }),
    createPageHeaderAction({
      action: {
        id: "metadata-ui.playground.page-header.showcase.action.overflow.table-lab",
        label: "Open table lab",
        description: "Overflow actions render through metadata-ui DropdownMenu.",
        intent: "navigate",
        tone: "neutral",
        risk: "low",
        visibility: "visible",
        execution: {
          kind: "navigation",
          href: `${METADATA_UI_PLAYGROUND_ROUTE}/tanstack-table`,
          target: "self",
        },
      },
      placement: "overflow",
    }),
    createPageHeaderAction({
      action: {
        id: "metadata-ui.playground.page-header.showcase.action.overflow.planning",
        label: "Open planning board",
        description: "Additional overflow route for menu density review.",
        intent: "navigate",
        tone: "neutral",
        risk: "low",
        visibility: "visible",
        execution: {
          kind: "navigation",
          href: `${METADATA_UI_PLAYGROUND_ROUTE}/planning-board`,
          target: "self",
        },
      },
      placement: "overflow",
    }),
  ]);
}
