import {
  createKanbanBoard,
  createKanbanCard,
  createKanbanCardTemplate,
  createKanbanColumn,
  createKanbanTransition,
  withKanbanCards,
  withKanbanMode,
  withKanbanTransitions,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

export function createMetadataUiPlaygroundKanban() {
  const board = createKanbanBoard({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.kanbanMetadata,
    title: "Kanban preview",
    description:
      "Static board metadata for draggable-state and reduced-motion review.",
    columnField: "state",
    columns: [
      createKanbanColumn({
        key: "queued",
        label: "Queued",
        description: "Sample records waiting for review.",
        order: 10,
      }),
      createKanbanColumn({
        key: "review",
        label: "Review",
        description: "Sample records under static review.",
        order: 20,
      }),
      createKanbanColumn({
        key: "complete",
        label: "Complete",
        description: "Sample records with completed review metadata.",
        order: 30,
        drop: {
          enabled: false,
          disabledReason: "Completion is locked in this static preview.",
        },
      }),
    ],
    cardTemplate: createKanbanCardTemplate({
      titleField: "title",
      descriptionField: "description",
      badgeFields: ["priority"],
      metadataFields: ["owner"],
    }),
    footer: {
      enabled: true,
      summaryLabel: "3 static sample cards",
      showColumnCounts: true,
      actions: [],
    },
  });

  return withKanbanTransitions(
    withKanbanCards(withKanbanMode(board, "draggable"), [
      createKanbanCard({
        key: "metadata-ui.playground.kanban.card.queued",
        record: {
          id: "metadata-ui.playground.kanban.card.queued",
          title: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} queued`,
          description: "Static card waiting for sample review.",
          state: "queued",
          priority: "Standard",
          owner: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
        },
      }),
      createKanbanCard({
        key: "metadata-ui.playground.kanban.card.review",
        record: {
          id: "metadata-ui.playground.kanban.card.review",
          title: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} review`,
          description: "Static card in sample review.",
          state: "review",
          priority: "Focused",
          owner: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
        },
      }),
      createKanbanCard({
        key: "metadata-ui.playground.kanban.card.complete",
        record: {
          id: "metadata-ui.playground.kanban.card.complete",
          title: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} complete`,
          description: "Static card with completed sample review.",
          state: "complete",
          priority: "Complete",
          owner: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
        },
      }),
    ]),
    [
      createKanbanTransition({
        key: "metadata-ui.playground.kanban.transition.queue-review",
        fromColumnKey: "queued",
        toColumnKey: "review",
        label: "Move to review",
        available: true,
        hint: "Host-owned movement intent only; no ERP mutation is attached.",
        intent: {
          actionKey: "metadata-ui.playground.kanban.intent.queue-review",
          payload: {
            source: "metadata-ui-playground",
          },
        },
      }),
      createKanbanTransition({
        key: "metadata-ui.playground.kanban.transition.review-complete",
        fromColumnKey: "review",
        toColumnKey: "complete",
        label: "Complete review",
        available: false,
        disabledReason: "Completion is disabled in this static preview.",
      }),
    ],
  );
}
