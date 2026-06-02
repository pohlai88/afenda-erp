import {
  parseGovernedChartConfiguration,
  parseGovernedComponentData,
  parseGovernedDetailTabsData,
  parseGovernedKanbanBoardConfiguration,
  parseGovernedMultiStepFormConfiguration,
  parseListSurfaceRendererConfiguration,
  parseStatCardConfiguration,
  type GovernedDetailSection,
  type GovernedDetailTabsInput,
} from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import { buildAuditPanelModel } from "../../src/index";
import { buildDashboardHardeningChart } from "../../src/modules/chart-surfaces";
import { buildDocumentExtractionFormMetadata } from "../../src/modules/form-surfaces";
import { buildModuleWorkItemKanbanSurface } from "../../src/modules/kanban-surfaces";
import {
  buildDashboardAutomationListSurface,
  buildDashboardHardeningChecklistSurface,
  buildDashboardWorkflowListSurface,
  buildDocumentRegistryListSurface,
  buildDocumentActivityLinesListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
  buildSavedViewsListSurface,
} from "../../src/modules/list-surfaces";
import {
  buildDashboardWorkflowSummaryStatGrid,
  buildModuleScreenOverviewStatGrid,
  buildModuleWorkspaceCountStatGrid,
  buildModuleWorkspaceStatGrid,
} from "../../src/modules/stat-surfaces";
import {
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
} from "../../src/modules/detail-surfaces";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const record = {
  id: "record-gallery-1",
  reference: "FIN-001",
  title: "Gallery record",
  recordType: "close-control",
  status: "blocked",
  owner: "Finance Controller",
  amount: "MYR 1,000",
  amountValue: 1000,
  currency: "MYR",
  due: "27 May 2026",
  dueAt: "2026-05-27T00:00:00.000Z",
  metadataSummary: "risk: gallery",
  extensionValid: true,
  extensionIssues: [] as string[],
};

const workItem = {
  id: "work-gallery-1",
  subject: "Gallery escalation",
  owner: "Approver",
  status: "escalated",
  priority: "high",
  due: "27 May 2026",
  dueAt: "2026-05-27T00:00:00.000Z",
};

const auditPanel = buildAuditPanelModel({
  title: "Gallery audit",
  resourceLabel: "FIN-001",
  auditLogs: [],
});

const recordDetail = {
  ...record,
  moduleId: "finance" as const,
  updatedAt: "27 May 2026",
  metadata: { risk: "low" },
  auditPanel,
};

const workItemDetail = {
  ...workItem,
  moduleId: "finance" as const,
  metadata: {},
  metadataSummary: "",
  sourceRecordId: null,
  sourceRecordHref: null,
  updatedAt: "27 May 2026",
  auditPanel,
};

function expectDetailSectionRendererContract(section: GovernedDetailSection) {
  const parsed = parseGovernedComponentData({
    type: section.rendererKey,
    serverType: section.rendererKey,
    configuration: section.rendererProps,
  });

  expect(parsed.success).toBe(true);
}

function expectDetailTabsAndRendererContracts(
  detailTabs: GovernedDetailTabsInput,
) {
  const parsed = parseGovernedDetailTabsData(detailTabs);

  expect(parsed.success).toBe(true);
  if (!parsed.success) {
    return;
  }

  expectDetailSectionRendererContract(parsed.data.overview);
  for (const section of [
    ...(parsed.data.relations ?? []),
    ...(parsed.data.referrers ?? []),
  ]) {
    expectDetailSectionRendererContract(section);
  }
}

describe("module list surface gallery fixtures", () => {
  it.each([
    [
      "ready list",
      buildModuleRecordListSurface({
        moduleId: "finance",
        records: [record],
      }),
    ],
    [
      "empty list",
      buildModuleRecordListSurface({
        moduleId: "finance",
        records: [],
      }),
    ],
    [
      "extension validation warning",
      buildModuleRecordListSurface({
        moduleId: "finance",
        records: [
          {
            ...record,
            extensionValid: false,
            extensionIssues: ["risk: Invalid input"],
          },
        ],
      }),
    ],
    [
      "permission denied candidate",
      {
        ...buildModuleRecordListSurface({
          moduleId: "finance",
          records: [record],
        }),
        requiresErpPermission: {
          module: "finance",
          object: "records",
          function: "read",
        },
      },
    ],
    [
      "cursor pagination",
      buildModuleRecordListSurface({
        moduleId: "finance",
        records: [record],
        window: {
          pageSize: 1,
          totalCount: 2,
          hasNextPage: true,
          nextCursor: "offset:1",
        },
      }),
    ],
    [
      "toolbar filters and sort",
      buildModuleRecordListSurface({
        moduleId: "finance",
        records: [record],
        query: {
          recordsStatus: "blocked",
          recordsSort: "updated-desc",
        },
      }),
    ],
    [
      "row trailing action",
      buildModuleRecordListSurface({
        moduleId: "finance",
        records: [record],
      }),
    ],
    [
      "work queue",
      buildModuleWorkItemListSurface({
        moduleId: "approvals",
        workItems: [workItem],
      }),
    ],
    [
      "dashboard workflow",
      buildDashboardWorkflowListSurface({
        workItems: [{ ...workItem, moduleId: "approvals" }],
      }),
    ],
  ])("parses %s", (_name, surface) => {
    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid metadata before rendering", () => {
    const parsed = parseListSurfaceRendererConfiguration({
      ...buildModuleRecordListSurface({
        moduleId: "finance",
        records: [record],
      }),
      columns: [],
    });

    expect(parsed.success).toBe(false);
  });
});

describe("auxiliary list surface gallery fixtures", () => {
  it.each([
    [
      "saved views — ready",
      buildSavedViewsListSurface({
        views: [
          {
            id: "v1",
            name: "High priority",
            description: "Filtered.",
            visibility: "private",
          },
        ],
        moduleId: "finance",
      }),
    ],
    [
      "saved views — empty",
      buildSavedViewsListSurface({ views: [], moduleId: "finance" }),
    ],
    [
      "automation runs — ready",
      buildDashboardAutomationListSurface({
        runs: [
          {
            id: "a1",
            name: "Nightly sync",
            schedule: "0 2 * * *",
            status: "success",
            detail: "All records synced.",
          },
        ],
      }),
    ],
    [
      "automation runs — empty",
      buildDashboardAutomationListSurface({ runs: [] }),
    ],
    [
      "document registry — ready",
      buildDocumentRegistryListSurface({
        documents: [
          {
            id: "d1",
            title: "Invoice Q1",
            contentType: "PDF",
            size: "120 KB",
            access: "internal",
          },
        ],
        moduleId: "finance",
      }),
    ],
    [
      "document activity — document-lines",
      buildDocumentActivityLinesListSurface({
        events: [
          {
            id: "evt-1",
            summary: "Document uploaded",
            actorLabel: "Operator",
            occurredAt: "2026-06-02T10:00:00.000Z",
          },
        ],
        moduleId: "finance",
      }),
    ],
  ])("parses %s", (_name, surface) => {
    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
  });
});

describe("stat grid gallery fixtures", () => {
  it.each([
    [
      "workspace count stats",
      buildModuleWorkspaceCountStatGrid({
        moduleId: "finance",
        recordCount: 42,
        workItemCount: 3,
        documentCount: 7,
        highPriorityWorkItemCount: 1,
      }),
    ],
    [
      "workspace count stats — zero values",
      buildModuleWorkspaceCountStatGrid({
        moduleId: "finance",
        recordCount: 0,
        workItemCount: 0,
        documentCount: 0,
        highPriorityWorkItemCount: 0,
      }),
    ],
    [
      "module KPI stat grid",
      buildModuleWorkspaceStatGrid({
        moduleId: "finance",
        metrics: [
          {
            label: "Revenue",
            value: "MYR 4.8M",
            detail: "YTD",
            tone: "positive",
          },
        ],
      }),
    ],
  ])("parses %s", (_name, statConfig) => {
    expect(parseStatCardConfiguration(statConfig).success).toBe(true);
  });
});

describe("detail tab gallery fixtures", () => {
  it("parses record detail tabs — ready", () => {
    expectDetailTabsAndRendererContracts(
      buildRecordDetailTabs({ moduleId: "finance", record: recordDetail }),
    );
  });

  it("parses record detail tabs — empty metadata", () => {
    expectDetailTabsAndRendererContracts(
      buildRecordDetailTabs({
        moduleId: "finance",
        record: { ...recordDetail, metadata: {} },
      }),
    );
  });

  it("parses record detail tabs — raw metadata values", () => {
    expectDetailTabsAndRendererContracts(
      buildRecordDetailTabs({
        moduleId: "finance",
        record: {
          ...recordDetail,
          metadata: {
            amountCents: 12400000,
            settlementDate: "2026-05-27",
            sequence: "02",
          },
        },
      }),
    );
  });

  it("parses work-item detail tabs — ready", () => {
    expectDetailTabsAndRendererContracts(
      buildWorkItemDetailTabs({
        moduleId: "finance",
        workItem: workItemDetail,
      }),
    );
  });

  it("parses work-item detail tabs — source referrer", () => {
    expectDetailTabsAndRendererContracts(
      buildWorkItemDetailTabs({
        moduleId: "finance",
        workItem: {
          ...workItemDetail,
          metadata: { sequence: "02" },
          sourceRecordId: "record-gallery-1",
          sourceRecordHref: "/finance/records/record-gallery-1",
        },
      }),
    );
  });
});

describe("chart surface gallery fixtures", () => {
  it.each([
    [
      "hardening chart — mixed status",
      buildDashboardHardeningChart({
        checklist: [
          { area: "auth", status: "done" },
          { area: "observability", status: "review" },
        ],
      }),
    ],
    [
      "hardening chart — all done",
      buildDashboardHardeningChart({
        checklist: [
          { area: "auth", status: "done" },
          { area: "cron", status: "done" },
        ],
      }),
    ],
    [
      "hardening chart — empty checklist",
      buildDashboardHardeningChart({ checklist: [] }),
    ],
  ])("parses %s", (_name, chart) => {
    expect(parseGovernedChartConfiguration(chart).success).toBe(true);
  });
});

describe("kanban surface gallery fixtures", () => {
  it("parses work-item kanban — ready", () => {
    const result = parseGovernedKanbanBoardConfiguration(
      buildModuleWorkItemKanbanSurface({
        moduleId: "approvals",
        workItems: [workItem],
      }),
    );
    expect(result.success).toBe(true);
  });

  it("parses work-item kanban — empty board", () => {
    const result = parseGovernedKanbanBoardConfiguration(
      buildModuleWorkItemKanbanSurface({
        moduleId: "approvals",
        workItems: [],
      }),
    );
    expect(result.success).toBe(true);
  });
});

describe("form metadata gallery fixtures", () => {
  it("parses document extraction form — valid", () => {
    const result = parseGovernedMultiStepFormConfiguration(
      buildDocumentExtractionFormMetadata({ moduleId: "finance" }),
    );
    expect(result.success).toBe(true);
  });
});

describe("dashboard auxiliary surface gallery fixtures", () => {
  it("parses hardening checklist list — ready", () => {
    const result = parseListSurfaceRendererConfiguration(
      buildDashboardHardeningChecklistSurface({
        items: [
          {
            area: "RLS",
            status: "configured",
            detail: "Tenant isolation enforced.",
          },
        ],
      }),
    );
    expect(result.success).toBe(true);
  });

  it("parses workflow summary stat grid", () => {
    const result = parseStatCardConfiguration(
      buildDashboardWorkflowSummaryStatGrid({
        queueDepth: 7,
        escalations: 2,
        highPriority: 3,
      }),
    );
    expect(result.success).toBe(true);
  });

  it("parses module overview stat grid", () => {
    const result = parseStatCardConfiguration(
      buildModuleScreenOverviewStatGrid({
        moduleId: "finance",
        stats: [{ label: "Primary route", value: "/finance" }],
      }),
    );
    expect(result.success).toBe(true);
  });
});
