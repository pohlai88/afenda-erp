import "server-only";

import type { AppShellChrome } from "@afenda/appshell/server";

import { METADATA_UI_PLAYGROUND_ROUTE } from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_COPY } from "./sample-vocabulary.fixture";

export function createMetadataUiPlaygroundChrome(): AppShellChrome {
  return {
    rail: {
      storageKey: "metadata-ui-playground",
      identity: {
        primary: "Metadata UI",
        secondary: "Developer playground",
      },
      labels: {
        ariaLabel: "Metadata UI playground navigation",
        searchPlaceholder: "Filter playground routes",
        searchAriaLabel: "Filter playground navigation",
        emptyState: "No playground routes match.",
      },
      sections: [
        {
          id: "metadata-ui-playground",
          label: "Playground",
          items: [
            {
              id: "metadata-ui-overview",
              label: METADATA_UI_PLAYGROUND_SAMPLE_COPY.overviewNavLabel,
              href: METADATA_UI_PLAYGROUND_ROUTE,
              icon: "layout-dashboard",
            },
          ],
        },
      ],
    },
    utilityBar: {
      brandHomeHref: METADATA_UI_PLAYGROUND_ROUTE,
      commandPlaceholder: "Search metadata UI playground",
      metadata: {
        version: 1,
        zones: [
          { id: "left", items: [] },
          { id: "center", items: [] },
          {
            id: "right",
            items: [
              {
                id: "metadata-ui-playground-account",
                zone: "right",
                kind: "account-anchor",
                intent: "account",
                adapterKey: "account",
                iconKey: "user-round",
                label: "Sample operator",
                ariaLabel: "Open sample operator menu",
                priority: 10,
              },
            ],
          },
        ],
      },
      organizations: [],
      launcherItems: [],
      account: {
        initials: "SO",
        title: METADATA_UI_PLAYGROUND_SAMPLE_COPY.operatorName,
        subtitle: METADATA_UI_PLAYGROUND_SAMPLE_COPY.accountSubtitle,
        email: METADATA_UI_PLAYGROUND_SAMPLE_COPY.operatorEmail,
      },
    },
    commandSections: [
      {
        id: "metadata-ui-playground-navigation",
        label: "Navigation",
        items: [
          {
            id: "metadata-ui-playground.open-overview",
            label: METADATA_UI_PLAYGROUND_SAMPLE_COPY.overviewCommandLabel,
            description:
              METADATA_UI_PLAYGROUND_SAMPLE_COPY.overviewCommandDescription,
            href: METADATA_UI_PLAYGROUND_ROUTE,
            icon: "layout-dashboard",
            kind: "navigation",
            keywords: ["metadata", "ui", "playground", "overview"],
          },
        ],
      },
    ],
    contextStack: null,
    preferences: {
      railMode: "expanded",
      density: "comfortable",
      utilityOrder: [],
      commandRecents: [],
    },
  };
}
