import { describe, expect, it } from "vitest";

import {
  createFileField,
  createFormSection,
  createSectionedForm,
} from "../builders/form.builder";
import {
  createKanbanBoard,
  createKanbanCard,
  createKanbanCardTemplate,
  createKanbanColumn,
  createKanbanTransition,
  withKanbanCards,
  withKanbanTransitions,
} from "../builders/kanban.builder";
import {
  createList,
  createListColumn,
} from "../builders/list.builder";
import {
  adaptGovernedPermissionTuple,
  adaptGovernedPresentationProfile,
  adaptGovernedSurfaceChrome,
  createGovernedParityCertificationGate,
} from "../migration/compatibility-adapters.shared";
import { parseMetadataUiChart } from "../schemas/chart.schema";
import { parseMetadataUiForm } from "../schemas/form.schema";
import { METADATA_UI_LIST_TRAILING_CELL_SCHEMA } from "../schemas/list.schema";

const HOST_ACTION = {
  id: "metadata-ui.fixture.action",
  label: "Open",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.fixture.open",
  },
} as const;

describe("governed parity hardening metadata", () => {
  it("validates list trailing cell descriptors", () => {
    const list = createList({
      key: "metadata-ui.fixture.list.trailing",
      columns: [
        createListColumn({
          key: "metadata-ui.fixture.name",
          field: "name",
          label: "Name",
        }),
      ],
      trailingCells: [
        METADATA_UI_LIST_TRAILING_CELL_SCHEMA.parse({
          key: "metadata-ui.fixture.trailing.action",
          kind: "action",
          label: "Open",
          action: HOST_ACTION,
        }),
        METADATA_UI_LIST_TRAILING_CELL_SCHEMA.parse({
          key: "metadata-ui.fixture.trailing.status",
          kind: "status",
          label: "Status",
          statusField: "status",
        }),
      ],
    });

    expect(list.trailingCells).toHaveLength(2);
    expect(() =>
      METADATA_UI_LIST_TRAILING_CELL_SCHEMA.parse({
        key: "metadata-ui.fixture.trailing.invalid",
        kind: "action",
        label: "Invalid",
      }),
    ).toThrow(/action contract/i);
  });

  it("validates host upload affordance metadata without storage transport", () => {
    const form = parseMetadataUiForm(
      createSectionedForm({
        key: "metadata-ui.fixture.upload-form",
        sections: [
          createFormSection({
            key: "metadata-ui.fixture.upload-section",
            fields: [
              createFileField({
                key: "metadata-ui.fixture.upload",
                name: "upload",
                label: "Upload",
                fileUpload: {
                  hostUploadKey: "metadata-ui.fixture.host-upload",
                  accept: ["application/pdf"],
                  maxSizeBytes: 1024,
                  existingFiles: [
                    {
                      key: "metadata-ui.fixture.file",
                      fileName: "contract.pdf",
                      sizeBytes: 100,
                    },
                  ],
                  uploadAction: HOST_ACTION,
                  status: "uploaded",
                },
              }),
            ],
          }),
        ],
      }),
    );

    const upload = form.sections[0]?.fields[0]?.fileUpload;
    expect(upload?.hostUploadKey).toBe("metadata-ui.fixture.host-upload");
    expect(upload?.existingFiles[0]?.fileName).toBe("contract.pdf");
    expect(() =>
      createFileField({
        key: "metadata-ui.fixture.blocked-upload",
        name: "blockedUpload",
        label: "Blocked upload",
        fileUpload: {
          hostUploadKey: "metadata-ui.fixture.blocked-upload",
          status: "blocked",
        },
      }),
    ).toThrow(/blockedReason/i);
  });

  it("validates heatmap, annotations, and reference bands", () => {
    const chart = parseMetadataUiChart({
      key: "metadata-ui.fixture.heatmap",
      kind: "heatmap",
      categoryKey: "month",
      series: [
        {
          key: "metadata-ui.fixture.value",
          label: "Value",
          valueKey: "value",
        },
      ],
      heatmap: {
        xKey: "month",
        yKey: "region",
        valueKey: "value",
        showValues: true,
      },
      annotations: [
        {
          key: "metadata-ui.fixture.annotation",
          label: "Peak",
          tone: "info",
        },
      ],
      referenceBands: [
        {
          key: "metadata-ui.fixture.band",
          label: "Target",
          from: 10,
          to: 20,
        },
      ],
      data: [{ month: "Jun", region: "North", value: 12 }],
    });

    expect(chart.kind).toBe("heatmap");
    expect(chart.annotations).toHaveLength(1);
    expect(chart.referenceBands).toHaveLength(1);
  });

  it("validates kanban transition hints and footer actions", () => {
    const board = createKanbanBoard({
      key: "metadata-ui.fixture.kanban",
      columnField: "status",
      columns: [
        createKanbanColumn({ key: "todo", label: "To do", order: 0 }),
        createKanbanColumn({ key: "done", label: "Done", order: 1 }),
      ],
      cardTemplate: createKanbanCardTemplate({
        titleField: "title",
        metadataFields: [],
      }),
      footer: {
        enabled: true,
        summaryLabel: "2 cards",
        actions: [{ action: HOST_ACTION }],
      },
    });
    const withCards = withKanbanCards(board, [
      createKanbanCard({
        key: "metadata-ui.fixture.card",
        record: { title: "Review", status: "todo" },
      }),
    ]);
    const kanban = withKanbanTransitions(withCards, [
      createKanbanTransition({
        key: "metadata-ui.fixture.move",
        fromColumnKey: "todo",
        toColumnKey: "done",
        label: "Move",
        hint: "Drop only after host policy allows it.",
      }),
    ]);

    expect(kanban.footer.enabled).toBe(true);
    expect(kanban.transitions[0]?.hint).toContain("host policy");
  });

  it("maps presentation, chrome, permission, and certification gates", () => {
    const profile = adaptGovernedPresentationProfile("dense-table", "list");
    const chrome = adaptGovernedSurfaceChrome(
      { density: "legacy", material: "legacy-glass" },
      "list",
    );
    const permission = adaptGovernedPermissionTuple({
      module: "finance",
      object: "invoice",
      function: "approve",
    });
    const blocked = createGovernedParityCertificationGate({
      parityNotes: chrome.parityNotes,
      guardPassed: true,
      packageBuildPassed: true,
      packageTestsPassed: true,
      visualCertificationPassed: true,
    });
    const allowed = createGovernedParityCertificationGate({
      parityNotes: profile.parityNotes,
      guardPassed: true,
      packageBuildPassed: true,
      packageTestsPassed: true,
      visualCertificationPassed: true,
    });

    expect(profile.data.layout?.layout).toBe("table");
    expect(permission.requirements[0]).toMatchObject({
      capability: "finance.invoice_approve",
      effect: "allow",
    });
    expect(blocked.canReplace).toBe(false);
    expect(allowed.canReplace).toBe(true);
  });
});
