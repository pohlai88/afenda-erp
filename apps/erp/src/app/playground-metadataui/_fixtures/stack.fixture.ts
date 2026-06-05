import {
  METADATA_UI_PAGE_HEADER_SCHEMA_ID,
  createSurfacePageHeader,
} from "@afenda/metadata-ui";
import type { MetadataUiRenderableSectionStackItem } from "@afenda/metadata-ui/server";

import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_ROUTE,
} from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_COPY } from "./sample-vocabulary.fixture";

export function createMetadataUiPlaygroundStack(): readonly MetadataUiRenderableSectionStackItem[] {
  const pageHeader = createSurfacePageHeader({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.pageHeaderMetadata,
    eyebrow: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appEyebrow,
    title: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
    description: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appDescription,
  });

  return [
    {
      order: 10,
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.pageHeaderSection,
        kind: "page-header",
        title: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
        description: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appDescription,
        schemaId: METADATA_UI_PAGE_HEADER_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.page-header",
        metadata: {
          ...pageHeader,
          breadcrumbs: [
            {
              key: "metadata-ui.playground.breadcrumb",
              label: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
              href: METADATA_UI_PLAYGROUND_ROUTE,
              current: true,
            },
          ],
          badges: [
            {
              key: "metadata-ui.playground.badge",
              label: "Developer only",
              tone: "info",
            },
          ],
        },
      },
    },
  ] as const;
}
