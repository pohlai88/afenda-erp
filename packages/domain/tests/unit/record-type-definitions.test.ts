import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface";
import { parseAuditPanelData } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import {
  buildDashboardWorkflowListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
} from "../../src/module-list-surfaces";
import { resolveModuleWorkspaceListQuery } from "../../src/module-workspace-query";
import { buildAuditPanelModel } from "../../src/index";
import {
  getRecordTypeDefinition,
  parseRecordTypeExtension,
  resolveModuleRecordListDefinition,
  resolveRecordTypeRowHref,
} from "../../src/record-type-definitions";

const baseRecord = {
  id: "record-1",
  reference: "REC-001",
  title: "Record under review",
  status: "active",
  owner: "Operations",
  amount: "MYR 1,000",
  amountValue: 1000,
  currency: "MYR",
  due: "27 May 2026",
  dueAt: "2026-05-27T00:00:00.000Z",
  metadataSummary: "risk: review",
  extensionValid: true,
  extensionIssues: [],
};

describe("record type definitions", () => {
  it("resolves known module record types", () => {
    const definition = getRecordTypeDefinition({
      moduleId: "finance",
      recordType: "close-control",
    });

    expect(definition?.title).toBe("Close control");
    expect(definition?.list.columns.map((column) => column.id)).toContain(
      "amount",
    );
    expect(definition?.list.rowHrefTemplate).toBe("/finance/records/:recordId");
    expect(definition?.permissions.search?.function).toBe("search");
    expect(definition?.list.defaultSort?.[0]?.id).toBe("due-asc");
    expect(definition?.list.defaultFilters?.[0]?.param).toBe("recordsStatus");
    expect(
      definition?.extensionSchema?.safeParse({ risk: "close" }).success,
    ).toBe(true);
    expect(definition?.extensionSchema?.safeParse({}).success).toBe(false);
  });

  it("parses record extension metadata through the record type contract", () => {
    expect(
      parseRecordTypeExtension({
        moduleId: "inventory",
        recordType: "stock-variance",
        metadata: {
          location: "Shah Alam DC",
          varianceType: "count-mismatch",
        },
      }).success,
    ).toBe(true);

    const parsed = parseRecordTypeExtension({
      moduleId: "inventory",
      recordType: "stock-variance",
      metadata: {
        varianceType: "count-mismatch",
      },
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.issues[0]).toContain("location");
  });

  it("uses record-type columns for module record list surfaces", () => {
    const surface = buildModuleRecordListSurface({
      moduleId: "inventory",
      records: [
        {
          ...baseRecord,
          recordType: "stock-variance",
        },
      ],
    });

    expect(surface.columns.map((column) => column.id)).toEqual([
      "reference",
      "title",
      "status",
      "owner",
      "due",
      "metadataSummary",
    ]);

    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.rows[0]?.cells.due).toBe(baseRecord.dueAt);
    expect(parsed.data.rows[0]?.rowTone).toBe("default");
    expect(parsed.data.rows[0]?.rowHref).toBe("/inventory/records/record-1");
    expect(parsed.data.rows[0]?.linkColumnId).toBe("reference");
    expect(parsed.data.rows[0]?.trailingAction?.descriptor?.label).toBe(
      "Open record",
    );
  });

  it("marks invalid extension metadata through the governed decision ledger", () => {
    const surface = buildModuleRecordListSurface({
      moduleId: "inventory",
      records: [
        {
          ...baseRecord,
          recordType: "stock-variance",
          extensionValid: false,
          extensionIssues: ["location: Required"],
        },
      ],
    });

    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.rows[0]?.rowTone).toBe("attention");
    expect(parsed.data.rows[0]?.decisionLedger?.policyLabel).toBe(
      "Record type extension schema",
    );
    expect(parsed.data.rows[0]?.decisionLedger?.reason).toContain("location");
  });

  it("serializes currency values and row tone into governed list rows", () => {
    const surface = buildModuleRecordListSurface({
      moduleId: "finance",
      records: [
        {
          ...baseRecord,
          recordType: "close-control",
          status: "blocked",
        },
      ],
      window: {
        pageSize: 1,
        totalCount: 2,
        hasNextPage: true,
        nextCursor: "record-1",
      },
    });

    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.pagination?.hasNextPage).toBe(true);
    expect(parsed.data.pagination?.nextCursor).toBe("record-1");
    expect(parsed.data.rows[0]?.rowTone).toBe("critical");
    expect(parsed.data.rows[0]?.cells.amount).toBe(1000);
    expect(parsed.data.rows[0]?.cellKinds?.amount).toEqual({
      kind: "currency",
      currency: "MYR",
    });
  });

  it("resolves row hrefs using encoded record ids", () => {
    expect(
      resolveRecordTypeRowHref({
        moduleId: "finance",
        recordType: "close-control",
        recordId: "record/1",
      }),
    ).toBe("/finance/records/record%2F1");
  });

  it("falls back to generic columns for mixed record types", () => {
    const definition = resolveModuleRecordListDefinition({
      moduleId: "finance",
      records: [
        { recordType: "close-control" },
        { recordType: "manual-adjustment" },
      ],
    });

    expect(definition.columns.map((column) => column.id)).toEqual([
      "reference",
      "title",
      "recordType",
      "status",
      "owner",
      "amount",
      "due",
      "metadataSummary",
    ]);
  });

  it("serializes work-item windows and exception row tone", () => {
    const surface = buildModuleWorkItemListSurface({
      moduleId: "approvals",
      workItems: [
        {
          id: "work-1",
          subject: "Approval escalation",
          owner: "Approver",
          status: "escalated",
          priority: "high",
          due: "27 May 2026",
          dueAt: "2026-05-27T00:00:00.000Z",
        },
      ],
      window: {
        pageSize: 1,
        totalCount: 3,
        hasNextPage: true,
        nextCursor: "work-1",
      },
    });

    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.pagination?.totalCount).toBe(3);
    expect(parsed.data.rows[0]?.rowTone).toBe("critical");
    expect(parsed.data.rows[0]?.cells.due).toBe("2026-05-27T00:00:00.000Z");
    expect(parsed.data.rows[0]?.rowHref).toBe("/approvals/work-items/work-1");
    expect(parsed.data.rows[0]?.linkColumnId).toBe("subject");
    expect(parsed.data.rows[0]?.trailingAction?.state).toBe("ready");
    expect(parsed.data.rows[0]?.trailingAction?.descriptor?.label).toBe(
      "Open work item",
    );
  });

  it("links dashboard workflow rows to the owning module work item route", () => {
    const surface = buildDashboardWorkflowListSurface({
      workItems: [
        {
          id: "work/1",
          moduleId: "finance",
          subject: "Finance escalation",
          owner: "AP Analyst",
          status: "pending",
          priority: "high",
          due: "27 May 2026",
          dueAt: "2026-05-27T00:00:00.000Z",
        },
      ],
    });

    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.rows[0]?.rowHref).toBe("/finance/work-items/work%2F1");
    expect(parsed.data.rows[0]?.linkColumnId).toBe("subject");
  });

  it("normalizes empty list windows to schema-safe pagination", () => {
    const surface = buildModuleWorkItemListSurface({
      moduleId: "finance",
      workItems: [],
      window: {
        pageSize: 0,
        totalCount: 0,
        hasNextPage: false,
      },
    });

    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.pagination?.pageSize).toBe(1);
    expect(parsed.data.rows).toHaveLength(0);
  });

  it("normalizes list query params and drops unsupported values", () => {
    const query = resolveModuleWorkspaceListQuery({
      recordsCursor: "offset:6",
      recordsSort: "updated-desc",
      recordsStatus: "blocked",
      workItemsSort: "unknown",
      workItemsPriority: "high",
    });

    expect(query).toEqual({
      recordsCursor: "offset:6",
      recordsSort: "updated-desc",
      recordsStatus: "blocked",
      workItemsCursor: undefined,
      workItemsPriority: "high",
      workItemsSort: undefined,
      workItemsStatus: undefined,
    });
  });

  it("adds toolbar state and pagination hrefs to governed record lists", () => {
    const surface = buildModuleRecordListSurface({
      moduleId: "finance",
      records: [{ ...baseRecord, recordType: "close-control" }],
      query: {
        recordsSort: "updated-desc",
        recordsStatus: "blocked",
      },
      window: {
        pageSize: 1,
        totalCount: 2,
        hasNextPage: true,
        nextCursor: "offset:1",
      },
    });
    const parsed = parseListSurfaceRendererConfiguration(surface);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.presentation?.toolbar?.sort?.value).toBe("updated-desc");
    expect(parsed.data.presentation?.toolbar?.filters?.[0]?.value).toBe(
      "blocked",
    );
    expect(parsed.data.pagination?.nextHref).toBe(
      "/finance?recordsSort=updated-desc&recordsStatus=blocked&recordsCursor=offset%3A1",
    );
  });

  it("maps entity audit rows into a governed audit panel model", () => {
    const auditPanel = buildAuditPanelModel({
      title: "Record audit",
      description: "Read-only audit entries scoped to this record.",
      resourceLabel: "FIN-CLOSE-001",
      auditLogs: [
        {
          id: "audit-1",
          organizationId: "org-1",
          actorAuthUserId: "auth-user-1",
          entityType: "erp-record",
          entityId: "record-1",
          action: "record.update",
          summary: "Updated record status.",
          metadata: {
            status: "blocked",
            amountCents: 12400000,
            nested: { ignored: true },
          },
          createdAt: new Date("2026-05-27T00:00:00.000Z"),
          updatedAt: new Date("2026-05-27T00:00:00.000Z"),
        },
      ],
    });

    const parsed = parseAuditPanelData(auditPanel);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.rows[0]?.action).toBe("record.update");
    expect(
      parsed.data.rows[0]?.metadataChips?.map((chip) => chip.label),
    ).toEqual(["status", "amountCents"]);
  });

  it("builds a schema-safe empty audit panel", () => {
    const parsed = parseAuditPanelData(
      buildAuditPanelModel({
        title: "Empty audit",
        resourceLabel: "Work item",
        auditLogs: [],
      }),
    );

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.rows).toHaveLength(0);
  });
});
