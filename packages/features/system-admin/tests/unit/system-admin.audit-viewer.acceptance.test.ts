import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    searchTenantAuditLogs: vi.fn(async () => ({ rows: [], totalCount: 0 })),
  };
});

import {
  AUDIT_VIEWER_ACCEPTANCE_CRITERIA_COVERAGE,
  AUDIT_VIEWER_REQUIREMENT_COVERAGE,
  assertAuditViewerAcceptanceCriteriaComplete,
  assertAuditViewerCoverageComplete,
} from "../../src/audit-viewer/data/system-admin.audit-viewer.coverage.shared";
import { extractAuditCorrelationRefs } from "../../src/audit-viewer/data/system-admin.audit-correlation.shared";
import { mapTenantAuditLogToDetail } from "../../src/audit-viewer/data/system-admin.audit.query.server";
import { buildSystemAdminAuditInvestigationLinks } from "../../src/audit-viewer/surface/system-admin.audit-investigation.shared";
import { buildSystemAdminAuditViewerListSurface } from "../../src/audit-viewer/surface/system-admin.audit-list.surface";
import { systemAdminAuditViewerGalleryRows } from "../../src/audit-viewer/surface/system-admin.audit-viewer-gallery.fixtures.shared";

describe("SUC-001..030 coverage registry", () => {
  it("registers all thirty functional requirements", () => {
    assertAuditViewerCoverageComplete();
    const codes = AUDIT_VIEWER_REQUIREMENT_COVERAGE.map((entry) => entry.code);
    for (let index = 1; index <= 30; index += 1) {
      expect(codes).toContain(`SUC-${String(index).padStart(3, "0")}`);
    }
  });

  it("maps all enterprise acceptance criteria as shipped", () => {
    assertAuditViewerAcceptanceCriteriaComplete();
    expect(AUDIT_VIEWER_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(18);
    expect(
      AUDIT_VIEWER_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (row) => row.status === "shipped",
      ),
    ).toBe(true);
  });
});

describe("SUC domain behavior", () => {
  it("extracts policy and approval correlation refs from metadata", () => {
    const refs = extractAuditCorrelationRefs({
      policyKey: "purchasing.po.require-approval",
      approvalKeys: ["purchasing.po.approval"],
    });

    expect(refs.policyKeys).toEqual(["purchasing.po.require-approval"]);
    expect(refs.approvalKeys).toEqual(["purchasing.po.approval"]);
  });

  it("maps audit detail with correlation refs and redacted metadata", () => {
    const detail = mapTenantAuditLogToDetail(
      {
        id: "audit_1",
        organizationId: "org_1",
        actorAuthUserId: "actor_1",
        entityType: "organization",
        entityId: "org_1",
        action: "system-admin.policy_rule.update",
        summary: "Policy updated",
        metadata: {
          policyKey: "finance.payment.policy",
          apiKey: "secret",
        },
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      [],
    );

    expect(detail.policyKeys).toEqual(["finance.payment.policy"]);
    expect(detail.metadata.apiKey).toBe("[redacted]");
  });

  it("builds actor, target, capability, and action investigation links", () => {
    const links = buildSystemAdminAuditInvestigationLinks({
      actorId: "actor_1",
      action: "finance.invoice.create",
      entityType: "erp-record",
      entityId: "inv_1",
      moduleKey: "finance",
    });

    expect(links.map((link) => link.kind)).toEqual([
      "actor",
      "target",
      "capability",
      "action",
    ]);
    expect(links[0]?.href).toContain("auditActor=actor_1");
    expect(links[1]?.href).toContain("auditTargetId=inv_1");
  });

  it("declares governed Pattern C list metadata for audit viewer", () => {
    const surface = buildSystemAdminAuditViewerListSurface({
      rows: systemAdminAuditViewerGalleryRows,
      params: { auditPage: 1, auditPageSize: 25 },
      totalCount: 3,
      pageSize: 25,
      page: 1,
      hasNextPage: false,
    });

    expect(surface.columns.length).toBeGreaterThan(0);
    expect(surface.rows).toHaveLength(3);
    expect(surface.requiresErpPermission?.function).toBe("read");
  });
});
