import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import {
  systemAdminApprovalStatusLabels,
  systemAdminApprovalReadinessLabels,
} from "../../src/features/approvals/sys-approvals-detail-badges.shared";
import {
  systemAdminApprovalsGalleryRows,
  systemAdminApprovalsGalleryScenarioKeys,
  systemAdminApprovalsQueueGalleryRows,
  systemAdminApprovalsQueueGalleryScenarioKeys,
} from "../../src/features/approvals/sys-approvals-gallery.fixtures.shared";
import { buildApprovalsListSurface } from "../../src/features/approvals/sys-approvals-list.surface";
import { buildSystemAdminApprovalQueueListSurface } from "../../src/features/approvals/sys-approvals-queue-list.surface";
import { SYSTEM_ADMIN_APPROVAL_QUEUE_ROW_TRAILING_ACTION_IDS } from "../../src/features/approvals/sys-approvals-queue-list-trailing.shared";

describe("system admin approvals list surface gallery", () => {
  it.each([
    [
      "approvals — ready",
      buildApprovalsListSurface({
        approvals: systemAdminApprovalsGalleryRows,
        canMutate: true,
      }),
    ],
    [
      "approvals — read only",
      buildApprovalsListSurface({
        approvals: systemAdminApprovalsGalleryRows,
        canMutate: false,
      }),
    ],
    [
      "approvals — empty",
      buildApprovalsListSurface({ approvals: [], canMutate: true }),
    ],
  ])("parses list surface %s", (_name, surface) => {
    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
  });

  it("serializes trailing action metadata for active approval rows", () => {
    const surface = buildApprovalsListSurface({
      approvals: systemAdminApprovalsGalleryRows,
      canMutate: true,
    });

    const activeRow = surface.rows.find(
      (row) => row.id === systemAdminApprovalsGalleryScenarioKeys.readyActive,
    );
    expect(activeRow?.trailingAction?.state).toBe("ready");
    expect(activeRow?.cells.escalation).toContain("notify");
    expect(activeRow?.cells.status).toBe(
      systemAdminApprovalStatusLabels.active,
    );
    expect(activeRow?.cells.readinessVerdict).toBe(
      systemAdminApprovalReadinessLabels.ready,
    );
  });

  it("renders deprecated and blocked badge labels in the gallery matrix", () => {
    const surface = buildApprovalsListSurface({
      approvals: systemAdminApprovalsGalleryRows,
      canMutate: true,
    });

    const deprecatedRow = surface.rows.find(
      (row) =>
        row.id === systemAdminApprovalsGalleryScenarioKeys.blockedDeprecated,
    );
    expect(deprecatedRow?.cells.status).toBe(
      systemAdminApprovalStatusLabels.deprecated,
    );
    expect(deprecatedRow?.cells.readinessVerdict).toBe(
      systemAdminApprovalReadinessLabels.blocked,
    );
    expect(deprecatedRow?.trailingAction?.state).toBe("hidden");
  });

  it("disables trailing actions when manage capability is absent", () => {
    const surface = buildApprovalsListSurface({
      approvals: systemAdminApprovalsGalleryRows,
      canMutate: false,
    });

    const activeRow = surface.rows.find(
      (row) => row.id === systemAdminApprovalsGalleryScenarioKeys.readyActive,
    );
    expect(activeRow?.trailingAction?.state).toBe("disabled");
  });

  it("uses read-only empty copy when manage capability is absent", () => {
    const surface = buildApprovalsListSurface({
      approvals: [],
      canMutate: false,
    });

    expect(surface.surface.empty?.description).toContain(
      "system-admin.approvals.manage",
    );
    expect(surface.surface.empty?.description).not.toContain("editor below");
  });
});

describe("system admin approvals queue list surface gallery", () => {
  it.each([
    [
      "queue — decide ready",
      buildSystemAdminApprovalQueueListSurface({
        rows: systemAdminApprovalsQueueGalleryRows,
        canDecide: true,
      }),
    ],
    [
      "queue — read only",
      buildSystemAdminApprovalQueueListSurface({
        rows: systemAdminApprovalsQueueGalleryRows,
        canDecide: false,
      }),
    ],
    [
      "queue — empty",
      buildSystemAdminApprovalQueueListSurface({
        rows: [],
        canDecide: true,
      }),
    ],
    [
      "queue — filtered toolbar",
      buildSystemAdminApprovalQueueListSurface({
        rows: systemAdminApprovalsQueueGalleryRows,
        canDecide: true,
        query: {
          workItemsStatus: "pending",
          workItemsPriority: "high",
          workItemsSort: "due-asc",
        },
      }),
    ],
  ])("parses queue list surface %s", (_name, surface) => {
    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
  });

  it("serializes approve trailing metadata for pending queue rows", () => {
    const surface = buildSystemAdminApprovalQueueListSurface({
      rows: systemAdminApprovalsQueueGalleryRows,
      canDecide: true,
    });

    const pendingRow = surface.rows.find(
      (row) =>
        row.id === systemAdminApprovalsQueueGalleryScenarioKeys.pendingDecide,
    );
    expect(pendingRow?.trailingAction?.state).toBe("ready");
    expect(pendingRow?.trailingAction?.descriptor?.id).toBe(
      SYSTEM_ADMIN_APPROVAL_QUEUE_ROW_TRAILING_ACTION_IDS.approve,
    );
    expect(pendingRow?.trailingAction?.descriptor?.intent).toBe("approval");
    expect(pendingRow?.cells.escalation).toBe("—");
  });

  it("renders escalated badge tone in the gallery matrix", () => {
    const surface = buildSystemAdminApprovalQueueListSurface({
      rows: systemAdminApprovalsQueueGalleryRows,
      canDecide: true,
    });

    const escalatedRow = surface.rows.find(
      (row) =>
        row.id === systemAdminApprovalsQueueGalleryScenarioKeys.escalated,
    );
    expect(escalatedRow?.cells.status).toBe("Escalated");
    expect(escalatedRow?.cells.escalation).toBe("Escalated");
    expect(escalatedRow?.rowTone).toBe("critical");
  });

  it("hides trailing actions for completed queue rows", () => {
    const surface = buildSystemAdminApprovalQueueListSurface({
      rows: systemAdminApprovalsQueueGalleryRows,
      canDecide: true,
    });

    const completedRow = surface.rows.find(
      (row) =>
        row.id === systemAdminApprovalsQueueGalleryScenarioKeys.completed,
    );
    expect(completedRow?.trailingAction?.state).toBe("hidden");
  });

  it("disables trailing actions when decide capability is absent", () => {
    const surface = buildSystemAdminApprovalQueueListSurface({
      rows: systemAdminApprovalsQueueGalleryRows,
      canDecide: false,
    });

    const pendingRow = surface.rows.find(
      (row) =>
        row.id === systemAdminApprovalsQueueGalleryScenarioKeys.pendingDecide,
    );
    expect(pendingRow?.trailingAction?.state).toBe("disabled");
  });

  it("wires queue toolbar filter state from module query", () => {
    const surface = buildSystemAdminApprovalQueueListSurface({
      rows: systemAdminApprovalsQueueGalleryRows,
      canDecide: true,
      query: {
        workItemsStatus: "escalated",
        workItemsSort: "priority-desc",
      },
    });

    expect(surface.presentation?.toolbar?.filters?.[0]?.value).toBe("escalated");
    expect(surface.presentation?.toolbar?.sort?.value).toBe("priority-desc");
  });
});
