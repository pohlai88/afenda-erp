import { describe, expect, it } from "vitest";

import {
  parseMetadataUiActionContract,
  type MetadataUiActionContractInput,
} from "../contracts/action.contract";
import { parseMetadataUiComponentContract } from "../contracts/component.contract";
import {
  createComposedChart,
  createChart,
  createChartSeries,
  withChartDisplay,
} from "../builders/chart.builder";
import {
  createFileField,
  createFormSection,
  createHiddenField,
  createSectionedForm,
  createTextField,
  withFormErrorSummary,
  withFormFieldDependencies,
  withFormFieldDisabled,
  withFormFieldState,
  withFormState,
} from "../builders/form.builder";
import {
  createKanban,
  createKanbanCard,
  createKanbanCardTemplate,
  createKanbanColumn,
  createKanbanTransition,
  withKanbanCards,
  withKanbanMode,
  withKanbanTransitions,
} from "../builders/kanban.builder";
import {
  createCompactStatItem,
  createStatGroup,
  withStatDisplay,
} from "../builders/stat.builder";
import { createMetadataUiKanbanClientModel } from "../runtime/kanban-state.shared";
import {
  METADATA_UI_PRESENTATION_PROFILE_IDS,
} from "../presentation/presentation-profiles.shared";
import { resolveMetadataUiPresentationDensity } from "../presentation/resolve-density.shared";
import { resolveMetadataUiPresentationLayout } from "../presentation/resolve-layout.shared";
import { resolveMetadataUiPresentation } from "../presentation/resolve-presentation.shared";
import {
  resolveMetadataUiPresentationSurface,
  shouldRenderMetadataUiPresentationChrome,
} from "../presentation/resolve-surface.shared";
import { resolveMetadataUiPresentationTone } from "../presentation/resolve-tone.shared";
import {
  shouldRenderMetadataUiPresentationDescription,
  shouldRenderMetadataUiPresentationHeader,
} from "../presentation/resolve-visibility.shared";
import { METADATA_UI_COMPONENT_REGISTRY } from "../registry/component-registry.shared";
import {
  createMetadataUiChartFixture,
  createMetadataUiKanbanFixture,
  createMetadataUiListFixture,
} from "./fixture-builders.shared";
import { METADATA_UI_LIST_SCHEMA_ID } from "../schemas/list.schema";
import { resolveMetadataUiActionLifecycle } from "../server-actions/action-lifecycle.shared";

const BASE_SERVER_ACTION = {
  id: "metadata-ui.test.submit",
  label: "Submit",
  execution: {
    kind: "server-action",
    actionKey: "metadata-ui.test.submit",
  },
} as const satisfies MetadataUiActionContractInput;

describe("@afenda/metadata-ui shared runtime surface", () => {
  it("validates all registry entries as valid metadata UI component contracts", () => {
    for (const entry of METADATA_UI_COMPONENT_REGISTRY) {
      expect(() => parseMetadataUiComponentContract(entry)).not.toThrow();
    }
  });

  it("enforces renderer contract invariants", () => {
    expect(() =>
      parseMetadataUiComponentContract({
        id: "metadata-ui.renderer.invalid",
        kind: "renderer",
        runtime: "server",
        label: "Invalid renderer",
        description: "Renderer without rendererId should fail.",
        capabilities: ["render"],
      }),
    ).toThrow(/renderer components must declare rendererId/i);
  });

  it("builds a valid list fixture with expected schema and columns", () => {
    const list = createMetadataUiListFixture();

    expect(list.schemaId).toBe(METADATA_UI_LIST_SCHEMA_ID);
    expect(list.key).toBe("metadata-ui.fixture.list");
    expect(Array.isArray(list.columns)).toBe(true);
    expect(list.columns).toHaveLength(2);
    expect(list.columns[0]?.key).toBe("name");
    expect(list.columns[1]?.key).toBe("status");
  });

  it("builds bounded chart metadata with display and tooltip contracts", () => {
    const chart = withChartDisplay(createMetadataUiChartFixture(), {
      height: 360,
      legend: "top",
      tooltip: {
        mode: "detailed",
        valueFormat: "compact",
      },
      reducedMotion: "always-static",
      tableFallbackLabel: "Quarterly revenue table",
    });

    expect(chart.display).toMatchObject({
      height: 360,
      legend: "top",
      reducedMotion: "always-static",
      tableFallbackLabel: "Quarterly revenue table",
    });
    expect(chart.display.tooltip.mode).toBe("detailed");
    expect(chart.data).toHaveLength(1);
    expect(chart.series[0]?.valueKey).toBe("value");
  });

  it("rejects malformed chart data before renderer execution", () => {
    expect(() =>
      createComposedChart({
        key: "metadata-ui.fixture.invalid-chart",
        categoryKey: "period",
        series: [
          createChartSeries({
            key: "value",
            label: "Value",
            valueKey: "missing",
          }),
        ],
        data: [
          {
            period: "Current",
            value: 42,
          },
        ],
      }),
    ).toThrow(/series valueKey/i);

    expect(() =>
      createChart({
        key: "metadata-ui.fixture.invalid-pie",
        kind: "pie",
        categoryKey: "period",
        series: [
          createChartSeries({
            key: "value",
            label: "Value",
            valueKey: "value",
          }),
          createChartSeries({
            key: "other",
            label: "Other",
            valueKey: "other",
          }),
        ],
        data: [
          {
            period: "Current",
            value: 42,
            other: 7,
          },
        ],
      }),
    ).toThrow(/exactly one value series/i);
  });

  it("builds stat display metadata for animated and compact metric values", () => {
    const item = withStatDisplay(
      createCompactStatItem({
        key: "metadata-ui.fixture.metric",
        label: "Revenue",
        value: 1250000,
      }),
      {
        animation: "respect-user",
        maximumFractionDigits: 1,
        iconKey: "activity",
        progress: {
          value: 75,
          max: 100,
          label: "Completion",
        },
        sparkline: [{ value: 10 }, { value: 18 }, { value: 15 }],
      },
    );
    const stat = createStatGroup({
      key: "metadata-ui.fixture.metric-group",
      items: [item],
    });

    expect(stat.items[0]?.format).toBe("compact");
    expect(stat.items[0]?.display.animation).toBe("respect-user");
    expect(stat.items[0]?.display.maximumFractionDigits).toBe(1);
    expect(stat.items[0]?.display.progress).toMatchObject({
      value: 75,
      max: 100,
    });
    expect(stat.items[0]?.display.sparkline).toHaveLength(3);
  });

  it("rejects uncontrolled stat display metadata", () => {
    expect(() =>
      withStatDisplay(
        createCompactStatItem({
          key: "metadata-ui.fixture.invalid-metric",
          label: "Invalid",
          value: 10,
        }),
        {
          progress: {
            value: 101,
            max: 100,
          },
        },
      ),
    ).toThrow(/must not exceed max/i);

    expect(() =>
      withStatDisplay(
        createCompactStatItem({
          key: "metadata-ui.fixture.invalid-fraction",
          label: "Invalid",
          value: 10,
        }),
        {
          minimumFractionDigits: 3,
          maximumFractionDigits: 1,
        },
      ),
    ).toThrow(/minimum fraction digits/i);
  });

  it("builds kanban client models with host-owned move intents", () => {
    const board = createMetadataUiKanbanFixture();
    const model = createMetadataUiKanbanClientModel(board);

    expect(model.mode).toBe("draggable");
    expect(model.movementEnabled).toBe(true);
    expect(model.columns).toHaveLength(2);
    expect(model.columns[0]?.cards).toHaveLength(1);
    expect(model.columns[0]?.transitions[0]).toMatchObject({
      cardKey: "metadata-ui.fixture.card.1",
      fromColumnKey: "todo",
      toColumnKey: "done",
      actionKey: "metadata-ui.fixture.move-card",
      available: true,
      payload: {
        source: "fixture",
        cardKey: "metadata-ui.fixture.card.1",
      },
    });
    expect(model.columns[1]?.transitions[0]).toMatchObject({
      available: false,
      disabledReason: "Reopen is disabled by host metadata.",
    });
  });

  it("rejects invalid kanban cards and unavailable transitions without reasons", () => {
    const base = createKanban({
      key: "metadata-ui.fixture.invalid-board",
      columnField: "status",
      columns: [
        createKanbanColumn({
          key: "todo",
          label: "To do",
          order: 0,
        }),
      ],
      cardTemplate: createKanbanCardTemplate({
        titleField: "title",
        metadataFields: [],
      }),
    });

    expect(() =>
      withKanbanCards(base, [
        createKanbanCard({
          key: "metadata-ui.fixture.invalid-card",
          record: {
            title: "Invalid",
            status: "missing",
          },
        }),
      ]),
    ).toThrow(/declared column/i);

    expect(() =>
      withKanbanTransitions(withKanbanMode(base, "draggable"), [
        createKanbanTransition({
          key: "metadata-ui.fixture.invalid-transition",
          fromColumnKey: "todo",
          toColumnKey: "todo",
          label: "Unavailable",
          available: false,
        }),
      ]),
    ).toThrow(/disabledReason/i);
  });

  it("builds enterprise form field states and host upload descriptors", () => {
    const requiredField = createTextField({
      key: "metadata-ui.fixture.name",
      name: "name",
      label: "Name",
      validation: {
        required: true,
        message: "Name is required.",
      },
    });
    const invalidField = withFormFieldState(requiredField, {
      value: "invalid",
      errors: [
        {
          message: "Name is required.",
        },
      ],
    });
    const disabledField = withFormFieldDisabled(
      createTextField({
        key: "metadata-ui.fixture.reason",
        name: "reason",
        label: "Reason",
      }),
      {
        value: true,
        reason: "Reason is locked by host metadata.",
      },
    );
    const readonlyField = withFormFieldState(
      createTextField({
        key: "metadata-ui.fixture.amount",
        name: "amount",
        label: "Amount",
        readonly: true,
      }),
      {
        value: "readonly",
      },
    );
    const hiddenField = createHiddenField({
      key: "metadata-ui.fixture.hidden-id",
      name: "id",
      defaultValue: "record-1",
    });
    const blockedField = withFormFieldState(
      withFormFieldDependencies(
        createFileField({
          key: "metadata-ui.fixture.attachment",
          name: "attachment",
          label: "Attachment",
          fileUpload: {
            hostUploadKey: "metadata-ui.fixture.upload",
            accept: ["application/pdf"],
            maxSizeBytes: 1024,
            multiple: false,
          },
        }),
        [
          {
            sourceField: "name",
            condition: "provided",
            effect: "enable",
            reason: "Attachment unlocks after name is provided.",
          },
        ],
      ),
      {
        value: "blocked",
        reason: "Attachment upload is blocked by host metadata.",
      },
    );
    const form = withFormState(
      withFormErrorSummary(
        createSectionedForm({
          key: "metadata-ui.fixture.enterprise-form",
          sections: [
            createFormSection({
              key: "metadata-ui.fixture.main",
              fields: [
                invalidField,
                disabledField,
                readonlyField,
                hiddenField,
                blockedField,
              ],
            }),
          ],
        }),
        {
          title: "Review fields",
          errors: [
            {
              fieldKey: "metadata-ui.fixture.name",
              message: "Name is required.",
            },
          ],
        },
      ),
      "invalid",
    );

    expect(form.state).toBe("invalid");
    expect(form.errorSummary.errors).toHaveLength(1);
    expect(form.sections[0]?.fields).toHaveLength(5);
    expect(form.sections[0]?.fields[0]?.validation?.required).toBe(true);
    expect(form.sections[0]?.fields[0]?.state.value).toBe("invalid");
    expect(form.sections[0]?.fields[1]?.disabled?.reason).toContain("locked");
    expect(form.sections[0]?.fields[2]?.state.value).toBe("readonly");
    expect(form.sections[0]?.fields[3]?.hidden).toBe(true);
    expect(form.sections[0]?.fields[4]?.fileUpload?.hostUploadKey).toBe(
      "metadata-ui.fixture.upload",
    );
    expect(form.sections[0]?.fields[4]?.dependencies).toHaveLength(1);
  });

  it("rejects uncontrolled form field states and upload metadata", () => {
    expect(() =>
      withFormFieldState(
        createTextField({
          key: "metadata-ui.fixture.blocked-without-reason",
          name: "blocked",
          label: "Blocked",
        }),
        {
          value: "blocked",
        },
      ),
    ).toThrow(/blocked form fields/i);

    expect(() =>
      withFormFieldState(
        createTextField({
          key: "metadata-ui.fixture.invalid-without-errors",
          name: "invalid",
          label: "Invalid",
        }),
        {
          value: "invalid",
        },
      ),
    ).toThrow(/invalid form fields/i);

    expect(() =>
      withFormFieldDisabled(
        createTextField({
          key: "metadata-ui.fixture.disabled-without-reason",
          name: "disabled",
          label: "Disabled",
        }),
        {
          value: true,
        },
      ),
    ).toThrow(/disabled form fields/i);

    expect(() =>
      createFileField({
        key: "metadata-ui.fixture.file-without-upload",
        name: "file",
        label: "File",
        fileUpload: undefined as never,
      }),
    ).toThrow(/host upload descriptor/i);
  });

  it("resolves presentation intent without exposing primitive implementation", () => {
    const presentation = resolveMetadataUiPresentation({
      profileId: METADATA_UI_PRESENTATION_PROFILE_IDS.denseTable,
      overrides: {
        chrome: {
          tone: "warning",
        },
        visibility: {
          showHeader: false,
        },
      },
    });

    expect(resolveMetadataUiPresentationDensity(presentation)).toBe("compact");
    expect(resolveMetadataUiPresentationSurface(presentation)).toBe("card");
    expect(resolveMetadataUiPresentationTone(presentation)).toBe("warning");
    expect(resolveMetadataUiPresentationLayout(presentation)).toEqual({
      layout: "table",
      alignment: "start",
      width: "full",
    });
    expect(shouldRenderMetadataUiPresentationChrome(presentation)).toBe(true);
    expect(shouldRenderMetadataUiPresentationHeader(presentation)).toBe(false);
    expect(shouldRenderMetadataUiPresentationDescription(presentation)).toBe(
      false,
    );
  });

  it("keeps plain and embedded presentations chrome-free", () => {
    expect(
      shouldRenderMetadataUiPresentationChrome({
        chrome: {
          surface: "plain",
        },
      }),
    ).toBe(false);

    expect(
      shouldRenderMetadataUiPresentationChrome({
        chrome: {
          surface: "embedded",
        },
      }),
    ).toBe(false);
  });

  it("parses and resolves host-owned action lifecycle feedback", () => {
    const action = parseMetadataUiActionContract({
      ...BASE_SERVER_ACTION,
      lifecycle: {
        state: "blocked",
        reason: "Close period is locked by the host feature.",
        feedback: {
          blocked: {
            label: "Blocked",
            description: "Close period is locked by the host feature.",
            placement: "host-outlet",
          },
        },
      },
    });

    const lifecycle = resolveMetadataUiActionLifecycle(action);

    expect(lifecycle.state).toBe("blocked");
    expect(lifecycle.disabled).toBe(true);
    expect(lifecycle.disabledReason).toBe(
      "Close period is locked by the host feature.",
    );
    expect(lifecycle.feedback).toBe(
      "Close period is locked by the host feature.",
    );
  });

  it("keeps hidden, disabled, confirmation, and pending action states explicit", () => {
    const hiddenAction = parseMetadataUiActionContract({
      ...BASE_SERVER_ACTION,
      id: "metadata-ui.test.hidden",
      visibility: "hidden",
    });
    const disabledAction = parseMetadataUiActionContract({
      ...BASE_SERVER_ACTION,
      id: "metadata-ui.test.disabled",
      visibility: "disabled",
      disabledReason: "Host policy disabled this action.",
    });
    const pendingAction = parseMetadataUiActionContract({
      ...BASE_SERVER_ACTION,
      id: "metadata-ui.test.pending",
      lifecycle: {
        state: "pending",
        feedback: {
          pending: {
            label: "Submitting",
            description: "The host feature is processing this action.",
          },
        },
      },
    });
    const destructiveAction = parseMetadataUiActionContract({
      ...BASE_SERVER_ACTION,
      id: "metadata-ui.test.destroy",
      risk: "high",
      permission: {
        module: "metadata-ui",
        object: "fixture",
        function: "delete",
      },
      confirmation: {
        title: "Delete fixture",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      },
    });

    expect(hiddenAction.visibility).toBe("hidden");
    expect(resolveMetadataUiActionLifecycle(disabledAction).disabled).toBe(true);
    expect(resolveMetadataUiActionLifecycle(pendingAction)).toMatchObject({
      state: "pending",
      label: "Submitting",
      disabled: true,
    });
    expect(destructiveAction.confirmation?.confirmLabel).toBe("Delete");

    expect(() =>
      parseMetadataUiActionContract({
        ...BASE_SERVER_ACTION,
        id: "metadata-ui.test.disabled.invalid",
        visibility: "disabled",
      }),
    ).toThrow(/disabled actions must provide/i);
    expect(() =>
      parseMetadataUiActionContract({
        ...BASE_SERVER_ACTION,
        id: "metadata-ui.test.destroy.invalid",
        risk: "high",
        permission: {
          module: "metadata-ui",
          object: "fixture",
          function: "delete",
        },
      }),
    ).toThrow(/must require confirmation/i);
  });

  it("requires explicit reasons for blocked and failed lifecycle states", () => {
    expect(() =>
      parseMetadataUiActionContract({
        ...BASE_SERVER_ACTION,
        lifecycle: {
          state: "blocked",
        },
      }),
    ).toThrow(/blocked actions must provide/i);

    expect(() =>
      parseMetadataUiActionContract({
        ...BASE_SERVER_ACTION,
        lifecycle: {
          state: "failed",
        },
      }),
    ).toThrow(/failed actions must provide/i);
  });
});
