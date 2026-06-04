import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getOrganizationObjectStorageProvider: vi.fn(async () => null),
  updateOrganizationObjectStorageProvider: vi.fn(async () => undefined),
}));

const objectStorageMocks = vi.hoisted(() => ({
  assertObjectStorageConfigured: vi.fn(() => ({
    configured: true,
    provider: "r2" as const,
    r2: {
      bucket: "axis-attachments",
      endpoint: "https://example.r2.cloudflarestorage.com",
      accessKeyId: "key",
      secretAccessKey: "secret",
    },
    vercelBlob: { BLOB_READ_WRITE_TOKEN: "blob-token" },
  })),
}));

vi.mock("@afenda/db", () => dbMocks);
vi.mock("@afenda/object-storage/server", () => objectStorageMocks);
vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("../../src/security/policies/system-admin.security.policy.server", () => ({
  requireSystemAdminSecurityManage: vi.fn(async () => ({
    context: { userId: "user_a", actorType: "user", capabilities: [] },
    organization: { id: "org_a" },
    session: { id: "user_a" },
  })),
}));

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { updateOrganizationObjectStorageProviderAction } from "../../src/features/security/sys-object-storage-provider.actions.server";

describe("updateOrganizationObjectStorageProviderAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getOrganizationObjectStorageProvider.mockResolvedValue(null);
  });

  it("persists org provider preference and writes audit event", async () => {
    const formData = new FormData();
    formData.set("objectStorageProvider", "r2");

    const saved = await updateOrganizationObjectStorageProviderAction(
      undefined,
      formData,
    );

    expect(saved.ok).toBe(true);
    expect(dbMocks.updateOrganizationObjectStorageProvider).toHaveBeenCalledWith({
      organizationId: "org_a",
      objectStorageProvider: "r2",
    });
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.security.object_storage_provider.update",
        targetType: "organization",
        targetId: "org_a",
      }),
    );
  });

  it("rejects R2 preference when R2 is not configured", async () => {
    vi.mocked(objectStorageMocks.assertObjectStorageConfigured).mockReturnValueOnce({
      configured: true,
      provider: "vercel-blob",
      vercelBlob: { BLOB_READ_WRITE_TOKEN: "blob-token" },
    } as never);

    const formData = new FormData();
    formData.set("objectStorageProvider", "r2");

    const result = await updateOrganizationObjectStorageProviderAction(
      undefined,
      formData,
    );

    expect(result.ok).toBe(false);
    expect(dbMocks.updateOrganizationObjectStorageProvider).not.toHaveBeenCalled();
  });
});
