import { appCapabilities, type AppCapability } from "@afenda/auth";
import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import { parseSystemAdminCsv } from "../../src/data-management/data/system-admin.data-management-csv.parse.shared";
import {
  getSystemAdminImportAdapter,
  listSystemAdminImportTemplates,
} from "../../src/data-management/data/system-admin.import-adapter.registry.server";
import {
  buildSystemAdminDataExportsListSurface,
  buildSystemAdminImportFailuresListSurface,
  buildSystemAdminImportJobsListSurface,
  buildSystemAdminImportTemplatesListSurface,
} from "../../src/data-management/surface/system-admin.import-jobs-list.surface";
import {
  resolveSystemAdminNavItems,
  systemAdminRoutePaths,
} from "../../src/overview/contracts";

describe("system admin data management", () => {
  it("parses CSV with quoted commas and rejects duplicate headers", () => {
    const parsed = parseSystemAdminCsv(
      'userEmail,requestedRole,accessReason,note\nowner@example.com,admin,"Quarterly, reviewed","private note"',
    );

    expect(parsed.errors).toEqual([]);
    expect(parsed.headers).toEqual([
      "userEmail",
      "requestedRole",
      "accessReason",
      "note",
    ]);
    expect(parsed.records[0]?.accessReason).toBe("Quarterly, reviewed");

    const duplicate = parseSystemAdminCsv(
      "userEmail,userEmail\nowner@example.com,admin",
    );

    expect(duplicate.errors).toContain("CSV source contains duplicate headers.");
  });

  it("validates import rows and redacts sensitive preview values", () => {
    const template = listSystemAdminImportTemplates()[0]!;
    const adapter = getSystemAdminImportAdapter(template.adapterId)!;

    const invalid = adapter.parseRow({
      userEmail: "not-email",
      requestedRole: "admin",
      accessReason: "Quarterly access review",
      note: "sensitive operator note",
    });

    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.code).toBe("invalid_user_email");
      expect(invalid.redactedPreview.note).toBe("[redacted]");
    }
  });

  it("exposes governed surfaces for templates, jobs, failures, and exports", () => {
    const template = listSystemAdminImportTemplates()[0]!;
    const now = new Date("2026-06-01T00:00:00.000Z");

    const surfaces = [
      buildSystemAdminImportTemplatesListSurface({ templates: [template] }),
      buildSystemAdminImportJobsListSurface({
        canRun: true,
        canCancel: true,
        jobs: [
          {
            id: "dmjob_1",
            adapterId: template.adapterId,
            templateId: template.id,
            templateLabel: template.label,
            sourceLabel: "Quarterly access review",
            filename: "access-review.csv",
            inputDigest: "abcdef0123456789abcdef0123456789",
            status: "ready",
            statusLabel: "Ready",
            totalRows: 2,
            validatedRows: 2,
            appliedRows: 0,
            failedRows: 0,
            skippedRows: 0,
            createdByAuthUserId: "user_admin",
            createdAt: now,
            updatedAt: now,
            completedAt: null,
            canRun: true,
            canCancel: true,
          },
        ],
      }),
      buildSystemAdminImportFailuresListSurface({
        failures: [
          {
            id: "dmrow_1",
            jobId: "dmjob_1",
            rowNumber: 2,
            status: "failed",
            statusLabel: "Failed",
            rowDigest: "row_digest",
            validationCode: "invalid_user_email",
            validationMessage: "userEmail must be a valid email address.",
            redactedPreview: { userEmail: "bad", note: "[redacted]" },
            createdAt: now,
          },
        ],
      }),
      buildSystemAdminDataExportsListSurface({
        exports: [
          {
            id: "dmexp_1",
            exportType: "jobs",
            sourceLabel: "system-admin.data-management.jobs",
            status: "ready",
            statusLabel: "Ready",
            rowCount: 1,
            packageDigest: "export_digest",
            createdByAuthUserId: "user_admin",
            createdAt: now,
          },
        ],
      }),
    ];

    for (const surface of surfaces) {
      const parsed = parseListSurfaceRendererConfiguration(surface);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.requiresErpPermission).toEqual({
          module: "system-admin",
          object: "data-management",
          function: "read",
        });
      }
    }
  });

  it("wires route, nav, and app capability catalog entries", () => {
    const requiredCapabilities = [
      "system-admin.data-management.read",
      "system-admin.data-management.manage",
      "system-admin.data-management.run",
      "system-admin.data-management.cancel",
      "system-admin.data-management.export",
    ] as const satisfies readonly AppCapability[];

    expect(systemAdminRoutePaths.dataManagement).toBe(
      "/system-admin/data-management",
    );
    expect(requiredCapabilities.every((capability) =>
      appCapabilities.includes(capability),
    )).toBe(true);
    expect(
      resolveSystemAdminNavItems(["system-admin.data-management.read"]).some(
        (item) => item.href === systemAdminRoutePaths.dataManagement,
      ),
    ).toBe(true);
  });
});
