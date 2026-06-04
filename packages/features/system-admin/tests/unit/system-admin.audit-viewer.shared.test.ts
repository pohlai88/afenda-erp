import { describe, expect, it } from "vitest";

import { buildSystemAdminAuditSearchFilters } from "../../src/features/audit-viewer/sys-audit-search-filters.shared";
import { parseSystemAdminAuditExportFormData } from "../../src/features/audit-viewer/sys-audit-export-form.shared";
import { extractAuditCorrelationRefs } from "../../src/features/audit-viewer/sys-audit-correlation.shared";

describe("audit viewer shared helpers", () => {
  it("builds tenant audit search filters from parsed params", () => {
    const filters = buildSystemAdminAuditSearchFilters({
      auditPage: 1,
      auditPageSize: 25,
      auditActor: "actor_1",
      auditAction: "finance.invoice.create",
      auditTargetType: "erp-record",
      auditTargetId: "inv_1",
      auditModule: "finance",
      auditQ: "invoice",
      auditFrom: "2026-01-01",
      auditTo: "2026-01-31",
      auditSort: "asc",
    });

    expect(filters).toEqual({
      actorAuthUserId: "actor_1",
      action: "finance.invoice.create",
      targetType: "erp-record",
      targetId: "inv_1",
      moduleKey: "finance",
      query: "invoice",
      createdAfter: new Date("2026-01-01"),
      createdBefore: new Date("2026-01-31"),
      sortDirection: "asc",
    });
  });

  it("normalizes inverted audit date ranges", () => {
    const filters = buildSystemAdminAuditSearchFilters({
      auditPage: 1,
      auditPageSize: 25,
      auditFrom: "2026-02-01",
      auditTo: "2026-01-01",
    });

    expect(filters.createdAfter).toEqual(new Date("2026-01-01"));
    expect(filters.createdBefore).toEqual(new Date("2026-02-01"));
  });

  it("parses export form data with trimmed optional fields", () => {
    const formData = new FormData();
    formData.set("format", "json");
    formData.set("auditActor", "  actor_1  ");
    formData.set("auditQ", "");

    const { formatParsed, paramsParsed } = parseSystemAdminAuditExportFormData(formData);

    expect(formatParsed.success).toBe(true);
    expect(paramsParsed.success).toBe(true);
    if (formatParsed.success) {
      expect(formatParsed.data).toBe("json");
    }
    if (paramsParsed.success) {
      expect(paramsParsed.data.auditActor).toBe("actor_1");
      expect(paramsParsed.data.auditQ).toBeUndefined();
    }
  });

  it("rejects tampered export filter values", () => {
    const formData = new FormData();
    formData.set("format", "csv");
    formData.set("auditTargetType", "not-a-valid-target");

    const { paramsParsed } = parseSystemAdminAuditExportFormData(formData);

    expect(paramsParsed.success).toBe(false);
  });

  it("deduplicates correlation refs from metadata", () => {
    const refs = extractAuditCorrelationRefs({
      policyKey: "policy.a",
      policyKeys: ["policy.a", "policy.b"],
      approvalKey: "approval.a",
    });

    expect(refs.policyKeys).toEqual(["policy.a", "policy.b"]);
    expect(refs.approvalKeys).toEqual(["approval.a"]);
  });
});
