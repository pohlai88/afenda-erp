import "server-only";

import {
  createContainsFilter,
  createList,
  createStatusColumn,
  createTextColumn,
} from "@afenda/metadata-ui";

import { METADATA_UI_ADVANCED_STATE_SEEDS } from "./advanced-seed.fixture";
import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

type MetadataUiAdvancedStateSeed =
  (typeof METADATA_UI_ADVANCED_STATE_SEEDS)[number];

type MetadataUiAdvancedState = MetadataUiAdvancedStateSeed["state"];

export type MetadataUiAdvancedStateMatrixRow = Readonly<{
  id: MetadataUiAdvancedStateSeed["id"];
  state: MetadataUiAdvancedState;
  stateLabel: string;
  rendererState: string;
  coverageType: string;
  description: string;
}>;

const stateLabelByState = {
  ready: "Ready",
  loading: "Loading",
  empty: "Empty",
  forbidden: "Forbidden",
  error: "Error",
} as const satisfies Record<MetadataUiAdvancedState, string>;

const rendererStateByState = {
  ready: "Renderable",
  loading: "Pending",
  empty: "No records",
  forbidden: "Permission denied",
  error: "Recoverable error",
} as const satisfies Record<MetadataUiAdvancedState, string>;

const coverageTypeByState = {
  ready: "success-path",
  loading: "skeleton-contract",
  empty: "empty-state",
  forbidden: "permission-state",
  error: "error-state",
} as const satisfies Record<MetadataUiAdvancedState, string>;

export const METADATA_UI_ADVANCED_STATE_MATRIX_ROWS =
  METADATA_UI_ADVANCED_STATE_SEEDS.map((seed) => ({
    id: seed.id,
    state: seed.state,
    stateLabel: stateLabelByState[seed.state],
    rendererState: rendererStateByState[seed.state],
    coverageType: coverageTypeByState[seed.state],
    description: seed.description,
  })) as readonly MetadataUiAdvancedStateMatrixRow[];

export function createMetadataUiAdvancedStateMatrixList() {
  return createList({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateSection,
    title: "Metadata state matrix",
    description:
      "Ready, loading, empty, forbidden, and error coverage rendered as metadata-only list rows.",
    rowKey: "id",
    density: "comfortable",
    selectionMode: "none",
    columns: [
      createStatusColumn({
        key: "metadata-ui.playground.state-matrix.column.state",
        field: "stateLabel",
        label: "State",
        width: {
          min: 136,
          ideal: 160,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.state-matrix.column.renderer-state",
        field: "rendererState",
        label: "Renderer state",
        width: {
          min: 164,
          ideal: 190,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.state-matrix.column.coverage",
        field: "coverageType",
        label: "Coverage",
        width: {
          min: 156,
          ideal: 180,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.state-matrix.column.description",
        field: "description",
        label: "Description",
        width: {
          min: 320,
          ideal: 520,
        },
      }),
    ],
    filters: [
      createContainsFilter({
        key: "metadata-ui.playground.state-matrix.filter.state",
        field: "stateLabel",
        label: "State",
        value: "Ready",
        locked: false,
      }),
    ],
    toolbar: {
      enabled: true,
      showSearch: true,
      searchPlaceholder: "Search renderer states",
      showFilters: true,
      showSavedViews: true,
      savedViews: [
        {
          key: "metadata-ui.playground.state-matrix.view.all",
          label: "All states",
          active: true,
        },
        {
          key: "metadata-ui.playground.state-matrix.view.exceptions",
          label: "Exception states",
          active: false,
        },
      ],
      showSort: true,
      showDensity: true,
      showExport: false,
    },
    pagination: {
      enabled: false,
      pageSize: 25,
      pageSizeOptions: [25],
    },
    virtualization: {
      enabled: false,
      rowEstimate: 56,
      overscan: 4,
      maxHeight: 360,
    },
    diagnostics: {
      testId: "metadata-ui-playground-state-matrix",
    },
  });
}
