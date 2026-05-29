import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  archiveHrEmployeeDocument,
  listHrEmployeeDirectoryWindow,
  listHrEmployeeDocumentsWindow,
  registerHrEmployeeDocument,
  rejectHrEmployeeDocument,
  verifyHrEmployeeDocument,
} from "@afenda/db";
import { describe, expect, it } from "vitest";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(packageRoot, "../../../../..");

config({ path: resolve(repoRoot, ".env.local") });
config({ path: resolve(repoRoot, ".env.config"), override: false });
config({ path: resolve(repoRoot, ".secret.config"), override: true });

const integrationEnabled = Boolean(
  process.env.DATABASE_URL ??
    process.env.NEON_PREVIEW_DATABASE_URL ??
    process.env.DATABASE_MIGRATION_URL,
);

describe.skipIf(!integrationEnabled)("hr document commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("registers, verifies, and archives an employee document", async () => {
    const employees = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: 1,
    });
    const employee = employees.rows[0];
    expect(employee).toBeDefined();

    const blobUrl = `https://example.test/hr-docs/${Date.now()}.pdf`;
    const registered = await registerHrEmployeeDocument({
      organizationId,
      employeeId: employee!.id,
      documentType: "identity",
      title: "Integration test passport",
      blobUrl,
      mimeType: "application/pdf",
      sizeBytes: 4096,
      classification: "confidential",
    });

    const afterRegister = await listHrEmployeeDocumentsWindow({
      organizationId,
      limit: 25,
      search: "Integration test passport",
    });
    const row = afterRegister.rows.find((doc) => doc.id === registered.documentId);
    expect(row?.verificationStatus).toBe("pending");

    await verifyHrEmployeeDocument({
      organizationId,
      documentId: registered.documentId,
    });

    const afterVerify = await listHrEmployeeDocumentsWindow({
      organizationId,
      limit: 25,
      search: "Integration test passport",
    });
    expect(
      afterVerify.rows.find((doc) => doc.id === registered.documentId)
        ?.verificationStatus,
    ).toBe("verified");

    await archiveHrEmployeeDocument({
      organizationId,
      documentId: registered.documentId,
    });

    const activeWindow = await listHrEmployeeDocumentsWindow({
      organizationId,
      limit: 25,
      search: "Integration test passport",
    });
    expect(
      activeWindow.rows.find((doc) => doc.id === registered.documentId),
    ).toBeUndefined();

    const archivedWindow = await listHrEmployeeDocumentsWindow({
      organizationId,
      limit: 25,
      search: "Integration test passport",
      includeArchived: true,
    });
    expect(
      archivedWindow.rows.find((doc) => doc.id === registered.documentId)
        ?.lifecycleStatus,
    ).toBe("archived");
  });

  it("registers with expiry and rejects with reason", async () => {
    const employees = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: 1,
    });
    const employee = employees.rows[0];
    expect(employee).toBeDefined();

    const effectiveTo = new Date("2030-06-01T00:00:00.000Z");
    const registered = await registerHrEmployeeDocument({
      organizationId,
      employeeId: employee!.id,
      documentType: "certification",
      title: "Integration reject test",
      blobUrl: `https://example.test/hr-docs/reject-${Date.now()}.pdf`,
      mimeType: "application/pdf",
      sizeBytes: 2048,
      effectiveTo,
    });

    const listed = await listHrEmployeeDocumentsWindow({
      organizationId,
      limit: 25,
      search: "Integration reject test",
    });
    const row = listed.rows.find((doc) => doc.id === registered.documentId);
    expect(row?.effectiveTo?.toISOString()).toBe(effectiveTo.toISOString());

    await rejectHrEmployeeDocument({
      organizationId,
      documentId: registered.documentId,
      rejectionReason: "Illegible scan",
    });

    const afterReject = await listHrEmployeeDocumentsWindow({
      organizationId,
      limit: 25,
      search: "Integration reject test",
    });
    expect(
      afterReject.rows.find((doc) => doc.id === registered.documentId)
        ?.verificationStatus,
    ).toBe("rejected");
  });
});
