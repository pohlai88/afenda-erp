import "server-only";

import {
  createApprovalFlowTimeline,
  createApprovalTimelineStep,
  createKanbanBoard,
  createKanbanCard,
  createKanbanCardTemplate,
  createKanbanColumn,
  createKanbanSwimlane,
  createKanbanTransition,
  withKanbanCards,
  withKanbanMode,
  withKanbanMovement,
  withKanbanSwimlanes,
  withKanbanTransitions,
} from "@afenda/metadata-ui";

import { METADATA_UI_ADVANCED_PLANNING_CARDS } from "./advanced-seed.fixture";
import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS,
} from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

const planningLaneCopy = {
  intake: {
    label: "Intake",
    description: "Static planning items being normalized for review.",
    order: 10,
  },
  review: {
    label: "Capacity review",
    description: "Static planning items requiring owner review.",
    order: 20,
  },
  ready: {
    label: "Release ready",
    description: "Static planning items ready for publication preview.",
    order: 30,
  },
} as const satisfies Record<
  (typeof METADATA_UI_ADVANCED_PLANNING_CARDS)[number]["lane"],
  Readonly<{
    label: string;
    description: string;
    order: number;
  }>
>;

const planningPriorityLabel = {
  high: "High priority",
  normal: "Normal priority",
  low: "Low priority",
} as const satisfies Record<
  (typeof METADATA_UI_ADVANCED_PLANNING_CARDS)[number]["priority"],
  string
>;

const planningStatusLabel = {
  review: "Under review",
  blocked: "Blocked",
  ready: "Ready",
} as const satisfies Record<
  (typeof METADATA_UI_ADVANCED_PLANNING_CARDS)[number]["status"],
  string
>;

function createPlanningColumns() {
  return Object.entries(planningLaneCopy).map(([key, lane]) =>
    createKanbanColumn({
      key,
      label: lane.label,
      description: lane.description,
      order: lane.order,
      drop:
        key === "ready"
          ? {
              enabled: false,
              disabledReason:
                "Release-ready planning movement is locked in this static preview.",
            }
          : {
              enabled: true,
            },
    }),
  );
}

export function createMetadataUiAdvancedPlanningBoard() {
  const board = createKanbanBoard({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningBoardMetadata,
    title: "Advanced planning board",
    description:
      "Static ERP-like kanban planning board with seeded lanes, swimlanes, and movement intents.",
    columnField: "lane",
    swimlaneField: "priorityBand",
    columns: createPlanningColumns(),
    cardTemplate: createKanbanCardTemplate({
      titleField: "title",
      descriptionField: "description",
      badgeFields: ["statusLabel", "priorityLabel"],
      metadataFields: ["owner", "planningWindow"],
    }),
    footer: {
      enabled: true,
      summaryLabel: `${METADATA_UI_ADVANCED_PLANNING_CARDS.length} deterministic planning cards`,
      showColumnCounts: true,
      actions: [],
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-planning-board",
    },
  });

  return withKanbanTransitions(
    withKanbanCards(
      withKanbanSwimlanes(
        withKanbanMovement(withKanbanMode(board, "draggable"), {
          enabled: true,
          allowColumnMove: true,
          allowSwimlaneMove: false,
          requireConfirmation: true,
        }),
        [
          createKanbanSwimlane({
            key: "high",
            label: "High",
            description: "High-priority deterministic planning work.",
            order: 10,
          }),
          createKanbanSwimlane({
            key: "normal",
            label: "Normal",
            description: "Normal-priority deterministic planning work.",
            order: 20,
          }),
          createKanbanSwimlane({
            key: "low",
            label: "Low",
            description: "Low-priority deterministic planning work.",
            order: 30,
          }),
        ],
      ),
      METADATA_UI_ADVANCED_PLANNING_CARDS.map((card) =>
        createKanbanCard({
          key: card.id,
          disabledReason:
            card.status === "blocked"
              ? "Blocked by seeded planning metadata; no command is attached."
              : undefined,
          record: {
            id: card.id,
            title: card.title,
            description:
              card.status === "blocked"
                ? "Capacity review is blocked by deterministic planning metadata."
                : "Static planning work item for advanced renderer preview.",
            lane: card.lane,
            priorityBand: card.priority,
            priorityLabel: planningPriorityLabel[card.priority],
            statusLabel: planningStatusLabel[card.status],
            owner: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
            planningWindow: "2026-Q1",
          },
          metadata: {
            seedKind: card.kind,
            mutationMode: "preview-only",
          },
        }),
      ),
    ),
    [
      createKanbanTransition({
        key: "metadata-ui.playground.advanced.planning.transition.intake-review",
        fromColumnKey: "intake",
        toColumnKey: "review",
        label: "Move to capacity review",
        available: true,
        hint: "Movement intent is metadata-only; no ERP command is attached.",
        intent: {
          actionKey:
            "metadata-ui.playground.advanced.planning.intent.intake-review",
          payload: {
            source: "metadata-ui-playground",
            mode: "preview-only",
          },
        },
      }),
      createKanbanTransition({
        key: "metadata-ui.playground.advanced.planning.transition.review-ready",
        fromColumnKey: "review",
        toColumnKey: "ready",
        label: "Mark release ready",
        available: false,
        disabledReason:
          "Release-ready movement is blocked in the static planning preview.",
      }),
    ],
  );
}

export function createMetadataUiAdvancedPlanningTimeline() {
  return createApprovalFlowTimeline({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningTimelineMetadata,
    title: "Advanced planning timeline",
    description:
      "Static planning timeline showing intake, review, blocked capacity, and release-ready milestones.",
    currentStepKey:
      "metadata-ui.playground.advanced.planning.timeline.capacity-review",
    steps: [
      createApprovalTimelineStep({
        key: "metadata-ui.playground.advanced.planning.timeline.intake",
        label: "Planning intake normalized",
        description: "Deterministic planning intake was prepared for review.",
        status: "approved",
        actor: {
          actorId: "metadata-ui.playground.advanced.planning.actor.operator",
          actorType: "user",
          displayName: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
        },
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowStart,
        comment: "Static planning intake entered the advanced board.",
        order: 10,
      }),
      createApprovalTimelineStep({
        key: "metadata-ui.playground.advanced.planning.timeline.capacity-review",
        label: "Capacity review in progress",
        description:
          "Planning capacity is represented as deterministic review metadata.",
        status: "pending",
        actor: {
          actorId: "metadata-ui.playground.advanced.planning.actor.group",
          actorType: "group",
          displayName: "Sample Planning Group",
        },
        dueAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
        comment: "Review window is fixed for stable screenshots.",
        order: 20,
      }),
      createApprovalTimelineStep({
        key: "metadata-ui.playground.advanced.planning.timeline.capacity-blocked",
        label: "Capacity exception blocked",
        description:
          "Blocked capacity milestone demonstrates non-mutating exception state.",
        status: "blocked",
        actor: {
          actorId: "metadata-ui.playground.advanced.planning.actor.system",
          actorType: "system",
          displayName: "Sample Planning System",
        },
        reason:
          "Blocked by static capacity metadata; no workflow engine is queried.",
        order: 30,
      }),
      createApprovalTimelineStep({
        key: "metadata-ui.playground.advanced.planning.timeline.release-ready",
        label: "Release-ready preview",
        description: "Final deterministic planning milestone is not yet active.",
        status: "skipped",
        actor: {
          actorId: "metadata-ui.playground.advanced.planning.actor.integration",
          actorType: "integration",
          displayName: "Sample Integration",
        },
        comment: "Skipped until the static capacity exception is resolved.",
        order: 40,
      }),
    ],
    diagnostics: {
      testId: "metadata-ui-playground-advanced-planning-timeline",
    },
  });
}
