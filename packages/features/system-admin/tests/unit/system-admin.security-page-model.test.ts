import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/db", async (importOriginal) => {
  const original = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...original,
    getOrganizationObjectStorageProvider: vi.fn(async () => "r2"),
    getOrganizationEncryptionSettings: vi.fn(async () => ({
      mode: "platform" as const,
      kmsAdapter: null,
      kmsKeyRef: null,
    })),
  };
});

vi.mock("@afenda/object-storage/server", () => ({
  assertObjectStorageConfigured: vi.fn(() => ({
    configured: true,
    provider: "r2",
    r2: {
      bucket: "axis-attachments",
      endpoint: "https://example.r2.cloudflarestorage.com",
      accessKeyId: "key",
      secretAccessKey: "secret",
    },
  })),
}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

vi.mock("../../src/tenant-execution/data/system-admin.document-quarantine-inbox.read-model.server", () => ({
  loadSystemAdminDocumentQuarantineInboxWindow: vi.fn(async () => ({
    rows: [],
    pageSize: 25,
    totalCount: 0,
    hasNextPage: false,
  })),
}));

vi.mock("../../src/tenant-execution/data/system-admin.organization-storage-quota.read-model.server", () => ({
  loadOrganizationStorageQuotaSnapshot: vi.fn(async () => ({
    consumedBytes: 1024,
    quotaBytes: 1024 * 1024 * 1024,
    consumedLabel: "1 KB",
    quotaLabel: "1 GB",
    usagePercentLabel: "0%",
    tone: "default" as const,
  })),
}));

vi.mock("../../src/security/data/system-admin.security.query.server", () => ({
  getSystemAdminOrganizationSecuritySettings: vi.fn(async () => ({
    organizationId: "org_a",
    requireMfaForAdmins: true,
    allowedEmailDomains: [],
    sessionMaxAgeMinutes: 720,
    idleTimeoutMinutes: 30,
    requireSensitiveActionConfirmation: true,
    restrictInvitesToAllowedDomains: false,
    adminLockoutProtectionEnabled: true,
    updatedByUserId: null,
    updatedAt: null,
  })),
}));

vi.mock("../../src/security/data/system-admin.security.recent-changes.server", () => ({
  listSystemAdminSecurityRecentChanges: vi.fn(async () => []),
}));

import { buildSystemAdminSecurityPageModel } from "../../src/features/security/sys-security.page-model.server";
import { loadSystemAdminDocumentQuarantineInboxWindow } from "../../src/features/tenant-execution/sys-document-quarantine-inbox.read-model.server";
import { loadOrganizationStorageQuotaSnapshot } from "../../src/features/tenant-execution/sys-organization-storage-quota.read-model.server";

describe("system admin security page model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads quarantine inbox, storage quota, and provider preference together", async () => {
    const model = await buildSystemAdminSecurityPageModel({
      organizationId: "org_a",
      actorId: "user_a",
      actorType: "user",
    });

    expect(loadSystemAdminDocumentQuarantineInboxWindow).toHaveBeenCalledWith({
      organizationId: "org_a",
    });
    expect(loadOrganizationStorageQuotaSnapshot).toHaveBeenCalledWith({
      organizationId: "org_a",
    });
    expect(model.objectStorageProvider).toBe("r2");
    expect(model.encryptionSettings.mode).toBe("platform");
    expect(model.deploymentProvider).toBe("r2");
    expect(model.quarantineWindow.totalCount).toBe(0);
    expect(model.storageQuota.consumedBytes).toBe(1024);
  });
});
