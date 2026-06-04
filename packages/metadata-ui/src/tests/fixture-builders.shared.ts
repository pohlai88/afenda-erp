import {
  createToolbarActionBar,
  type MetadataUiActionBarBuilderInput,
} from "../builders/action-bar.builder";
import { createAuditTrailPanel } from "../builders/audit-panel.builder";
import {
  createBarChart,
  createChartSeries,
} from "../builders/chart.builder";
import {
  createContentTab,
  createDetailTabsSet,
} from "../builders/detail-tabs.builder";
import {
  createSectionedForm,
  createTextField,
  createFormSection,
} from "../builders/form.builder";
import {
  createKanbanBoard,
  createKanbanCard,
  createKanbanCardTemplate,
  createKanbanColumn,
  createKanbanTransition,
  withKanbanCards,
  withKanbanMode,
  withKanbanTransitions,
} from "../builders/kanban.builder";
import {
  createListTable,
  createTextColumn,
} from "../builders/list.builder";
import { createModulePageHeader } from "../builders/page-header.builder";
import {
  createNumberStatItem,
  createStatGroup,
} from "../builders/stat.builder";
import type { MetadataUiActionContractInput } from "../contracts/action.contract";
import {
  parseMetadataUiActionContract,
  type MetadataUiActionContract,
} from "../contracts/action.contract";
import type { MetadataUiActionBar } from "../schemas/action-bar.schema";
import type { MetadataUiAuditPanel } from "../schemas/audit-panel.schema";
import type { MetadataUiChart } from "../schemas/chart.schema";
import type { MetadataUiDetailTabs } from "../schemas/detail-tabs.schema";
import type { MetadataUiForm } from "../schemas/form.schema";
import type { MetadataUiKanban } from "../schemas/kanban.schema";
import type { MetadataUiList } from "../schemas/list.schema";
import type { MetadataUiPageHeader } from "../schemas/page-header.schema";
import type { MetadataUiStat } from "../schemas/stat.schema";
import { createMetadataUiFixtureTestId } from "./metadata-ui-test-ids.shared";

export type MetadataUiFixtureKey =
  | "action-bar"
  | "audit-panel"
  | "chart"
  | "detail-tabs"
  | "form"
  | "kanban"
  | "list"
  | "page-header"
  | "stat";

export type MetadataUiFixtureOptions<Key extends string = string> = Readonly<{
  key?: Key;
  title?: string;
  description?: string;
}>;

export type MetadataUiSectionFixtureSet = Readonly<{
  actionBar: MetadataUiActionBar;
  auditPanel: MetadataUiAuditPanel;
  chart: MetadataUiChart;
  detailTabs: MetadataUiDetailTabs;
  form: MetadataUiForm;
  kanban: MetadataUiKanban;
  list: MetadataUiList;
  pageHeader: MetadataUiPageHeader;
  stat: MetadataUiStat;
}>;

export function createMetadataUiFixtureAction(
  input: Partial<MetadataUiActionContractInput> = {},
): MetadataUiActionContract {
  return parseMetadataUiActionContract({
    id: "metadata-ui.fixture.open",
    label: "Open",
    intent: "open",
    risk: "low",
    execution: {
      kind: "navigation",
      href: "#",
      target: "self",
    },
    ...input,
  });
}

export function createMetadataUiListFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.list"> = {},
): MetadataUiList {
  const key = input.key ?? "metadata-ui.fixture.list";

  return createListTable({
    key,
    title: input.title ?? "Fixture list",
    description: input.description,
    columns: [
      createTextColumn({
        key: "name",
        field: "name",
        label: "Name",
      }),
      createTextColumn({
        key: "status",
        field: "status",
        label: "Status",
      }),
    ],
  });
}

export function createMetadataUiStatFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.stat"> = {},
): MetadataUiStat {
  return createStatGroup({
    key: input.key ?? "metadata-ui.fixture.stat",
    title: input.title ?? "Fixture stats",
    description: input.description,
    items: [
      createNumberStatItem({
        key: "total",
        label: "Total",
        value: 42,
      }),
    ],
  });
}

export function createMetadataUiChartFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.chart"> = {},
): MetadataUiChart {
  return createBarChart({
    key: input.key ?? "metadata-ui.fixture.chart",
    title: input.title ?? "Fixture chart",
    description: input.description,
    categoryKey: "period",
    series: [
      createChartSeries({
        key: "value",
        label: "Value",
        valueKey: "value",
        tone: "info",
        format: "number",
      }),
    ],
    data: [
      {
        period: "Current",
        value: 42,
      },
    ],
  });
}

export function createMetadataUiActionBarFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.action-bar"> = {},
): MetadataUiActionBar {
  const action = createMetadataUiFixtureAction();
  const actionBarInput: Omit<
    MetadataUiActionBarBuilderInput,
    "alignment" | "layout"
  > = {
    key: input.key ?? "metadata-ui.fixture.action-bar",
    title: input.title ?? "Fixture actions",
    description: input.description,
    actions: [
      {
        key: "open",
        label: action.label,
        action,
        priority: "primary",
        placement: "main",
        diagnostics: {
          testId: createMetadataUiFixtureTestId("action-bar", "open"),
        },
      },
    ],
  };

  return createToolbarActionBar(actionBarInput);
}

export function createMetadataUiFormFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.form"> = {},
): MetadataUiForm {
  return createSectionedForm({
    key: input.key ?? "metadata-ui.fixture.form",
    title: input.title ?? "Fixture form",
    description: input.description,
    sections: [
      createFormSection({
        key: "main",
        title: "Main",
        fields: [
          createTextField({
            key: "name",
            name: "name",
            label: "Name",
          }),
        ],
      }),
    ],
  });
}

export function createMetadataUiKanbanFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.kanban"> = {},
): MetadataUiKanban {
  const board = createKanbanBoard({
    key: input.key ?? "metadata-ui.fixture.kanban",
    title: input.title ?? "Fixture board",
    description: input.description,
    columnField: "status",
    columns: [
      createKanbanColumn({
        key: "todo",
        label: "To do",
        order: 0,
      }),
      createKanbanColumn({
        key: "done",
        label: "Done",
        order: 1,
      }),
    ],
    cardTemplate: createKanbanCardTemplate({
      titleField: "title",
      descriptionField: "description",
      metadataFields: ["owner"],
    }),
  });

  return withKanbanTransitions(
    withKanbanCards(withKanbanMode(board, "draggable"), [
      createKanbanCard({
        key: "metadata-ui.fixture.card.1",
        record: {
          id: "metadata-ui.fixture.card.1",
          title: "Review invoice",
          description: "Validate metadata-driven kanban rendering.",
          status: "todo",
          owner: "Finance",
        },
      }),
      createKanbanCard({
        key: "metadata-ui.fixture.card.2",
        record: {
          id: "metadata-ui.fixture.card.2",
          title: "Post journal",
          status: "done",
          owner: "Accounting",
        },
      }),
    ]),
    [
      createKanbanTransition({
        key: "metadata-ui.fixture.todo-to-done",
        fromColumnKey: "todo",
        toColumnKey: "done",
        label: "Mark done",
        available: true,
        intent: {
          actionKey: "metadata-ui.fixture.move-card",
          payload: {
            source: "fixture",
          },
        },
      }),
      createKanbanTransition({
        key: "metadata-ui.fixture.done-to-todo",
        fromColumnKey: "done",
        toColumnKey: "todo",
        label: "Reopen",
        available: false,
        disabledReason: "Reopen is disabled by host metadata.",
      }),
    ],
  );
}

export function createMetadataUiAuditPanelFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.audit-panel"> = {},
): MetadataUiAuditPanel {
  return createAuditTrailPanel({
    key: input.key ?? "metadata-ui.fixture.audit-panel",
    title: input.title ?? "Fixture audit",
    description: input.description,
    events: [],
  });
}

export function createMetadataUiDetailTabsFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.detail-tabs"> = {},
): MetadataUiDetailTabs {
  return createDetailTabsSet({
    key: input.key ?? "metadata-ui.fixture.detail-tabs",
    title: input.title ?? "Fixture tabs",
    description: input.description,
    tabs: [
      createContentTab({
        key: "overview",
        label: "Overview",
        sectionKey: "metadata-ui.fixture.list",
        defaultSelected: true,
      }),
    ],
  });
}

export function createMetadataUiPageHeaderFixture(
  input: MetadataUiFixtureOptions<"metadata-ui.fixture.page-header"> = {},
): MetadataUiPageHeader {
  return createModulePageHeader({
    key: input.key ?? "metadata-ui.fixture.page-header",
    title: input.title ?? "Fixture page",
    description: input.description,
  });
}

export function createMetadataUiSectionFixtureSet(): MetadataUiSectionFixtureSet {
  return {
    actionBar: createMetadataUiActionBarFixture(),
    auditPanel: createMetadataUiAuditPanelFixture(),
    chart: createMetadataUiChartFixture(),
    detailTabs: createMetadataUiDetailTabsFixture(),
    form: createMetadataUiFormFixture(),
    kanban: createMetadataUiKanbanFixture(),
    list: createMetadataUiListFixture(),
    pageHeader: createMetadataUiPageHeaderFixture(),
    stat: createMetadataUiStatFixture(),
  };
}
