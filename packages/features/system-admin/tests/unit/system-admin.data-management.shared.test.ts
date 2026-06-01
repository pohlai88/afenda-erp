import { describe, expect, it } from "vitest";

import {
  SYSTEM_ADMIN_DATA_MANAGEMENT_AUDIT_TARGET_TYPE,
  SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT,
} from "../../src/data-management/contracts/system-admin.data-management.limits.shared";
import { buildSystemAdminDataManagementExportCsv } from "../../src/data-management/data/system-admin.data-management-export.build.server";
import { findMissingCsvHeaders } from "../../src/data-management/data/system-admin.data-management-headers.shared";
import { parseSystemAdminImportJobFormData } from "../../src/data-management/data/system-admin.import-job-form.shared";
import { systemAdminDataManagementAuditActions } from "../../src/data-management/events/system-admin.data-management.event";

describe("data-management shared helpers", () => {
  it("uses hyphenated audit action keys", () => {
    expect(systemAdminDataManagementAuditActions.importCreate).toBe(
      "system-admin.data-management.import.create",
    );
    expect(systemAdminDataManagementAuditActions.export).toBe(
      "system-admin.data-management.export",
    );
    expect(systemAdminDataManagementAuditActions.importCreate).not.toContain(
      "system_admin",
    );
  });

  it("declares audit target type constant", () => {
    expect(SYSTEM_ADMIN_DATA_MANAGEMENT_AUDIT_TARGET_TYPE).toBe(
      "system_admin_data_management",
    );
  });

  it("finds missing csv headers case-insensitively", () => {
    expect(
      findMissingCsvHeaders(["UserEmail", "Role"], ["userEmail", "accessReason"]),
    ).toEqual(["accessReason"]);
  });

  it("parses import job form data with trimmed values", () => {
    const formData = new FormData();
    formData.set("templateId", " access-review ");
    formData.set("sourceLabel", " Q1 review ");
    formData.set("filename", " review.csv ");
    formData.set("sourceData", "userEmail,requestedRole\na@example.com,admin");

    const parsed = parseSystemAdminImportJobFormData(formData);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.templateId).toBe("access-review");
      expect(parsed.data.sourceLabel).toBe("Q1 review");
      expect(parsed.data.filename).toBe("review.csv");
    }
  });

  it("marks export csv truncated when row count reaches query limit", () => {
    const jobs = Array.from({ length: SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT }, (_, index) => ({
      id: `job_${index}`,
      adapterId: "adapter",
      templateId: "template",
      templateLabel: "Template",
      sourceLabel: "label",
      filename: "source.csv",
      status: "ready" as const,
      statusLabel: "Ready",
      totalRows: 1,
      validatedRows: 1,
      appliedRows: 0,
      failedRows: 0,
      skippedRows: 0,
      inputDigest: "digest",
      createdByAuthUserId: "user",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      completedAt: null,
      canRun: true,
      canCancel: true,
    }));

    const { csv, rowCount, truncated } = buildSystemAdminDataManagementExportCsv({
      scope: "jobs",
      jobs,
      failures: [],
      exports: [],
      queryLimit: SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT,
    });

    expect(rowCount).toBe(SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT);
    expect(truncated).toBe(true);
    expect(csv).toContain("job_0");
  });

  it("does not mark export csv truncated below query limit", () => {
    const { truncated, rowCount } = buildSystemAdminDataManagementExportCsv({
      scope: "jobs",
      jobs: [],
      failures: [],
      exports: [],
      queryLimit: SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT,
    });

    expect(rowCount).toBe(0);
    expect(truncated).toBe(false);
  });
});
