import {
  createActionBarItem,
  createToolbarActionBar,
  type MetadataUiActionContractInput,
} from "@afenda/metadata-ui";

import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_ROUTE,
} from "./constants.fixture";

const inspectOverviewAction = {
  id: "metadata-ui.playground.action.inspect-overview",
  label: "Inspect overview",
  description: "Navigate to the static playground overview route.",
  intent: "open",
  tone: "primary",
  risk: "low",
  visibility: "visible",
  execution: {
    kind: "navigation",
    href: METADATA_UI_PLAYGROUND_ROUTE,
    target: "self",
  },
} as const satisfies MetadataUiActionContractInput;

const refreshPreviewAction = {
  id: "metadata-ui.playground.action.refresh-preview",
  label: "Refresh preview",
  description: "Client-only preview affordance without ERP mutation behavior.",
  intent: "retry",
  tone: "neutral",
  risk: "low",
  visibility: "disabled",
  disabledReason: "This playground does not execute ERP actions.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.event.refresh-preview",
  },
} as const satisfies MetadataUiActionContractInput;

const openNotesAction = {
  id: "metadata-ui.playground.action.open-notes",
  label: "Open notes",
  description: "Navigate to the static workflow pattern route.",
  intent: "navigate",
  tone: "neutral",
  risk: "low",
  visibility: "visible",
  execution: {
    kind: "navigation",
    href: `${METADATA_UI_PLAYGROUND_ROUTE}/workflow-form`,
    target: "self",
  },
} as const satisfies MetadataUiActionContractInput;

export function createMetadataUiPlaygroundActionBar() {
  return createToolbarActionBar({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.actionBarMetadata,
    title: "Renderer actions",
    description:
      "Static action metadata with navigation and disabled client-event states.",
    overflow: {
      enabled: true,
      triggerLabel: "More",
      collapseAfter: 2,
    },
    actions: [
      createActionBarItem({
        key: inspectOverviewAction.id,
        action: inspectOverviewAction,
        priority: "primary",
        placement: "main",
        diagnostics: {
          testId: "metadata-ui-playground-action-inspect-overview",
        },
      }),
      createActionBarItem({
        key: refreshPreviewAction.id,
        action: refreshPreviewAction,
        priority: "secondary",
        placement: "main",
        disabled: {
          value: true,
          reason: "This playground does not execute ERP actions.",
        },
        diagnostics: {
          testId: "metadata-ui-playground-action-refresh-preview",
        },
      }),
      createActionBarItem({
        key: openNotesAction.id,
        action: openNotesAction,
        priority: "tertiary",
        placement: "overflow",
        diagnostics: {
          testId: "metadata-ui-playground-action-open-notes",
        },
      }),
    ],
  });
}
