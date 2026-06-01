import { describe, expect, it } from "vitest";

import { buildSystemAdminAuditViewerListSurface } from "../../src/audit-viewer/surface/system-admin.audit-list.surface";
import { buildSystemAdminRetentionPoliciesListSurface } from "../../src/audit-viewer/surface/system-admin.retention-list.surface";
import { systemAdminAuditUiCopy } from "../../src/audit-viewer/surface/system-admin.audit-ui.copy.shared";
import {
  systemAdminAuditCoverageGalleryGaps,
  systemAdminAuditDetailGalleryFixture,
  systemAdminAuditViewerGalleryRows,
} from "../../src/audit-viewer/surface/system-admin.audit-viewer-gallery.fixtures.shared";

describe("system admin audit viewer gallery surfaces", () => {
  it("renders audit list fixture rows with governed columns", () => {
    const surface = buildSystemAdminAuditViewerListSurface({
      rows: systemAdminAuditViewerGalleryRows,
      params: { auditPage: 1, auditPageSize: 25 },
      totalCount: systemAdminAuditViewerGalleryRows.length,
      pageSize: 25,
      page: 1,
      hasNextPage: false,
    });

    expect(surface.rows).toHaveLength(3);
    expect(surface.surface.empty?.title).toBe(
      systemAdminAuditUiCopy.auditList.emptyTitle,
    );
  });

  it("renders empty audit list copy", () => {
    const surface = buildSystemAdminAuditViewerListSurface({
      rows: [],
      params: { auditPage: 1, auditPageSize: 25 },
      totalCount: 0,
      pageSize: 25,
      page: 1,
      hasNextPage: false,
    });

    expect(surface.rows).toHaveLength(0);
    expect(surface.surface.empty?.description).toBe(
      systemAdminAuditUiCopy.auditList.emptyDescription,
    );
  });

  it("renders retention list empty copy", () => {
    const surface = buildSystemAdminRetentionPoliciesListSurface({
      policies: [],
    });

    expect(surface.rows).toHaveLength(0);
    expect(surface.surface.empty?.title).toBe(
      systemAdminAuditUiCopy.retentionList.emptyTitle,
    );
  });

  it("exposes gallery detail fixture correlation refs", () => {
    expect(systemAdminAuditDetailGalleryFixture.policyKeys).toContain(
      "purchasing.po.require-approval",
    );
    expect(systemAdminAuditDetailGalleryFixture.approvalKeys).toContain(
      "purchasing.po.approval",
    );
    expect(systemAdminAuditDetailGalleryFixture.timeline.length).toBeGreaterThan(
      0,
    );
  });

  it("exposes coverage gap gallery fixture", () => {
    expect(systemAdminAuditCoverageGalleryGaps[0]?.capabilityKey).toBe(
      "finance.payment.release",
    );
  });
});
