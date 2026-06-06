import {
  createAuditTab,
  createContentTab,
  createDetailTabsSet,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

export function createMetadataUiPlaygroundDetailTabs() {
  return createDetailTabsSet({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.detailTabsMetadata,
    title: "Detail tabs preview",
    description:
      "Static tab metadata referencing existing renderer sections by key.",
    tabs: [
      createContentTab({
        key: "overview",
        label: "Overview",
        description: "References the dense list sample section.",
        sectionKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.listSection,
        defaultSelected: true,
      }),
      createContentTab({
        key: "forms",
        label: "Forms",
        description: "References the read-only form sample section.",
        sectionKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formSection,
      }),
      createAuditTab({
        key: "audit",
        label: "Audit",
        description: "References the static audit panel sample section.",
        sectionKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.auditPanelSection,
      }),
    ],
  });
}
