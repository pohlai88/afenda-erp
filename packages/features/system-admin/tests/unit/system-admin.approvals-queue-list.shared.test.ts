import { describe, expect, it } from "vitest";

import {
  applySystemAdminApprovalQueueToolbarState,
  approvalQueueWorkItemPriorityBadgeCellKind,
  approvalQueueWorkItemStatusBadgeCellKind,
  buildSystemAdminApprovalQueuePageHref,
  buildSystemAdminApprovalQueuePagination,
  mapApprovalQueueRowToListSurfaceRow,
  resolveApprovalQueueEscalationLabel,
  resolveApprovalQueueListRowTone,
  resolveApprovalQueuePriorityLabel,
  resolveApprovalQueueStatusLabel,
  resolveApprovalQueueWorkItemHref,
} from "../../src/approvals/surface/system-admin.approvals-queue-list.shared";
import { systemAdminApprovalsUiCopy } from "../../src/approvals/surface/system-admin.approvals-ui.copy.shared";

const baseQueueRow = {
  id: "work-1",
  subject: "Capex request",
  owner: "Finance Controller",
  status: "pending",
  priority: "medium",
  due: "Jun 3",
  dueAt: "2026-06-03T00:00:00.000Z",
  route: "capex",
  escalated: false,
  sourceRecordHref: "/approvals/records/rec-1" as const,
  decisionComplete: false,
};

describe("system-admin approval queue list shared helpers", () => {
  it("maps work item status to governed badge tones", () => {
    expect(approvalQueueWorkItemStatusBadgeCellKind("escalated")).toEqual({
      kind: "badge",
      tone: "critical",
    });
    expect(approvalQueueWorkItemStatusBadgeCellKind("in-review")).toEqual({
      kind: "badge",
      tone: "attention",
    });
    expect(approvalQueueWorkItemStatusBadgeCellKind("completed")).toEqual({
      kind: "badge",
      tone: "positive",
    });
  });

  it("maps work item priority to governed badge tones", () => {
    expect(approvalQueueWorkItemPriorityBadgeCellKind("high")).toEqual({
      kind: "badge",
      tone: "critical",
    });
    expect(approvalQueueWorkItemPriorityBadgeCellKind("medium")).toEqual({
      kind: "badge",
      tone: "attention",
    });
    expect(approvalQueueWorkItemPriorityBadgeCellKind("low")).toEqual({
      kind: "badge",
      tone: "default",
    });
  });

  it("resolves human-readable queue labels", () => {
    expect(resolveApprovalQueueStatusLabel("in-review")).toBe("In review");
    expect(resolveApprovalQueuePriorityLabel("high")).toBe("High");
    expect(resolveApprovalQueueEscalationLabel(true)).toBe("Escalated");
    expect(resolveApprovalQueueEscalationLabel(false)).toBe("—");
  });

  it("assigns row tone from escalation, status, and priority", () => {
    expect(
      resolveApprovalQueueListRowTone({
        status: "pending",
        priority: "low",
        escalated: false,
      }),
    ).toBe("default");
    expect(
      resolveApprovalQueueListRowTone({
        status: "in-review",
        priority: "medium",
        escalated: false,
      }),
    ).toBe("attention");
    expect(
      resolveApprovalQueueListRowTone({
        status: "escalated",
        priority: "high",
        escalated: true,
      }),
    ).toBe("critical");
  });

  it("maps queue rows to list surface metadata", () => {
    const row = mapApprovalQueueRowToListSurfaceRow({
      row: {
        ...baseQueueRow,
        status: "escalated",
        priority: "high",
        escalated: true,
      },
      canDecide: true,
    });

    expect(row.id).toBe("work-1");
    expect(row.rowHref).toBe(resolveApprovalQueueWorkItemHref("work-1"));
    expect(row.cells.status).toBe("Escalated");
    expect(row.cells.priority).toBe("High");
    expect(row.rowTone).toBe("critical");
    expect(row.trailingAction?.state).toBe("ready");
    expect(row.cellKinds?.status).toEqual({
      kind: "badge",
      tone: "critical",
    });
  });

  it("hides trailing metadata for completed queue rows", () => {
    const row = mapApprovalQueueRowToListSurfaceRow({
      row: {
        ...baseQueueRow,
        status: "completed",
        decisionComplete: true,
      },
      canDecide: true,
    });

    expect(row.trailingAction?.state).toBe("hidden");
    expect(row.cells.status).toBe(
      systemAdminApprovalsUiCopy.queue.statusLabels.completed,
    );
  });

  it("builds bookmarkable queue page hrefs from module query", () => {
    expect(
      buildSystemAdminApprovalQueuePageHref(
        {
          workItemsStatus: "pending",
          workItemsSort: "due-asc",
        },
        "offset:25",
      ),
    ).toBe(
      "/system-admin/approvals?workItemsSort=due-asc&workItemsStatus=pending&workItemsCursor=offset%3A25",
    );
  });

  it("applies module query to queue toolbar filters and sort", () => {
    const toolbar = applySystemAdminApprovalQueueToolbarState({
      workItemsStatus: "in-review",
      workItemsPriority: "high",
      workItemsSort: "priority-desc",
    });

    expect(toolbar.filters?.[0]?.value).toBe("in-review");
    expect(toolbar.filters?.[1]?.value).toBe("high");
    expect(toolbar.sort?.value).toBe("priority-desc");
  });

  it("builds paginated queue hrefs when window and query are present", () => {
    const pagination = buildSystemAdminApprovalQueuePagination({
      window: {
        pageSize: 25,
        totalCount: 50,
        hasNextPage: true,
        nextCursor: "offset:25",
      },
      rowCount: 25,
      query: {
        workItemsCursor: "offset:25",
        workItemsSort: "due-asc",
      },
    });

    expect(pagination.hasNextPage).toBe(true);
    expect(pagination.nextHref).toContain("/system-admin/approvals");
    expect(pagination.nextHref).toContain("workItemsCursor=offset%3A25");
    expect(pagination.prevHref).toBe("/system-admin/approvals?workItemsSort=due-asc");
  });
});
