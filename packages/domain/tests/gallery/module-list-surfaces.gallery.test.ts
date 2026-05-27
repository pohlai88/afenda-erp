import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface";
import { describe, expect, it } from "vitest";
import {
  buildDashboardWorkflowListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
} from "../../src/modules/list-surfaces";

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
  extensionIssues: [],
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
